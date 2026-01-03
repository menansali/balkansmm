require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
    const users = await prisma.user.findMany({
        select: { email: true, role: true, name: true, id: true }
    });
    console.log("Users List:");
    console.table(users);
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
