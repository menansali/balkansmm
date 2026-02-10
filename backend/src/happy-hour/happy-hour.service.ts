import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

interface CreateHappyHourDto {
  name: string;
  discountPercent: number;
  categories?: string[];
  platforms?: string[];
  startTime: string;
  endTime: string;
  isRecurring?: boolean;
  recurringDays?: number[];
  recurringStart?: string;
  recurringEnd?: string;
}

@Injectable()
export class HappyHourService {
  constructor(private prisma: PrismaService) {}

  async getActiveHappyHour() {
    const now = new Date();
    const currentDay = now.getDay();
    const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    // Check one-time happy hours
    const oneTimeHappyHour = await this.prisma.happyHour.findFirst({
      where: {
        isActive: true,
        isRecurring: false,
        startTime: { lte: now },
        endTime: { gte: now },
      },
      orderBy: { discountPercent: 'desc' },
    });

    if (oneTimeHappyHour) {
      return {
        id: oneTimeHappyHour.id,
        name: oneTimeHappyHour.name,
        discountPercent: oneTimeHappyHour.discountPercent,
        categories: oneTimeHappyHour.categories,
        platforms: oneTimeHappyHour.platforms,
        endsAt: oneTimeHappyHour.endTime.toISOString(),
        isRecurring: false,
      };
    }

    // Check recurring happy hours
    const recurringHappyHours = await this.prisma.happyHour.findMany({
      where: {
        isActive: true,
        isRecurring: true,
        recurringDays: { has: currentDay },
      },
    });

    for (const hh of recurringHappyHours) {
      if (hh.recurringStart && hh.recurringEnd) {
        if (
          currentTime >= hh.recurringStart &&
          currentTime <= hh.recurringEnd
        ) {
          const [endHour, endMin] = hh.recurringEnd.split(':').map(Number);
          const endsAt = new Date();
          endsAt.setHours(endHour, endMin, 0, 0);

          return {
            id: hh.id,
            name: hh.name,
            discountPercent: hh.discountPercent,
            categories: hh.categories,
            platforms: hh.platforms,
            endsAt: endsAt.toISOString(),
            isRecurring: true,
          };
        }
      }
    }

    return null;
  }

  async getAllHappyHours() {
    return this.prisma.happyHour.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async createHappyHour(data: CreateHappyHourDto) {
    return this.prisma.happyHour.create({
      data: {
        name: data.name,
        discountPercent: data.discountPercent,
        categories: data.categories || [],
        platforms: data.platforms || [],
        startTime: new Date(data.startTime),
        endTime: new Date(data.endTime),
        isRecurring: data.isRecurring || false,
        recurringDays: data.recurringDays || [],
        recurringStart: data.recurringStart,
        recurringEnd: data.recurringEnd,
      },
    });
  }

  async updateHappyHour(id: number, data: Partial<CreateHappyHourDto>) {
    return this.prisma.happyHour.update({
      where: { id },
      data: {
        ...data,
        startTime: data.startTime ? new Date(data.startTime) : undefined,
        endTime: data.endTime ? new Date(data.endTime) : undefined,
      },
    });
  }

  async deleteHappyHour(id: number) {
    await this.prisma.happyHour.delete({ where: { id } });
    return { success: true };
  }

  async toggleHappyHour(id: number) {
    const hh = await this.prisma.happyHour.findUnique({ where: { id } });
    if (!hh) return null;

    return this.prisma.happyHour.update({
      where: { id },
      data: { isActive: !hh.isActive },
    });
  }

  // Calculate discounted price for a service
  calculateDiscountedPrice(
    originalPrice: number,
    discountPercent: number,
    serviceCategory: string,
    servicePlatform: string,
    happyHourCategories: string[],
    happyHourPlatforms: string[],
  ): number {
    // Check if service qualifies for discount
    const categoryMatch =
      happyHourCategories.length === 0 ||
      happyHourCategories.some((cat) =>
        serviceCategory.toLowerCase().includes(cat.toLowerCase()),
      );

    const platformMatch =
      happyHourPlatforms.length === 0 ||
      happyHourPlatforms.some((plat) =>
        serviceCategory.toLowerCase().includes(plat.toLowerCase()),
      );

    if (categoryMatch && platformMatch) {
      return originalPrice * (1 - discountPercent / 100);
    }

    return originalPrice;
  }
}
