const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function seedAdmin() {
  const email = 'abhishek.mishra.12335@gmail.com';
  const rawPassword = 'Abhishek@11';
  const hashedPassword = await bcrypt.hash(rawPassword, 10);

  const admin = await prisma.user.upsert({
    where: { email },
    update: {
      passwordHash: hashedPassword,
      role: 'ADMIN',
      emailVerified: true,
      failedAttempts: 0,
      lockedUntil: null
    },
    create: {
      name: 'Abhishek Mishra (Admin)',
      email,
      role: 'ADMIN',
      passwordHash: hashedPassword,
      emailVerified: true
    }
  });

  console.log(`[Seed Admin] Successfully configured Admin account: ${admin.email} (ID: ${admin.id}, Role: ${admin.role})`);
  await prisma.$disconnect();
}

seedAdmin().catch(err => {
  console.error('[Seed Admin Error]', err);
  process.exit(1);
});
