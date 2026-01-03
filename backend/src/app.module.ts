import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { ThrottlerModule } from '@nestjs/throttler';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { PrismaModule } from './prisma/prisma.module';
import { ServicesModule } from './services/services.module';
import { OrdersModule } from './orders/orders.module';
import { MoreThanPanelProvider } from './providers/morethanpanel.provider';
import { JustAnotherPanelProvider } from './providers/justanotherpanel.provider';
import { TasksService } from './tasks/tasks.service';
import { TicketsModule } from './tickets/tickets.module';
import { AdminModule } from './admin/admin.module';
import { MailModule } from './mail/mail.module';
import { PaymentsModule } from './payments/payments.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    ScheduleModule.forRoot(),
    ThrottlerModule.forRoot([{
      ttl: 60000,
      limit: 100,
    }]),
    AuthModule,
    UsersModule,
    PrismaModule,
    ServicesModule,
    OrdersModule,
    TicketsModule,
    AdminModule,
    MailModule,
    PaymentsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    MoreThanPanelProvider,
    JustAnotherPanelProvider,
    TasksService
  ],
})
export class AppModule { }
