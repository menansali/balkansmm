import {
  Controller,
  Post,
  Body,
  BadRequestException,
  Request,
  UseGuards,
  Headers,
} from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateDepositDto } from './dto/create-deposit.dto';
import type { RequestWithUser } from '../common/types';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('webhook')
  async handleWebhook(
    @Body()
    body: {
      userId: number;
      amount: number;
      secret: string;
      txId?: string;
    },
  ) {
    if (!body.userId || !body.amount || !body.secret) {
      throw new BadRequestException('Missing parameters');
    }
    return this.paymentsService.processWebhook(
      body.userId,
      body.amount,
      body.secret,
      body.txId,
    );
  }

  @Post('binance-webhook')
  async handleBinanceWebhook(
    @Body() body: Record<string, unknown>,
    @Headers('binancepay-timestamp') timestamp: string,
    @Headers('binancepay-nonce') nonce: string,
    @Headers('binancepay-signature') signature: string,
  ) {
    if (!timestamp || !nonce || !signature) {
      throw new BadRequestException('Missing Binance Pay headers');
    }
    return this.paymentsService.processBinanceWebhook(
      body,
      timestamp,
      nonce,
      signature,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Post('deposit')
  async createDeposit(
    @Request() req: RequestWithUser,
    @Body() body: CreateDepositDto,
  ) {
    return this.paymentsService.createDeposit(
      req.user.userId,
      body.amount,
      body.gateway || 'mock',
    );
  }
}
