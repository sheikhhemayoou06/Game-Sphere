const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({ log: ['error'] });
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// A mini-replica of the AuthService.register payload logic that we just updated
async function simulateRegistration(dto) {
    console.log("1. Starting registration for:", dto.email);
    const existing = await prisma.user.findUnique({
        where: { email: dto.email },
    });
    if (existing) {
        console.log("User already exists. Deleting to simulate fresh registration...");
        // Cleanup all relations before deleting user
        const player = await prisma.player.findUnique({ where: { userId: existing.id } });
        if (player) {
            await prisma.playerSport.deleteMany({ where: { playerId: player.id } });
            await prisma.player.delete({ where: { id: player.id } });
        }
        await prisma.user.delete({ where: { id: existing.id } });
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);
    const user = await prisma.user.create({
        data: {
            email: dto.email,
            password: hashedPassword,
            firstName: dto.firstName,
            lastName: dto.lastName,
            role: dto.role || 'PLAYER',
            phone: dto.phone || undefined,
        },
    });

    console.log("2. Created user with role:", user.role);

    if (user.role === 'PLAYER') {
        const sportsId = `GS-${Date.now()}-TEST`;
        await prisma.player.create({
            data: {
                userId: user.id,
                sportsId,
            },
        });
        console.log("3. Created player profile nested relation.", sportsId);
    }

    console.log("4. Fetching fully populated user payload (the fix we just pushed)...");
    const populatedUser = await prisma.user.findUnique({
        where: { id: user.id },
        include: {
            player: {
                include: { playerSports: { include: { sport: true } } }
            }
        },
    });

    console.log("\n=============================");
    console.log("FINAL PAYLOAD RETURNED TO FRONTEND:");
    console.log(JSON.stringify(populatedUser, null, 2));
    console.log("=============================\n");
    
    // Verify that player object successfully attached to the return payload
    if (populatedUser.player && populatedUser.player.sportsId) {
        console.log("✅ SUCCESS: The nested player relation is correctly returned, mirroring `login()`.");
    } else {
        console.log("❌ FAILED: The player data is missing from the return payload!");
    }
}

simulateRegistration({
    email: "frontend.regression.test@example.com",
    password: "password123",
    firstName: "Frontend",
    lastName: "Regression",
    role: "PLAYER"
}).finally(() => prisma.$disconnect());
