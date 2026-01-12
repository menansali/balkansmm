import {
    Injectable,
    NotFoundException,
    BadRequestException,
    ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';

interface CreateStoreDto {
    storeName: string;
    storeSlug: string;
    customDomain?: string;
    logoUrl?: string;
    primaryColor?: string;
    secondaryColor?: string;
    markupPercent?: number;
    supportEmail?: string;
    welcomeMessage?: string;
}

interface CreateCustomerDto {
    email: string;
    password: string;
    name?: string;
}

interface CreateOrderDto {
    serviceId: number;
    link: string;
    quantity: number;
}

@Injectable()
export class ResellerService {
    constructor(private prisma: PrismaService) { }

    // ============================================
    // STORE MANAGEMENT
    // ============================================

    async createStore(userId: number, data: CreateStoreDto) {
        const existingStore = await this.prisma.resellerStore.findUnique({
            where: { ownerId: userId },
        });

        if (existingStore) {
            throw new ConflictException('You already have a reseller store');
        }

        const slugExists = await this.prisma.resellerStore.findUnique({
            where: { storeSlug: data.storeSlug },
        });

        if (slugExists) {
            throw new ConflictException('This store slug is already taken');
        }

        return this.prisma.resellerStore.create({
            data: {
                ownerId: userId,
                storeName: data.storeName,
                storeSlug: data.storeSlug.toLowerCase().replace(/[^a-z0-9-]/g, ''),
                customDomain: data.customDomain,
                logoUrl: data.logoUrl,
                primaryColor: data.primaryColor || '#e11d48',
                secondaryColor: data.secondaryColor || '#7c3aed',
                markupPercent: data.markupPercent || 30,
                supportEmail: data.supportEmail,
                welcomeMessage: data.welcomeMessage,
            },
        });
    }

    async getStore(userId: number) {
        const store = await this.prisma.resellerStore.findUnique({
            where: { ownerId: userId },
            include: {
                customers: {
                    include: {
                        orders: true,
                    },
                },
            },
        });

        if (!store) {
            throw new NotFoundException('No reseller store found');
        }

        return store;
    }

    async updateStore(userId: number, data: Partial<CreateStoreDto>) {
        const store = await this.prisma.resellerStore.findUnique({
            where: { ownerId: userId },
        });

        if (!store) {
            throw new NotFoundException('No reseller store found');
        }

        if (data.storeSlug && data.storeSlug !== store.storeSlug) {
            const slugExists = await this.prisma.resellerStore.findFirst({
                where: { storeSlug: data.storeSlug, id: { not: store.id } },
            });
            if (slugExists) {
                throw new ConflictException('This store slug is already taken');
            }
        }

        return this.prisma.resellerStore.update({
            where: { id: store.id },
            data: {
                ...data,
                storeSlug: data.storeSlug?.toLowerCase().replace(/[^a-z0-9-]/g, ''),
            },
        });
    }

    async getStoreDashboard(userId: number) {
        const store = await this.getStore(userId);

        const totalCustomers = store.customers.length;
        const totalOrders = store.customers.reduce((sum, c) => sum + c.orders.length, 0);
        const totalRevenue = store.customers.reduce(
            (sum, c) => sum + c.orders.reduce((s, o) => s + o.charge, 0),
            0,
        );
        const totalProfit = store.customers.reduce(
            (sum, c) => sum + c.orders.reduce((s, o) => s + o.profit, 0),
            0,
        );

        const recentOrders = await this.prisma.resellerOrder.findMany({
            where: {
                customer: { storeId: store.id },
            },
            orderBy: { createdAt: 'desc' },
            take: 10,
            include: { customer: true },
        });

        return {
            store: {
                id: store.id,
                storeName: store.storeName,
                storeSlug: store.storeSlug,
                customDomain: store.customDomain,
                isActive: store.isActive,
            },
            stats: {
                totalCustomers,
                totalOrders,
                totalRevenue: totalRevenue.toFixed(2),
                totalProfit: totalProfit.toFixed(2),
            },
            recentOrders,
        };
    }

    // ============================================
    // CUSTOMER MANAGEMENT
    // ============================================

    async getCustomers(userId: number) {
        const store = await this.prisma.resellerStore.findUnique({
            where: { ownerId: userId },
        });

        if (!store) throw new NotFoundException('Store not found');

        return this.prisma.resellerCustomer.findMany({
            where: { storeId: store.id },
            include: {
                _count: { select: { orders: true } },
            },
            orderBy: { createdAt: 'desc' },
        });
    }

    async addBalance(userId: number, customerId: number, amount: number) {
        const store = await this.prisma.resellerStore.findUnique({
            where: { ownerId: userId },
        });

        if (!store) throw new NotFoundException('Store not found');

        const customer = await this.prisma.resellerCustomer.findFirst({
            where: { id: customerId, storeId: store.id },
        });

        if (!customer) throw new NotFoundException('Customer not found');

        // Deduct from reseller's main balance
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!user || user.balance < amount) {
            throw new BadRequestException('Insufficient balance');
        }

        await this.prisma.$transaction([
            this.prisma.user.update({
                where: { id: userId },
                data: { balance: { decrement: amount } },
            }),
            this.prisma.resellerCustomer.update({
                where: { id: customerId },
                data: { balance: { increment: amount } },
            }),
        ]);

        return { success: true };
    }

    // ============================================
    // PUBLIC STORE APIS (For white-label frontend)
    // ============================================

    async getStoreBySlug(slug: string) {
        const store = await this.prisma.resellerStore.findUnique({
            where: { storeSlug: slug },
        });

        if (!store || !store.isActive) {
            throw new NotFoundException('Store not found');
        }

        return {
            id: store.id,
            storeName: store.storeName,
            logoUrl: store.logoUrl,
            primaryColor: store.primaryColor,
            secondaryColor: store.secondaryColor,
            welcomeMessage: store.welcomeMessage,
        };
    }

    async getStoreServices(slug: string) {
        const store = await this.prisma.resellerStore.findUnique({
            where: { storeSlug: slug },
        });

        if (!store) throw new NotFoundException('Store not found');

        const services = await this.prisma.service.findMany({
            where: { status: true },
        });

        // Apply markup
        return services.map((s) => ({
            id: s.id,
            name: s.name,
            category: s.category,
            description: s.description,
            rate: parseFloat((s.rate * (1 + store.markupPercent / 100)).toFixed(2)),
            min: s.min,
            max: s.max,
        }));
    }

    async registerCustomer(slug: string, data: CreateCustomerDto) {
        const store = await this.prisma.resellerStore.findUnique({
            where: { storeSlug: slug },
        });

        if (!store) throw new NotFoundException('Store not found');

        const existing = await this.prisma.resellerCustomer.findUnique({
            where: { storeId_email: { storeId: store.id, email: data.email } },
        });

        if (existing) throw new ConflictException('Email already registered');

        const hashedPassword = await bcrypt.hash(data.password, 10);

        return this.prisma.resellerCustomer.create({
            data: {
                storeId: store.id,
                email: data.email,
                password: hashedPassword,
                name: data.name,
            },
        });
    }

    async loginCustomer(slug: string, email: string, password: string) {
        const store = await this.prisma.resellerStore.findUnique({
            where: { storeSlug: slug },
        });

        if (!store) throw new NotFoundException('Store not found');

        const customer = await this.prisma.resellerCustomer.findUnique({
            where: { storeId_email: { storeId: store.id, email } },
        });

        if (!customer) throw new BadRequestException('Invalid credentials');

        const valid = await bcrypt.compare(password, customer.password);
        if (!valid) throw new BadRequestException('Invalid credentials');

        return {
            id: customer.id,
            email: customer.email,
            name: customer.name,
            balance: customer.balance,
        };
    }

    async createCustomerOrder(slug: string, customerId: number, data: CreateOrderDto) {
        const store = await this.prisma.resellerStore.findUnique({
            where: { storeSlug: slug },
        });

        if (!store) throw new NotFoundException('Store not found');

        const customer = await this.prisma.resellerCustomer.findFirst({
            where: { id: customerId, storeId: store.id },
        });

        if (!customer) throw new NotFoundException('Customer not found');

        const service = await this.prisma.service.findUnique({
            where: { id: data.serviceId },
        });

        if (!service) throw new NotFoundException('Service not found');

        const baseCharge = (service.rate / 1000) * data.quantity;
        const charge = parseFloat((baseCharge * (1 + store.markupPercent / 100)).toFixed(2));
        const cost = baseCharge;
        const profit = charge - cost;

        if (customer.balance < charge) {
            throw new BadRequestException('Insufficient balance');
        }

        // Create order and deduct balance
        const [order] = await this.prisma.$transaction([
            this.prisma.resellerOrder.create({
                data: {
                    customerId: customer.id,
                    serviceId: service.id,
                    link: data.link,
                    quantity: data.quantity,
                    charge,
                    cost,
                    profit,
                },
            }),
            this.prisma.resellerCustomer.update({
                where: { id: customer.id },
                data: {
                    balance: { decrement: charge },
                    totalSpent: { increment: charge },
                },
            }),
            this.prisma.resellerStore.update({
                where: { id: store.id },
                data: {
                    totalRevenue: { increment: charge },
                    totalOrders: { increment: 1 },
                },
            }),
        ]);

        return order;
    }

    async getCustomerOrders(slug: string, customerId: number) {
        const store = await this.prisma.resellerStore.findUnique({
            where: { storeSlug: slug },
        });

        if (!store) throw new NotFoundException('Store not found');

        return this.prisma.resellerOrder.findMany({
            where: {
                customerId,
                customer: { storeId: store.id },
            },
            orderBy: { createdAt: 'desc' },
        });
    }
}
