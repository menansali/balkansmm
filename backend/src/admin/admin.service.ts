import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  async getDashboardStats() {
    // 1. Basic Counts
    const totalUsers = await this.prisma.user.count();
    const totalOrders = await this.prisma.order.count();

    // 2. Revenue (Total Charge)
    // 2. Revenue (Total Charge)
    // Combined with financialAgg below to avoid double query

    // 3. Profit Logic (Charge - Cost)
    // We only calculate mostly on Completed orders to be safe, but profit is profit once charged?
    // Let's take all orders that are not canceled.
    const financialAgg = await this.prisma.order.aggregate({
      _sum: { charge: true, cost: true },
      where: { status: { not: 'Canceled' } },
    });

    const revenue = financialAgg._sum.charge || 0;
    const cost = financialAgg._sum.cost || 0;
    const profit = revenue - cost;

    // 4. Recent Orders
    const recentOrders = await this.prisma.order.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { email: true } },
        service: { select: { name: true } },
      },
    });

    return {
      totalUsers,
      totalOrders,
      revenue,
      profit,
      recentOrders,
    };
  }

  async getUsers() {
    return this.prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      include: { _count: { select: { orders: true } } },
    });
  }

  async updateUser(id: number, data: { balance?: number; role?: string }) {
    return this.prisma.user.update({
      where: { id },
      data,
    });
  }

  // --- Announcements ---

  async createAnnouncement(message: string, type: string) {
    return await this.prisma.announcement.create({
      data: { message, type },
    });
  }

  async deleteAnnouncement(id: number) {
    return await this.prisma.announcement.delete({
      where: { id },
    });
  }

  async getActiveAnnouncements() {
    return await this.prisma.announcement.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getAllAnnouncements() {
    return await this.prisma.announcement.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }
}
