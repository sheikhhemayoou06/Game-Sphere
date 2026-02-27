const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const prisma = new PrismaClient();

async function main() {
    const password = await bcrypt.hash('password123', 10);

    const users = [
        { email: 'org@test.com', firstName: 'Org', lastName: 'User', role: 'ORGANIZER' },
        { email: 'manager@test.com', firstName: 'Manager', lastName: 'User', role: 'TEAM_MANAGER' },
        { email: 'official@test.com', firstName: 'Official', lastName: 'User', role: 'OFFICIAL' },
        { email: 'player@test.com', firstName: 'Player', lastName: 'User', role: 'PLAYER' }
    ];

    for (const u of users) {
        const existing = await prisma.user.findUnique({ where: { email: u.email } });
        if (!existing) {
            const created = await prisma.user.create({
                data: {
                    email: u.email,
                    password,
                    firstName: u.firstName,
                    lastName: u.lastName,
                    role: u.role,
                }
            });
            console.log(`Created user: ${u.email} with role ${u.role}`);

            // Create a player profile to prevent errors in dashboard matching
            const sportsId = `GS-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
            await prisma.player.create({
                data: {
                    userId: created.id,
                    sportsId,
                    country: 'India',
                },
            });
            console.log(`Created player profile for ${u.email}`);
        } else {
            console.log(`User ${u.email} already exists`);
        }
    }
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
