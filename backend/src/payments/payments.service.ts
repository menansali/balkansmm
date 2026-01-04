import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PaymentsService {
    private readonly logger = new Logger(PaymentsService.name);

    constructor(private prisma: PrismaService) { }

    async createDeposit(userId: number, amount: number, gateway: string) {
        // 1. Create a Pending Transaction
        const tx = await this.prisma.transaction.create({
            data: {
                userId,
                amount,
                type: 'deposit',
                gateway,
                gatewayStatus: 'pending',
                gatewayTxId: `TX_${Date.now()}_${Math.floor(Math.random() * 1000)}` // Mock external ID
            }
        });

        // 2. Return Check-out URL (or mock payload)
        // In real life, you call Coinbase/Stripe API here.
        this.logger.log(`Created deposit intent for User ${userId}: $${amount} via ${gateway}`);

        return {
            transactionId: tx.id,
            gatewayUrl: `http://localhost:3000/dashboard/add-funds/process?tx=${tx.gatewayTxId}&amount=${amount}`,
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
                const existingTx = await tx.transaction.findFirst({ where: { gatewayTxId: txId } });
                if (existingTx && existingTx.gatewayStatus === 'completed') {
                    return { success: true, message: 'Already processed' };
                }

                if (existingTx) {
                    await tx.transaction.update({
                        where: { id: existingTx.id },
                        data: { gatewayStatus: 'completed' }
                    });
                }
            }

            // Update User Balance
            const user = await tx.user.update({
                where: { id: userId },
                data: { balance: { increment: amount } }
            });

            // If no Tx existed (manual hook?), create one? 
            // Better to assume createDeposit was called properly.

            return { success: true, newBalance: user.balance };
        });
    }
}
