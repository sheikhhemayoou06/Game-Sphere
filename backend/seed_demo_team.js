import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function seedTeam() {
    // 1. Get the cricket sport ID
    const cricket = await prisma.sport.findFirst({
        where: { name: 'Cricket' }
    });

    if (!cricket) {
        console.log("Cricket not found");
        return;
    }

    // 2. Get all users
    const users = await prisma.user.findMany({
        include: { player: true }
    });
    
    if (users.length === 0) return;

    // 3. Ensure they all have Player records
    for (const u of users) {
        if (!u.player) {
            await prisma.player.create({
                data: {
                    userId: u.id,
                    sportsId: `P-${u.id.substring(0, 8)}`,
                    city: 'Demo City'
                }
            });
        }
    }
    
    const usersWithPlayers = await prisma.user.findMany({
        include: { player: true }
    });

    // 4. Create a Demo Team
    const manager = usersWithPlayers[0];
    const team = await prisma.team.create({
        data: {
            name: 'Galactic Strikers',
            teamCode: 'GALACTIC-11',
            city: 'Cosmic City',
            managerId: manager.id,
            sportId: cricket.id
        }
    });

    console.log("Created Team:", team.name);

    // 5. Add all users as players
    let count = 0;
    for (const u of usersWithPlayers) {
        if (u.player) {
            await prisma.teamPlayer.create({
                data: {
                    teamId: team.id,
                    playerId: u.player.id,
                    role: count === 0 ? 'Captain' : count === 1 ? 'Vice-Captain' : 'Batsman'
                }
            });
            count++;
        }
    }
    console.log(`Added ${count} players to ${team.name}`);
}

seedTeam()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
