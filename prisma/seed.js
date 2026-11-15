const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding SehatSathi demo data...");

  // Clean old records
  await prisma.auditLog.deleteMany({});
  await prisma.doseSchedule.deleteMany({});
  await prisma.medication.deleteMany({});
  await prisma.appointment.deleteMany({});
  await prisma.caregiverLink.deleteMany({});
  await prisma.elderProfile.deleteMany({});
  await prisma.user.deleteMany({});

  const hashedElderPin = await bcrypt.hash("1234", 10);
  const hashedPasscode = await bcrypt.hash("Password123!", 10);

  // 1. Create Elder User & Profile
  const elderUser = await prisma.user.create({
    data: {
      name: "Ramesh Sharma",
      email: "ramesh@sehatsathi.demo",
      phone: "+91 98765 43210",
      role: "ELDER",
      pinHash: hashedElderPin,
      elderProfile: {
        create: {
          emergencyPhone: "+91 98765 43211",
          bloodGroup: "B+",
          medicalNotes: "Type 2 Diabetes, Mild Hypertension. Requires low sodium diet.",
          activeGraceMinutes: 15,
          demoMode: true
        }
      }
    },
    include: { elderProfile: true }
  });

  const elderProfile = elderUser.elderProfile;

  // 2. Create Primary Caretaker (Son)
  const caretakerUser = await prisma.user.create({
    data: {
      name: "Aarav Sharma",
      email: "aarav@sehatsathi.demo",
      phone: "+91 98765 43212",
      role: "CARETAKER",
      passwordHash: hashedPasscode
    }
  });

  // Link Caretaker
  await prisma.caregiverLink.create({
    data: {
      elderProfileId: elderProfile.id,
      caregiverId: caretakerUser.id,
      relationship: "Son & Primary Caretaker",
      canEditMeds: true,
      canEditAppointments: true,
      canViewLogs: true,
      status: "ACTIVE"
    }
  });

  // 3. Create Family Member (Daughter)
  const familyUser = await prisma.user.create({
    data: {
      name: "Priya Sharma",
      email: "priya@sehatsathi.demo",
      phone: "+91 98765 43213",
      role: "FAMILY",
      passwordHash: hashedPasscode
    }
  });

  // Link Family Member
  await prisma.caregiverLink.create({
    data: {
      elderProfileId: elderProfile.id,
      caregiverId: familyUser.id,
      relationship: "Daughter",
      canEditMeds: false, // Elder decided she can view, not edit
      canEditAppointments: true,
      canViewLogs: true,
      status: "ACTIVE"
    }
  });

  // 4. Create Medications
  const med1 = await prisma.medication.create({
    data: {
      elderProfileId: elderProfile.id,
      name: "Metformin",
      dosage: "500 mg",
      instructions: "Take 1 tablet after meals with water",
      frequency: "TWICE_DAILY",
      timeSlots: ["08:30", "20:30"],
      isActive: true
    }
  });

  const med2 = await prisma.medication.create({
    data: {
      elderProfileId: elderProfile.id,
      name: "Amlodipine",
      dosage: "5 mg",
      instructions: "Take 1 tablet in morning for blood pressure",
      frequency: "DAILY",
      timeSlots: ["09:00"],
      isActive: true
    }
  });

  const med3 = await prisma.medication.create({
    data: {
      elderProfileId: elderProfile.id,
      name: "Atorvastatin",
      dosage: "10 mg",
      instructions: "Take 1 tablet at night before sleeping",
      frequency: "DAILY",
      timeSlots: ["21:30"],
      isActive: true
    }
  });

  // 5. Generate Doses for Today
  const now = new Date();
  const todayYMD = now.toISOString().split("T")[0];

  // Morning dose 1: Already taken earlier
  const morningDoseTime = new Date(`${todayYMD}T08:30:00.000Z`);
  await prisma.doseSchedule.create({
    data: {
      medicationId: med1.id,
      elderProfileId: elderProfile.id,
      scheduledFor: morningDoseTime,
      status: "TAKEN",
      takenAt: new Date(`${todayYMD}T08:35:00.000Z`),
      takenByUserId: elderUser.id,
      escalationLevel: 0
    }
  });

  // Morning dose 2: Missed / escalated (demo showcase)
  const amloTime = new Date(`${todayYMD}T09:00:00.000Z`);
  await prisma.doseSchedule.create({
    data: {
      medicationId: med2.id,
      elderProfileId: elderProfile.id,
      scheduledFor: amloTime,
      status: "MISSED",
      escalationLevel: 2,
      lastNotifiedAt: new Date(`${todayYMD}T09:20:00.000Z`),
      notificationLog: "Elder reminded at 09:00. Unanswered. Caretaker Aarav alerted at 09:15."
    }
  });

  // Next upcoming dose: due now / later today
  const eveningDoseTime = new Date(`${todayYMD}T20:30:00.000Z`);
  await prisma.doseSchedule.create({
    data: {
      medicationId: med1.id,
      elderProfileId: elderProfile.id,
      scheduledFor: eveningDoseTime,
      status: "PENDING",
      escalationLevel: 0
    }
  });

  const nightDoseTime = new Date(`${todayYMD}T21:30:00.000Z`);
  await prisma.doseSchedule.create({
    data: {
      medicationId: med3.id,
      elderProfileId: elderProfile.id,
      scheduledFor: nightDoseTime,
      status: "PENDING",
      escalationLevel: 0
    }
  });

  // 6. Appointments
  const nextWeek = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);
  await prisma.appointment.create({
    data: {
      elderProfileId: elderProfile.id,
      doctorName: "Dr. Rajiv Mehta",
      specialty: "Cardiology",
      location: "Room 302, Apollo Care Center",
      scheduledAt: nextWeek,
      notes: "Routine quarterly BP and cholesterol checkup."
    }
  });

  // 7. Initial Audit Logs
  await prisma.auditLog.createMany({
    data: [
      {
        elderProfileId: elderProfile.id,
        performedById: elderUser.id,
        action: "PROFILE_INITIALIZED",
        details: "Ramesh Sharma created account with 4-digit PIN."
      },
      {
        elderProfileId: elderProfile.id,
        performedById: elderUser.id,
        action: "CAREGIVER_INVITED",
        details: "Aarav Sharma added as Primary Caretaker with full permissions."
      },
      {
        elderProfileId: elderProfile.id,
        performedById: elderUser.id,
        action: "PERMISSIONS_UPDATED",
        details: "Priya Sharma granted view-only access for medications."
      },
      {
        elderProfileId: elderProfile.id,
        performedById: caretakerUser.id,
        action: "MEDICATION_ADDED",
        details: "Added Metformin 500mg (twice daily)."
      }
    ]
  });

  console.log("Database seeded successfully with demo users:");
  console.log("Elder: ramesh@sehatsathi.demo / PIN: 1234");
  console.log("Caretaker: aarav@sehatsathi.demo / Passcode: Password123!");
  console.log("Family: priya@sehatsathi.demo / Passcode: Password123!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

