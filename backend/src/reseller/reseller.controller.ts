import {
    Controller,
    Get,
    Post,
    Put,
    Body,
    Param,
    UseGuards,
    Request,
    ParseIntPipe,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ResellerService } from './reseller.service';
import { Request as ExpressRequest } from 'express';

type AuthRequest = ExpressRequest & { user: { userId: number } };

@Controller('reseller')
@UseGuards(JwtAuthGuard)
export class ResellerController {
    constructor(private resellerService: ResellerService) { }

    @Post('store')
    async createStore(@Request() req: AuthRequest, @Body() body: any) {
        return this.resellerService.createStore(req.user.userId, body);
    }

    @Get('store')
    async getStore(@Request() req: AuthRequest) {
        return this.resellerService.getStore(req.user.userId);
    }

    @Put('store')
    async updateStore(@Request() req: AuthRequest, @Body() body: any) {
        return this.resellerService.updateStore(req.user.userId, body);
    }

    @Get('dashboard')
    async getDashboard(@Request() req: AuthRequest) {
        return this.resellerService.getStoreDashboard(req.user.userId);
    }

    @Get('customers')
    async getCustomers(@Request() req: AuthRequest) {
        return this.resellerService.getCustomers(req.user.userId);
    }

    @Post('customers/:id/add-balance')
    async addBalance(
        @Request() req: AuthRequest,
        @Param('id', ParseIntPipe) id: number,
        @Body('amount') amount: number,
    ) {
        return this.resellerService.addBalance(req.user.userId, id, amount);
    }
}
