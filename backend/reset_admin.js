const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
    const email = 'admin@gamesphere.in';
    const newPassword = 'password123';

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    const user = await prisma.user.update({
        where: { email },
        data: { password: hashedPassword }
    });

    console.log(`Password reset for ${user.email} successfully.`);
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
