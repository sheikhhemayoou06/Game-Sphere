require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

// Use DIRECT_URL since the pooler URL has an IPv6/resolution issue on this network
const prisma = new PrismaClient({
    datasources: { db: { url: process.env.DIRECT_URL } }
});

async function main() {
    console.log('Connecting to:', process.env.DIRECT_URL.split('@')[1]);
    const user = await prisma.user.findUnique({
        where: { email: 'sheikhhemayoou06@gmail.com' }
    });
    console.log('Found User:', user);
}

main().catch(console.error).finally(() => prisma.$disconnect());
