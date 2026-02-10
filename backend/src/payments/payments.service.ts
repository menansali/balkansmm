import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import axios from 'axios';
import * as crypto from 'crypto';

@Injectable()
export class PaymentsService {
    private readonly logger = new Logger(PaymentsService.name);
    private readonly BINANCE_PAY_API = 'https://bpay.binanceapi.com';

    constructor(private prisma: PrismaService) { }

    private generateBinanceSignature(payload: string): string {
        const secretKey = process.env.BINANCE_PAY_SECRET_KEY || '';
        return crypto.createHmac('sha512', secretKey).update(payload).digest('hex').toUpperCase();
    }

    private generateNonce(length = 32): string {
        const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let result = '';
        for (let i = 0; i < length; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
    }


    private sanitizeError(error: any): string {
        if (error?.response?.data) {
            const data = error.response.data;
            return `status=${data.status || 'unknown'}, code=${data.code || data.errorCode || 'unknown'}`;
        }
        return error?.message || 'Unknown error';
    }

    async createDeposit(userId: number, amount: number, gateway: string) {
        if (amount <= 0) {
            throw new BadRequestException('Amount must be greater than 0');
        }
        if (amount > 100000) {
            throw new BadRequestException('Maximum deposit is $100,000');
        }

        if (gateway === 'binance') {
            const apiKey = process.env.BINANCE_PAY_API_KEY;
            const merchantId = process.env.BINANCE_PAY_MERCHANT_ID;

            if (!apiKey || !merchantId) {
                this.logger.warn('BINANCE_PAY credentials missing');
            }

            const timestamp = Date.now();
            const nonce = this.generateNonce();
            const merchantTradeNo = `BSMM${userId}_${timestamp}`;

            try {
                const orderData = {
                    env: {
                        terminalType: 'WEB'
                    },
                    merchantTradeNo,
                    orderAmount: amount.toFixed(2),
                    currency: 'USDT',
                    goods: {
                        goodsType: '02',
                        goodsCategory: 'Z000',
                        referenceGoodsId: `deposit_${userId}`,
                        goodsName: 'BalkanSMM Fund Deposit',
                        goodsDetail: `Deposit for User #${userId}`
                    },
                    returnUrl: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/dashboard`,
                    cancelUrl: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/dashboard/add-funds`,
                    webhookUrl: `${process.env.BACKEND_URL || 'http://localhost:3001'}/payments/binance-webhook`
                };

                const payload = `${timestamp}\n${nonce}\n${JSON.stringify(orderData)}\n`;
                const signature = this.generateBinanceSignature(payload);

                const response = await axios.post(
                    `${this.BINANCE_PAY_API}/binancepay/openapi/v3/order`,
                    orderData,
                    {
                        headers: {
                            'Content-Type': 'application/json',
                            'BinancePay-Timestamp': timestamp.toString(),
                            'BinancePay-Nonce': nonce,
                            'BinancePay-Certificate-SN': apiKey,
                            'BinancePay-Signature': signature
                        }
                    }
                );

                if (response.data.status !== 'SUCCESS') {
                    throw new Error(response.data.errorMessage || 'Binance Pay order creation failed');
                }

                const tx: any = await this.prisma.transaction.create({
                    data: {
                        userId,
                        amount,
                        type: 'deposit',
                        gateway: 'binance',
                        gatewayTxId: merchantTradeNo,
                        gatewayStatus: 'pending'
                    } as any
                });

                return {
                    transactionId: tx.id,
                    gatewayUrl: response.data.data.universalUrl,
                    gatewayTxId: tx.gatewayTxId,
                    qrCodeUrl: response.data.data.qrcodeLink
                };
            } catch (e: any) {
                this.logger.error(`Binance Pay Order Creation Failed: ${this.sanitizeError(e)}`);
                if (process.env.NODE_ENV === 'production') throw new BadRequestException('Payment gateway error');
            }
        }

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

    verifyBinanceWebhookSignature(timestamp: string, nonce: string, body: string, signature: string): boolean {
        const payload = `${timestamp}\n${nonce}\n${body}\n`;
        const expectedSignature = this.generateBinanceSignature(payload);
        return expectedSignature === signature;
    }

    async processBinanceWebhook(payload: any, timestamp: string, nonce: string, signature: string) {
        const isValid = this.verifyBinanceWebhookSignature(timestamp, nonce, JSON.stringify(payload), signature);
        if (!isValid) {
            throw new BadRequestException('Invalid webhook signature');
        }

        const { merchantTradeNo } = payload;
        const bizStatus = payload.bizStatus;

        this.logger.log(`Binance webhook received: ${merchantTradeNo} - Status: ${bizStatus}`);

        if (bizStatus !== 'PAY_SUCCESS') {
            return { returnCode: 'SUCCESS', returnMessage: 'OK' };
        }

        return this.prisma.$transaction(async (tx) => {
            const existingTx: any = await tx.transaction.findFirst({
                where: { gatewayTxId: merchantTradeNo }
            } as any);

            if (!existingTx) {
                this.logger.warn(`Transaction not found: ${merchantTradeNo}`);
                return { returnCode: 'SUCCESS', returnMessage: 'OK' };
            }

            if (existingTx.gatewayStatus === 'completed') {
                return { returnCode: 'SUCCESS', returnMessage: 'Already processed' };
            }

            const updated = await tx.transaction.updateMany({
                where: {
                    id: existingTx.id,
                    gatewayStatus: { not: 'completed' }
                } as any,
                data: { gatewayStatus: 'completed' } as any
            });

            if (updated.count === 0) {
                return { returnCode: 'SUCCESS', returnMessage: 'Already processed' };
            }

            const user = await tx.user.update({
                where: { id: existingTx.userId },
                data: { balance: { increment: existingTx.amount } }
            });

            if (user.referredById) {
                const commission = existingTx.amount * 0.10;
                await tx.user.update({
                    where: { id: user.referredById },
                    data: { affiliateBalance: { increment: commission } }
                });
                this.logger.log(`Affiliate commission $${commission} credited to referrer ${user.referredById}`);
            }

            this.logger.log(`Deposit completed: $${existingTx.amount} for User ${existingTx.userId}`);
            return { returnCode: 'SUCCESS', returnMessage: 'OK' };
        });
    }

    async processWebhook(userId: number, amount: number, secret: string, txId?: string) {
        const expectedSecret = process.env.MOCK_WEBHOOK_SECRET || 'my_mock_secret';
        if (secret !== expectedSecret) {
            throw new BadRequestException('Invalid signature');
        }

        this.logger.log(`Processing deposit webhook: $${amount} for User ${userId}`);

        return this.prisma.$transaction(async (tx) => {
            if (txId) {
                const existingTx: any = await tx.transaction.findFirst({ where: { gatewayTxId: txId } } as any);
                if (existingTx && existingTx.gatewayStatus === 'completed') {
                    return { success: true, message: 'Already processed' };
                }

                if (existingTx) {
                    const updated = await tx.transaction.updateMany({
                        where: {
                            id: existingTx.id,
                            gatewayStatus: { not: 'completed' }
                        } as any,
                        data: { gatewayStatus: 'completed' } as any
                    });

                    if (updated.count === 0) {
                        return { success: true, message: 'Already processed' };
                    }
                }
            }

            const user = await tx.user.update({
                where: { id: userId },
                data: { balance: { increment: amount } }
            });

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
