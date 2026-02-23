const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const SPORT_PREFIXES = {
    'Cricket': 'CRI',
    'Football': 'FTB',
    'Basketball': 'BKT',
    'Kabaddi': 'KBD',
    'Volleyball': 'VLB',
    'Badminton': 'BDM',
    'Hockey': 'HKY',
    'Tennis': 'TNS',
    'Athletics': 'ATH',
};

async function main() {
    // Get the test player
    const user = await prisma.user.findFirst({
        where: { role: 'PLAYER' },
        include: { player: true },
    });
    if (!user || !user.player) {
        console.error('No player found');
        return;
    }

    // Get all available sports
    const sports = await prisma.sport.findMany();
    console.log(`Found ${sports.length} sports. Registering player ${user.email} for each...`);

    const year = new Date().getFullYear();

    for (const sport of sports) {
        const prefix = SPORT_PREFIXES[sport.name] || sport.name.substring(0, 3).toUpperCase();

        // Check if already registered
        const existing = await prisma.playerSport.findUnique({
            where: { playerId_sportId: { playerId: user.player.id, sportId: sport.id } },
        });
        if (existing) {
            console.log(`  Already registered for ${sport.name}: ${existing.sportCode}`);
            continue;
        }

        const count = await prisma.playerSport.count({ where: { sportId: sport.id } });
        const seq = String(count + 1).padStart(5, '0');
        const sportCode = `${prefix}-${year}-${seq}`;

        await prisma.playerSport.create({
            data: {
                playerId: user.player.id,
                sportId: sport.id,
                sportCode,
            },
        });
        console.log(`  ✅ ${sport.name}: ${sportCode}`);
    }

    console.log('\nDone! Player now has sport-specific IDs for all sports.');
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
