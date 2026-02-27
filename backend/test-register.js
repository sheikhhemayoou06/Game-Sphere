const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({ log: ['query', 'info', 'warn', 'error'] });

async function main() {
  try {
    const existing = await prisma.user.findUnique({ where: { email: "test500@example.com" } });
    if (!existing) {
        console.log("Creating user...");
        const user = await prisma.user.create({
            data: {
                email: "test500@example.com",
                password: "hashedpassword",
                firstName: "Test",
                lastName: "User",
                role: "PLAYER",
            },
        });
        console.log("User created:", user.id);
        
        console.log("Creating player profile...");
        const sportsId = "GS-12345-ABCDEF";
        const player = await prisma.player.create({
            data: {
                userId: user.id,
                sportsId: sportsId,
            }
        });
        console.log("Player created:", player.id);
    } else {
        console.log("User already exists cleanup required for test.");
    }
  } catch (e) {
    console.error("Prisma error during test:", e);
  } finally {
    await prisma.$disconnect();
  }
}
main();
