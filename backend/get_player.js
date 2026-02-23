const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
    let user = await prisma.user.findFirst({
        where: { role: 'PLAYER' }
    });

    const newPassword = 'player123';
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    if (user) {
        await prisma.user.update({
            where: { id: user.id },
            data: { password: hashedPassword }
        });
        console.log(`Email: ${user.email}`);
        console.log(`Password: ${newPassword}`);
    } else {
        // Let's create a test player if none exist
        user = await prisma.user.create({
            data: {
                email: 'testplayer@gamesphere.in',
                password: hashedPassword,
                firstName: 'Test',
                lastName: 'Player',
                role: 'PLAYER',
                player: { // Creating associated player profile
                    create: {
                        sportsId: `GS-TEST-${Math.random().toString(36).substring(2, 8).toUpperCase()}`
                    }
                }
            }
        });
        console.log(`Created new dummy player:`);
        console.log(`Email: ${user.email}`);
        console.log(`Password: ${newPassword}`);
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
