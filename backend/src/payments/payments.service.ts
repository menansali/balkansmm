import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import axios from 'axios';

@Injectable()
export class PaymentsService {
    private readonly logger = new Logger(PaymentsService.name);

    constructor(private prisma: PrismaService) { }

    async createDeposit(userId: number, amount: number, gateway: string) {
        if (gateway === 'coinbase') {
            const apiKey = process.env.COINBASE_API_KEY;

            if (!apiKey) this.logger.warn('COINBASE_API_KEY missing');

            try {
                const chargeData = {
                    name: 'BalkanSMM Fund Deposit',
                    description: `Deposit for User #${userId}`,
                    local_price: { amount: amount.toString(), currency: 'USD' },
                    pricing_type: 'fixed_price',
                    metadata: { userId: userId.toString() },
                    redirect_url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/dashboard`,
                    cancel_url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/dashboard/add-funds`,
                };

                const response = await axios.post('https://api.commerce.coinbase.com/charges', chargeData, {
                    headers: {
                        'X-CC-Api-Key': apiKey,
                        'X-CC-Version': '2018-03-22',
                        'Content-Type': 'application/json'
                    }
                });

                const tx: any = await this.prisma.transaction.create({
                    data: {
                        userId,
                        amount,
                        type: 'deposit',
                        gateway: 'coinbase',
                        gatewayTxId: response.data.data.code,
                        gatewayStatus: 'pending'
                    } as any
                });

                return {
                    transactionId: tx.id,
                    gatewayUrl: response.data.data.hosted_url,
                    gatewayTxId: tx.gatewayTxId
                };
            } catch (e: any) {
                this.logger.error('Coinbase Charge Creation Failed', e?.response?.data || e.message);
                if (process.env.NODE_ENV === 'production') throw new BadRequestException('Payment gateway error');
            }
        }

        // Mock Fallback (for testing / manual)
        const tx: any = await this.prisma.transaction.create({
            data: {
                userId,
                amount,
                type: 'deposit',
                gateway: gateway || 'mock',
                gatewayStatus: 'pending',
                gatewayTxId: `TX_${Date.now()}_${Math.floor(Math.random() * 1000)}`
            } as any
        });

        this.logger.log(`Created mock deposit for User ${userId}: $${amount}`);

        return {
            transactionId: tx.id,
            gatewayUrl: `http://localhost:3000/dashboard/add-funds?mock_success=true&amount=${amount}`,
            gatewayTxId: tx.gatewayTxId
        };
    }

    async processWebhook(userId: number, amount: number, secret: string, txId?: string) {
        // Mock Signature Verification
        if (secret !== 'my_mock_secret') {
            throw new BadRequestException('Invalid signature');
        }

        this.logger.log(`Processing deposit webhook: $${amount} for User ${userId}`);

        return this.prisma.$transaction(async (tx) => {
            // If we have a specific txId (from gateway), update it
            if (txId) {
                const existingTx: any = await tx.transaction.findFirst({ where: { gatewayTxId: txId } } as any);
                if (existingTx && existingTx.gatewayStatus === 'completed') {
                    return { success: true, message: 'Already processed' };
                }

                if (existingTx) {
                    await tx.transaction.update({
                        where: { id: existingTx.id },
                        data: { gatewayStatus: 'completed' } as any
                    });
                }
            }

            // Update User Balance
            const user = await tx.user.update({
                where: { id: userId },
                data: { balance: { increment: amount } }
            });

            // Affiliate Commission (10%)
            if (user.referredById) {
                const commission = amount * 0.10;
                await tx.user.update({
                    where: { id: user.referredById },
                    data: { affiliateBalance: { increment: commission } }
                });
                this.logger.log(`Affiliate commission $${commission} credited to referrer ${user.referredById}`);
            }

            return { success: true, newBalance: user.balance };
        });
    }
}
