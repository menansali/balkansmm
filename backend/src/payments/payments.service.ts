import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PaymentsService {
    private readonly logger = new Logger(PaymentsService.name);

    constructor(private prisma: PrismaService) { }

    async processWebhook(userId: number, amount: number, secret: string) {
        // Mock Signature Verification
        if (secret !== 'my_mock_secret') {
            throw new BadRequestException('Invalid signature');
        }

        this.logger.log(`Processing deposit of $${amount} for User ${userId}`);

        return this.prisma.$transaction(async (tx) => {
            const user = await tx.user.update({
                where: { id: userId },
                data: { balance: { increment: amount } }
            });

            await tx.transaction.create({
                data: {
                    userId,
                    amount,
                    type: 'deposit'
                }
            });

            return { success: true, newBalance: user.balance };
        });
    }
}
