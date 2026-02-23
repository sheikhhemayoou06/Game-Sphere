const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const tournament = await prisma.tournament.findFirst({
    include: { organizer: true }
  });
  if (tournament && tournament.organizer) {
    console.log("Found Organizer Email:", tournament.organizer.email);
  } else {
    console.log("No tournaments found.");
  }
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
