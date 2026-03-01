import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Starting Organizer Profile Format Update...');

    // Find all users who are ORGANIZERS
    const organizers = await prisma.user.findMany({
        where: {
            role: 'ORGANIZER',
        },
        include: {
            player: true
        }
    });

    console.log(`Found ${organizers.length} organizers. Verifying ID formats...`);

    let updatedCount = 0;
    for (const user of organizers) {
        const namePrefix = (user.firstName || 'OR').substring(0, 2).toUpperCase();
        const uniqueNum = Math.floor(10000 + Math.random() * 90000).toString();
        const sportsId = `${namePrefix}ORZ-${uniqueNum}`;

        if (!user.player) {
            await prisma.player.create({
                data: {
                    userId: user.id,
                    sportsId,
                    country: 'India',
                }
            });
            console.log(`✅ Created Player for Organizer: ${user.firstName} with ID ${sportsId}`);
            updatedCount++;
        } else {
            // Update existing player ID if it doesn't match the ORZ format
            if (!user.player.sportsId.includes('ORZ-')) {
                await prisma.player.update({
                    where: { id: user.player.id },
                    data: { sportsId }
                });
                console.log(`🔄 Updated Organizer: ${user.firstName} to new ID ${sportsId} (Was: ${user.player.sportsId})`);
                updatedCount++;
            }
        }
    }

    console.log(`Update complete! Modified ${updatedCount} records.`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
