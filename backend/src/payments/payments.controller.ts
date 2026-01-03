import { Controller, Post, Body, BadRequestException, Request, UseGuards } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('payments')
export class PaymentsController {
    constructor(private readonly paymentsService: PaymentsService) { }

    @Post('webhook')
    async handleWebhook(@Body() body: { userId: number; amount: number; secret: string }) {
        if (!body.userId || !body.amount || !body.secret) {
            throw new BadRequestException('Missing parameters');
        }
        // Usually webhook data comes from provider (Coinbase), but we simulate it
        return this.paymentsService.processWebhook(body.userId, body.amount, body.secret);
    }

    @UseGuards(JwtAuthGuard)
    @Post('mock-deposit')
    async mockDeposit(@Request() req: any, @Body() body: { amount: number }) {
        return this.paymentsService.processWebhook(req.user.userId, body.amount, 'my_mock_secret');
    }
}
