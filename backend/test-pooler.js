const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({ 
  datasources: { 
    db: { 
      url: 'postgresql://postgres.fikwgmxcyilxxheyjfgm:kofPo9-nejtab-pybnix@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres'
    } 
  } 
});

async function main() {
  try {
    const existing = await prisma.user.findFirst();
    console.log("Connected directly to Supabase! User count/exists:", !!existing);
  } catch (e) {
    console.error("Prisma direct test error:", e);
  } finally {
    await prisma.$disconnect();
  }
}
main();
