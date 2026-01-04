import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { PrismaService } from './prisma/prisma.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService, private prisma: PrismaService) { }

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('activity')
  async getRecentActivity() {
    // Return last 10 orders (anonymized)
    const orders = await this.prisma.order.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: { service: true }
    });

    return orders.map(o => ({
      text: `New order: ${o.service.name}`,
      time: 'Just now'
    }));
  }
}
