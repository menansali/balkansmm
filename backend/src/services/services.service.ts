import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import axios from 'axios';
import * as cheerio from 'cheerio';
import { UpdateServiceDto } from './dto/update-service.dto';
import { JustAnotherPanelProvider } from '../providers/justanotherpanel.provider';
import { MoreThanPanelProvider } from '../providers/morethanpanel.provider';

@Injectable()
export class ServicesService {
  private readonly logger = new Logger(ServicesService.name);

  constructor(
    // Prisma Service Injection
    private prisma: PrismaService,
    private japProvider: JustAnotherPanelProvider,
    private mtpProvider: MoreThanPanelProvider,
  ) {}

  async syncServices(
    providerKey: 'justanotherpanel' | 'morethanpanel',
    marginPercent: number,
  ) {
    const provider =
      providerKey === 'justanotherpanel' ? this.japProvider : this.mtpProvider;
    const services = await provider.getServices();
    const multiplier = 1 + marginPercent / 100;
    let count = 0;

    for (const s of services) {
      // Typically API returns: { service: 1, name: '...', rate: '0.001', min: 100, max: 10000, category: '...' }
      // JAP/MTP format usually: service, name, type, rate, min, max, category

      const providerRate = parseFloat(s.rate);
      const newRate = Number((providerRate * multiplier).toFixed(4));

      // Upsert Service
      // We check if we already have this provider + providerServiceId
      const existing = await this.prisma.service.findFirst({
        where: { provider: providerKey, providerServiceId: String(s.service) },
      });

      if (existing) {
        await this.prisma.service.update({
          where: { id: existing.id },
          data: {
            rate: newRate,
            providerRate: providerRate,
            min: Number(s.min),
            max: Number(s.max),
            name: s.name, // optional: keep our name or sync theirs
            category: s.category,
            description: s.description || s.desc || null,
          } as any,
        });
      } else {
        await this.prisma.service.create({
          data: {
            name: s.name,
            category: s.category,
            description: s.description || s.desc || null,
            rate: newRate,
            providerRate: providerRate,
            min: Number(s.min),
            max: Number(s.max),
            provider: providerKey,
            providerServiceId: String(s.service),
            status: true,
          } as any,
        });
        count++;
      }
    }
    return { synced: services.length, added: count };
  }

  async fetchMetadata(url: string) {
    try {
      // Basic generic scraper
      const { data } = await axios.get(url, {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
        },
      });
      const $ = cheerio.load(data);
      const image = $('meta[property="og:image"]').attr('content') || '';
      const title =
        $('meta[property="og:title"]').attr('content') ||
        $('title').text() ||
        '';
      const description =
        $('meta[property="og:description"]').attr('content') || '';

      // Stats parsing (Very basic regex for demonstration)
      // Real implementation would need specific parsers for IG/TikTok/YT or API connection
      return { title, image, description };
    } catch {
      return { title: 'Link Preview', image: '', description: '' };
    }
  }

  async updateGlobalMargin(percentage: number) {
    // safety check
    if (percentage < 0) return;
    const multiplier = 1 + percentage / 100;

    // We only update services that have a providerRate set
    // This query updates rate = providerRate * multiplier
    // Prisma doesn't support field-reference updates directly in massive update easily without raw query
    // giving the "database agnosticism", but since we use PG, we can use raw query or loop.
    // Looping is safer for now to avoid complexity with Raw SQL in this context.

    const services = await this.prisma.service.findMany({
      where: { providerRate: { not: null } },
    });

    for (const str of services) {
      if (str.providerRate) {
        await this.prisma.service.update({
          where: { id: str.id },
          data: { rate: Number((str.providerRate * multiplier).toFixed(4)) },
        });
      }
    }
    return { count: services.length };
  }

  create(data: any) {
    return this.prisma.service.create({ data });
  }

  findAll() {
    return this.prisma.service.findMany({
      where: { status: true },
      orderBy: { id: 'asc' },
    });
  }

  findAllAdmin() {
    return this.prisma.service.findMany({
      orderBy: { id: 'asc' },
    });
  }

  findOne(id: number) {
    return this.prisma.service.findUnique({ where: { id } });
  }

  update(id: number, updateServiceDto: UpdateServiceDto) {
    return this.prisma.service.update({
      where: { id },
      data: updateServiceDto,
    });
  }

  remove(id: number) {
    return this.prisma.service.delete({ where: { id } });
  }
}
