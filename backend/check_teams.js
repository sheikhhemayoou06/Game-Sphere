import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function checkTeams() {
    const users = await prisma.user.findMany({
        where: {
            managedTeams: { some: {} }
        },
        include: {
            managedTeams: {
                include: { sport: true }
            }
        }
    });
    for (const u of users) {
        console.log(`\nUser: ${u.email}`);
        for (const t of u.managedTeams) {
            console.log(`- Team: ${t.name} (Sport: ${t.sport?.name} / ${t.sportId})`);
        }
    }
}

checkTeams()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
