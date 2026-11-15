const { z } = require('zod');
const prisma = require('../db/prisma');

async function getElderProfileFromUser(userId) {
  const profile = await prisma.elderProfile.findUnique({
    where: { userId },
    include: { user: true }
  });
  if (!profile) {
    const error = new Error('Elder profile not found for this user');
    error.statusCode = 404;
    throw error;
  }
  return profile;
}

async function getTodaySchedule(req, res, next) {
  try {
    const profile = await getElderProfileFromUser(req.user.id);
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
    const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);

    const doses = await prisma.doseSchedule.findMany({
      where: {
        elderProfileId: profile.id,
        scheduledFor: { gte: startOfDay, lte: endOfDay }
      },
      include: {
        medication: true
      },
      orderBy: { scheduledFor: 'asc' }
    });

    // Find the primary focus dose: first PENDING dose or MISSED dose
    const nextDueDose = doses.find(d => d.status === 'PENDING') || doses.find(d => d.status === 'MISSED') || null;

    res.json({
      success: true,
      data: {
        elderName: profile.user.name,
        emergencyPhone: profile.emergencyPhone,
        nextDueDose,
        allDosesToday: doses,
        summary: {
          total: doses.length,
          taken: doses.filter(d => d.status === 'TAKEN').length,
          pending: doses.filter(d => d.status === 'PENDING').length,
          missed: doses.filter(d => d.status === 'MISSED').length
        }
      }
    });
  } catch (err) {
    next(err);
  }
}

async function confirmDose(req, res, next) {
  try {
    const schema = z.object({
      doseId: z.string().min(1)
    });
    const { doseId } = schema.parse(req.body);
    const profile = await getElderProfileFromUser(req.user.id);

    const dose = await prisma.doseSchedule.findFirst({
      where: {
        id: doseId,
        elderProfileId: profile.id
      },
      include: { medication: true }
    });

    if (!dose) {
      return res.status(404).json({ success: false, error: 'Dose schedule not found' });
    }

    if (dose.status === 'TAKEN') {
      return res.status(400).json({ success: false, error: 'Dose already marked as taken' });
    }

    const updated = await prisma.doseSchedule.update({
      where: { id: dose.id },
      data: {
        status: 'TAKEN',
        takenAt: new Date(),
        takenByUserId: req.user.id
      }
    });

    await prisma.auditLog.create({
      data: {
        elderProfileId: profile.id,
        performedById: req.user.id,
        action: 'DOSE_CONFIRMED',
        details: `Senior confirmed taking ${dose.medication.name} (${dose.medication.dosage})`
      }
    });

    res.json({
      success: true,
      message: 'Dose marked as taken',
      dose: updated
    });
  } catch (err) {
    next(err);
  }
}

async function getAppointments(req, res, next) {
  try {
    const profile = await getElderProfileFromUser(req.user.id);
    const appointments = await prisma.appointment.findMany({
      where: {
        elderProfileId: profile.id,
        scheduledAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
      },
      orderBy: { scheduledAt: 'asc' }
    });

    res.json({
      success: true,
      appointments
    });
  } catch (err) {
    next(err);
  }
}

async function getMyPeople(req, res, next) {
  try {
    const profile = await getElderProfileFromUser(req.user.id);
    const caregivers = await prisma.caregiverLink.findMany({
      where: { elderProfileId: profile.id },
      include: {
        caregiver: {
          select: { id: true, name: true, email: true, phone: true, role: true }
        }
      },
      orderBy: { createdAt: 'asc' }
    });

    res.json({
      success: true,
      caregivers
    });
  } catch (err) {
    next(err);
  }
}

async function updateCaregiverPermission(req, res, next) {
  try {
    const schema = z.object({
      linkId: z.string().min(1),
      canEditMeds: z.boolean().optional(),
      canEditAppointments: z.boolean().optional(),
      canViewLogs: z.boolean().optional()
    });
    const { linkId, canEditMeds, canEditAppointments, canViewLogs } = schema.parse(req.body);
    const profile = await getElderProfileFromUser(req.user.id);

    const existingLink = await prisma.caregiverLink.findFirst({
      where: { id: linkId, elderProfileId: profile.id },
      include: { caregiver: true }
    });

    if (!existingLink) {
      return res.status(404).json({ success: false, error: 'Caregiver relationship not found' });
    }

    const updated = await prisma.caregiverLink.update({
      where: { id: linkId },
      data: {
        ...(canEditMeds !== undefined ? { canEditMeds } : {}),
        ...(canEditAppointments !== undefined ? { canEditAppointments } : {}),
        ...(canViewLogs !== undefined ? { canViewLogs } : {})
      }
    });

    await prisma.auditLog.create({
      data: {
        elderProfileId: profile.id,
        performedById: req.user.id,
        action: 'PERMISSIONS_UPDATED',
        details: `Senior modified access permissions for ${existingLink.caregiver.name}`
      }
    });

    res.json({
      success: true,
      message: 'Caregiver permissions updated',
      link: updated
    });
  } catch (err) {
    next(err);
  }
}

async function revokeCaregiverAccess(req, res, next) {
  try {
    const schema = z.object({
      linkId: z.string().min(1)
    });
    const { linkId } = schema.parse(req.body);
    const profile = await getElderProfileFromUser(req.user.id);

    const link = await prisma.caregiverLink.findFirst({
      where: { id: linkId, elderProfileId: profile.id },
      include: { caregiver: true }
    });

    if (!link) {
      return res.status(404).json({ success: false, error: 'Caregiver relationship not found' });
    }

    const updated = await prisma.caregiverLink.update({
      where: { id: linkId },
      data: { status: 'REVOKED' }
    });

    await prisma.auditLog.create({
      data: {
        elderProfileId: profile.id,
        performedById: req.user.id,
        action: 'ACCESS_REVOKED',
        details: `Senior revoked access for ${link.caregiver.name} (${link.relationship})`
      }
    });

    res.json({
      success: true,
      message: 'Caregiver access revoked',
      link: updated
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getTodaySchedule,
  confirmDose,
  getAppointments,
  getMyPeople,
  updateCaregiverPermission,
  revokeCaregiverAccess
};
