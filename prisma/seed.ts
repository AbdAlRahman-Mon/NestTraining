import { PrismaClient } from '@prisma/client';
import 'dotenv/config';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { Prisma } from 'src/generated/prisma/browser';

const pool = new Pool({
    connectionString: process.env.DATABASE_URL!,
});

const adapter = new PrismaPg(pool as any);


const prisma = new PrismaClient({ adapter });

async function main() {


    const permissions = [
    { name: 'ITEM_INPUT',  description: 'Add items into a warehouse' },
    { name: 'ITEM_OUTPUT', description: 'Remove items from a warehouse' },
    { name: 'ITEM_READ',   description: 'View items in a warehouse' },
  ];


    for (const p of permissions){
        await prisma.permission.upsert({
            where: {name: p.name},
            update: {},
            create: p,
        });
    }

    console.log('Permissions seeded.');

}

main().catch(console.error).finally(() => prisma.$disconnect());