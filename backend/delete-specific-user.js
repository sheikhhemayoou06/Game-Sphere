const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const emailToDelete = "sheikhhemayoou06@gmail.com";
    console.log(`Checking for user with email: ${emailToDelete}`);

    const user = await prisma.user.findUnique({
        where: { email: emailToDelete }
    });

    if (user) {
        console.log(`User found (ID: ${user.id}). Deleting...`);
        // Delete related records manually if there's no cascade delete for some relationships,
        // though the DB schema should handle it if set up with cascade, but let's just 
        // delete via prisma or raw query to be safe with cascade.

        await prisma.$executeRawUnsafe(`DELETE FROM "User" WHERE email = '${emailToDelete}' CASCADE;`);
        console.log(`Successfully deleted user ${emailToDelete} completely.`);
    } else {
        console.log(`User ${emailToDelete} does not exist in the database.`);
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
