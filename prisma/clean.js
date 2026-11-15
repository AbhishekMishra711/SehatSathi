const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function cleanDb() {
  console.log("Emptying database completely...");
  await prisma.auditLog.deleteMany({});
  await prisma.doseSchedule.deleteMany({});
  await prisma.medication.deleteMany({});
  await prisma.appointment.deleteMany({});
  await prisma.caregiverLink.deleteMany({});
  await prisma.elderProfile.deleteMany({});
  await prisma.user.deleteMany({});
  console.log("Database is now completely empty. Ready for fresh user registration!");
  await prisma.$disconnect();
}

cleanDb().catch(e => {
  console.error(e);
  process.exit(1);
});
