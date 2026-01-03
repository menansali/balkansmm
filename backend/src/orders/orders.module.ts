import { Module } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { MoreThanPanelProvider } from '../providers/morethanpanel.provider';
import { JustAnotherPanelProvider } from '../providers/justanotherpanel.provider';

@Module({
  imports: [PrismaModule],
  controllers: [OrdersController],
  providers: [OrdersService, MoreThanPanelProvider, JustAnotherPanelProvider],
})
export class OrdersModule { }
