import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
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
import { AnalyticsModule } from './analytics/analytics.module';
import { SchedulerModule } from './scheduler/scheduler.module';
import { ResellerModule } from './reseller/reseller.module';
import { HappyHourModule } from './happy-hour/happy-hour.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ScheduleModule.forRoot(),
    ThrottlerModule.forRoot([
      {
        name: 'short',
        ttl: 1000,
        limit: 3,
      },
      {
        name: 'medium',
        ttl: 10000,
        limit: 20,
      },
      {
        name: 'long',
        ttl: 60000,
        limit: 100,
      },
    ]),
    AuthModule,
    UsersModule,
    PrismaModule,
    ServicesModule,
    OrdersModule,
    TicketsModule,
    AdminModule,
    MailModule,
    PaymentsModule,
    AnalyticsModule,
    SchedulerModule,
    ResellerModule,
    HappyHourModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    MoreThanPanelProvider,
    JustAnotherPanelProvider,
    TasksService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule { }

