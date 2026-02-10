import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Request,
  Query,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { AuthGuard } from '@nestjs/passport';
import type { RequestWithUser } from '../common/types';

@UseGuards(AuthGuard('jwt'))
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  create(
    @Request() req: RequestWithUser,
    @Body() createOrderDto: CreateOrderDto,
  ) {
    return this.ordersService.create(req.user.userId, createOrderDto);
  }

  @Get()
  findAll(
    @Request() req: RequestWithUser,
    @Query('page') page: string,
    @Query('limit') limit: string,
  ) {
    return this.ordersService.findAll(
      req.user.userId,
      page ? Number(page) : 1,
      limit ? Number(limit) : 10,
    );
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.ordersService.findOne(+id);
  }

  @Post(':id/refill')
  refill(@Request() req: RequestWithUser, @Param('id') id: string) {
    return this.ordersService.refillOrder(req.user.userId, +id);
  }
}
