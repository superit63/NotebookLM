/**
 * Database Seed Script
 * Creates default admin user for first-time setup
 * 
 * Run with: npx tsx src/scripts/seed.ts
 */

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Seeding database...\n');

    // Create default admin user
    const hashedPassword = await bcrypt.hash('admin123', 10);

    const admin = await prisma.user.upsert({
        where: { username: 'admin' },
        update: {},
        create: {
            username: 'admin',
            password: hashedPassword,
            role: 'ADMIN',
        },
    });

    console.log('✅ Created admin user:');
    console.log(`   Username: admin`);
    console.log(`   Password: admin123`);
    console.log(`   Role: ADMIN\n`);

    // Create a sample user
    const userPassword = await bcrypt.hash('user123', 10);

    const user = await prisma.user.upsert({
        where: { username: 'user' },
        update: {},
        create: {
            username: 'user',
            password: userPassword,
            role: 'USER',
        },
    });

    console.log('✅ Created sample user:');
    console.log(`   Username: user`);
    console.log(`   Password: user123`);
    console.log(`   Role: USER\n`);

    console.log('🎉 Database seeding completed!');
    console.log('\n⚠️  Remember to change these passwords in production!');
}

main()
    .catch((e) => {
        console.error('❌ Seeding failed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
