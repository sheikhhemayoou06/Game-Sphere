import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function backfill() {
    console.log('Fetching all players...');
    const players = await prisma.player.findMany({
        include: {
            playerSports: {
                include: { sport: true }
            },
            user: true
        }
    });

    console.log(`Found ${players.length} players to update.`);

    for (const player of players) {
        // Only update if it's the old GS- or ORZ- starting format or not length 7
        if (player.sportsId && (player.sportsId.startsWith('GS-') || player.sportsId.includes('177') || player.sportsId.length > 10)) {
            const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
            const firstLetter = letters[Math.floor(Math.random() * letters.length)];
            const lastLetter = letters[Math.floor(Math.random() * letters.length)];
            const numbers = Math.floor(10000 + Math.random() * 90000);
            const newUniversalId = `${firstLetter}${numbers}${lastLetter}`;

            console.log(`Updating Player ${player.id} sportsId from ${player.sportsId} to ${newUniversalId}`);

            await prisma.player.update({
                where: { id: player.id },
                data: { sportsId: newUniversalId }
            });

            // Update all their sports codes
            for (const ps of player.playerSports) {
                const role = player.user.role;
                let rolePrefix = 'P';
                if (role === 'ORGANIZER') rolePrefix = 'ORZ';
                else if (role === 'OFFICIAL') rolePrefix = 'OFC';
                else if (role === 'TEAM_MANAGER') rolePrefix = 'TMM';
                else if (role === 'ADMIN') rolePrefix = 'ADM';

                // SPORT_PREFIXES logic
                const sportNameMap: Record<string, string> = {
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
                const prefix = sportNameMap[ps.sport.name] || ps.sport.name.substring(0, 3).toUpperCase();
                const dynamicSegment = `${Math.floor(1 + Math.random() * 9)}${String.fromCharCode(65 + Math.floor(Math.random() * 26))}`;

                const newSportCode = `${rolePrefix}${prefix}${dynamicSegment}-${newUniversalId}`;

                await prisma.playerSport.update({
                    where: { id: ps.id },
                    data: { sportCode: newSportCode }
                });

                console.log(`  -> Updated SportCode for ${ps.sport.name} from ${ps.sportCode} to ${newSportCode}`);
            }
        }
    }

    console.log('Backfill complete!');
}

backfill()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
