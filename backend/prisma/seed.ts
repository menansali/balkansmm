import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import * as dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

async function main() {
    const adminEmail = 'admin@balkansmm.com';
    const adminPassword = await bcrypt.hash('admin123', 10);

    const admin = await prisma.user.upsert({
        where: { email: adminEmail },
        update: {},
        create: {
            email: adminEmail,
            name: 'Admin User',
            password: adminPassword,
            role: 'admin',
            balance: 1000.00,
        },
    });

    console.log({ admin });

    const service1 = await prisma.service.upsert({
        where: { id: 1 },
        update: {},
        create: {
            name: 'Instagram Followers [Real] [Refill]',
            category: 'Instagram',
            rate: 1.50,
            min: 100,
            max: 10000,
            provider: 'morethanpanel',
            providerServiceId: '101',
        },
    });

    const service2 = await prisma.service.upsert({
        where: { id: 2 },
        update: {},
        create: {
            name: 'TikTok Views [Instant]',
            category: 'TikTok',
            rate: 0.10,
            min: 1000,
            max: 1000000,
            provider: 'justanotherpanel',
            providerServiceId: '550',
        },
    });

    console.log({ service1, service2 });
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
