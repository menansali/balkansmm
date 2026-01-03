
const { PrismaClient } = require('@prisma/client');
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');
const bcrypt = require('bcrypt');

const connectionString = process.env.DATABASE_URL || "postgresql://postgres:root@localhost:5432/balkansmm";
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
    console.log('Seeding...');
    const adminEmail = 'admin@balkansmm.com';
    const adminPassword = await bcrypt.hash('admin123', 10);

    try {
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
        console.log('Admin created:', admin);
    } catch (e) { console.error("Admin error", e); }

    try {
        const service1 = await prisma.service.upsert({
            where: { id: 1 },
            update: {},
            create: {
                name: 'Instagram Followers [Premium]',
                category: 'Instagram',
                rate: 1.50,
                min: 100,
                max: 10000,
                provider: 'morethanpanel',
                providerServiceId: '101',
            },
        });
        console.log('Service 1 created');
    } catch (e) { console.error("Service 1 error", e); }

    try {
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
        console.log('Services created');
    } catch (e) { console.error("Service 2 error", e); }
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
