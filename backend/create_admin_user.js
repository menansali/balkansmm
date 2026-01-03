require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');
const bcrypt = require('bcrypt');

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
    const email = 'main_admin@balkansmm.com';
    const password = 'admin123';
    const hashedPassword = await bcrypt.hash(password, 10);

    // Check if exists
    const existing = await prisma.user.findUnique({ where: { email } });

    if (existing) {
        console.log(`User ${email} already exists. Updating password and role...`);
        await prisma.user.update({
            where: { email },
            data: {
                password: hashedPassword,
                role: 'admin'
            }
        });
        console.log(`Updated!`);
    } else {
        console.log(`Creating new admin user ${email}...`);
        await prisma.user.create({
            data: {
                email,
                name: 'Main Admin',
                password: hashedPassword,
                role: 'admin',
                balance: 1000.00,
                referralCode: 'ADMINVIP'
            }
        });
        console.log(`Created!`);
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
