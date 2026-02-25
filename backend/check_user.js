const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.findUnique({
    where: { email: 'sheikhhemayoou06@gmail.com' }
  });
  console.log("User found:", user);
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
