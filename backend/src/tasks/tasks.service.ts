import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import { MoreThanPanelProvider } from '../providers/morethanpanel.provider';
import { JustAnotherPanelProvider } from '../providers/justanotherpanel.provider';

@Injectable()
export class TasksService {
  private readonly logger = new Logger(TasksService.name);

  constructor(
    private prisma: PrismaService,
    private moreThanPanel: MoreThanPanelProvider,
    private justAnotherPanel: JustAnotherPanelProvider,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async syncServices() {
    this.logger.debug('Syncing services from providers...');
    // Example logic: fetch from provider and upsert into DB
    await Promise.resolve();
    // const services = await this.moreThanPanel.getServices();
    // ... save to DB
  }

  @Cron(CronExpression.EVERY_10_MINUTES)
  async checkOrderStatuses() {
    this.logger.debug('Checking pending order statuses...');
    const pendingOrders = await this.prisma.order.findMany({
      where: { status: { in: ['pending', 'processing'] } },
    });

    for (const order of pendingOrders) {
      if (!order.providerOrderId) continue;

      const provider =
        order.provider === 'morethanpanel'
          ? this.moreThanPanel
          : this.justAnotherPanel;
      const statusData = await provider.getOrderStatus(order.providerOrderId);

      if (statusData.status && statusData.status !== order.status) {
        await this.prisma.order.update({
          where: { id: order.id },
          data: { status: statusData.status },
        });
        this.logger.debug(
          `Updated Order hash #${order.id} to ${statusData.status}`,
        );
      }
    }
  }
}
