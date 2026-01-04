import { Controller, Post, Body, BadRequestException, Request, UseGuards } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('payments')
export class PaymentsController {
    constructor(private readonly paymentsService: PaymentsService) { }

    @Post('webhook')
    async handleWebhook(@Body() body: { userId: number; amount: number; secret: string; txId?: string }) {
        if (!body.userId || !body.amount || !body.secret) {
            throw new BadRequestException('Missing parameters');
        }
        // Usually webhook data comes from provider (Coinbase), but we simulate it
        return this.paymentsService.processWebhook(body.userId, body.amount, body.secret, body.txId);
    }

    @UseGuards(JwtAuthGuard)
    @Post('deposit')
    async createDeposit(@Request() req: any, @Body() body: { amount: number; gateway: string }) {
        return this.paymentsService.createDeposit(req.user.userId, body.amount, body.gateway || 'mock');
    }
}
