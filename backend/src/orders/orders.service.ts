import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { MoreThanPanelProvider } from '../providers/morethanpanel.provider';
import { JustAnotherPanelProvider } from '../providers/justanotherpanel.provider';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class OrdersService {
  private readonly logger = new Logger(OrdersService.name);

  constructor(
    private prisma: PrismaService,
    private moreThanPanel: MoreThanPanelProvider,
    private justAnotherPanel: JustAnotherPanelProvider,
  ) { }

  @Cron('*/5 * * * *') // Runs every 5 minutes
  async handleOrderSync() {
    this.logger.debug('Running Order Sync Cron...');

    // Fetch orders that are not final
    const activeOrders = await this.prisma.order.findMany({
      where: {
        status: { in: ['Pending', 'Processing', 'In progress'] },
        providerOrderId: { not: null }
      },
      take: 50, // Batch limit for scalability
      orderBy: { updatedAt: 'asc' }, // Check oldest updates first
      include: { service: true }
    });

    this.logger.debug(`Found ${activeOrders.length} active orders to sync.`);

    for (const order of activeOrders) {
      try {
        const provider = order.provider === 'morethanpanel' ? this.moreThanPanel : this.justAnotherPanel;
        const remoteStatus = await provider.getOrderStatus(order.providerOrderId!);

        // remoteStatus format: { status: 'Completed', remains: '0', currency: 'USD' }
        if (remoteStatus && remoteStatus.status) {
          const newStatus = this.mapStatus(remoteStatus.status); // Normalizing status

          if (newStatus !== order.status) {
            await this.updateOrderStatus(order.id, newStatus, remoteStatus.remains);
          }
        }
      } catch (e) {
        this.logger.error(`Failed to sync order ${order.id}`, e);
      }
    }
  }

  private mapStatus(providerStatus: string): string {
    // Normalize different provider statuses if needed
    // JAP/MTP usually use standard: Pending, Processing, In progress, Completed, Partial, Canceled
    // We capitalize just in case
    const s = providerStatus.toLowerCase();
    if (s.includes('complete')) return 'Completed';
    if (s.includes('process') || s.includes('progress')) return 'Processing';
    if (s.includes('cancel')) return 'Canceled';
    if (s.includes('partial')) return 'Partial';
    return 'Pending';
  }

  private async updateOrderStatus(orderId: number, status: string, remains?: string) {
    await this.prisma.$transaction(async (tx) => {
      const order = await tx.order.findUnique({ where: { id: orderId } });
      if (!order) return;

      // Refund Logic
      if ((status === 'Canceled' || status === 'Partial') && order.status !== 'Canceled' && order.status !== 'Partial') {
        let refundAmount = 0;
        if (status === 'Canceled') {
          refundAmount = order.charge;
        } else if (status === 'Partial' && remains) {
          const rem = parseInt(remains);
          const unitPrice = order.charge / order.quantity;
          refundAmount = unitPrice * rem;
        }

        if (refundAmount > 0) {
          await tx.user.update({
            where: { id: order.userId },
            data: { balance: { increment: refundAmount } }
          });

          await tx.transaction.create({
            data: {
              userId: order.userId,
              amount: refundAmount,
              type: 'refund' // Fixed type
            }
          });
          this.logger.log(`Refunded ${refundAmount} to User ${order.userId} for Order ${orderId} (${status})`);
        }
      }

      await tx.order.update({
        where: { id: orderId },
        data: { status }
      });
    });
  }

  async create(userId: number, createOrderDto: CreateOrderDto) {
    // 1. Get Service and User
    const service = await this.prisma.service.findUnique({ where: { id: createOrderDto.serviceId } });
    if (!service) throw new BadRequestException('Service not found');

    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new BadRequestException('User not found');

    // 2. Calculate Cost
    const charge = (service.rate * createOrderDto.quantity) / 1000;

    // 3. Check Balance
    if (user.balance < charge) {
      throw new BadRequestException('Insufficient balance');
    }

    // 4. Determine Provider
    const provider = service.provider === 'morethanpanel' ? this.moreThanPanel : this.justAnotherPanel;

    // 5. Place Order with Provider
    let providerResponse;
    try {
      providerResponse = await provider.createOrder(
        service.providerServiceId,
        createOrderDto.link,
        createOrderDto.quantity,
        createOrderDto.runs,
        createOrderDto.interval
      );
    } catch (e) {
      throw new BadRequestException(`Provider Error: ${e.message}`);
    }

    if (!providerResponse.order) {
      // Some APIs return { order: 123 }, others { order: "123" }
      // Fallback for mock if API fails in dev mode, but strictly we should fail.
      // For now, if we are in dev and no keys, we might want to fail or mock.
      // Assuming production readiness:
      throw new BadRequestException('Failed to place order with provider');
    }

    // 6. DB Transaction: Deduct Balance, Create Order, Create Transaction Record
    return this.prisma.$transaction(async (tx) => {
      // Deduct balance
      await tx.user.update({
        where: { id: userId },
        data: { balance: { decrement: charge } },
      });

      // Create Order
      const order = await tx.order.create({
        data: {
          userId,
          serviceId: service.id,
          link: createOrderDto.link,
          quantity: createOrderDto.quantity,
          charge,
          provider: service.provider,
          providerOrderId: providerResponse.order.toString(),
          status: 'pending',
          dripFeed: createOrderDto.dripFeed,
          runs: createOrderDto.runs,
          interval: createOrderDto.interval
        },
      });

      // Create Transaction Log
      await tx.transaction.create({
        data: {
          userId,
          amount: charge,
          type: 'order_charge',
        },
      });

      return order;
    });
  }

  async findAll(userId: number, page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;
    const [orders, total] = await Promise.all([
      this.prisma.order.findMany({
        where: { userId },
        skip,
        take: Number(limit),
        orderBy: { createdAt: 'desc' },
        include: { service: true }
      }),
      this.prisma.order.count({ where: { userId } })
    ]);
    return { data: orders, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  findOne(id: number) {
    return this.prisma.order.findUnique({ where: { id } });
  }
}
