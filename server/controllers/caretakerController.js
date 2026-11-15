const { z } = require('zod');
const prisma = require('../db/prisma');
const gemini = require('../services/gemini');
const escalation = require('../services/escalation');

async function getAuthorizedLink(userId, elderProfileId) {
  const link = await prisma.caregiverLink.findFirst({
    where: {
      caregiverId: userId,
      elderProfileId,
      status: 'ACTIVE'
    },
    include: {
      elderProfile: {
        include: { user: true }
      }
    }
  });

  if (!link) {
    const error = new Error('You do not have active authorized access to this elder profile');
    error.statusCode = 403;
    throw error;
  }

  return link;
}

async function linkPatientWithCode(req, res, next) {
  try {
    const schema = z.object({
      linkCode: z.string().min(4),
      relationship: z.string().min(2)
    });
    const { linkCode, relationship } = schema.parse(req.body);

    const elderProfile = await prisma.elderProfile.findUnique({
      where: { linkCode: linkCode.toUpperCase().trim() },
      include: { user: true }
    });

    if (!elderProfile) {
      return res.status(404).json({ success: false, error: 'Elder link code not found' });
    }

    const existingLink = await prisma.caregiverLink.findUnique({
      where: {
        elderProfileId_caregiverId: {
          elderProfileId: elderProfile.id,
          caregiverId: req.user.id
        }
      }
    });

    if (existingLink) {
      if (existingLink.status === 'REVOKED') {
        return res.status(403).json({ success: false, error: 'The elder has revoked access for your account' });
      }
      return res.json({ success: true, message: 'Already connected to this elder', elderProfileId: elderProfile.id });
    }

    await prisma.caregiverLink.create({
      data: {
        elderProfileId: elderProfile.id,
        caregiverId: req.user.id,
        relationship,
        canEditMeds: req.user.role === 'CARETAKER',
        canEditAppointments: true,
        canViewLogs: true,
        status: 'ACTIVE'
      }
    });

    await prisma.auditLog.create({
      data: {
        elderProfileId: elderProfile.id,
        performedById: req.user.id,
        action: 'CAREGIVER_CONNECTED',
        details: `${req.user.name} connected as ${relationship} via elder link code`
      }
    });

    res.json({
      success: true,
      message: `Connected successfully to ${elderProfile.user.name}`,
      elderProfileId: elderProfile.id
    });
  } catch (err) {
    next(err);
  }
}

async function getElderOverview(req, res, next) {
  try {
    const { elderProfileId } = req.params;
    const link = await getAuthorizedLink(req.user.id, elderProfileId);
    const elder = link.elderProfile;

    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const recentDoses = await prisma.doseSchedule.findMany({
      where: {
        elderProfileId,
        scheduledFor: { gte: sevenDaysAgo }
      },
      include: { medication: true },
      orderBy: { scheduledFor: 'desc' }
    });

    const takenCount = recentDoses.filter(d => d.status === 'TAKEN').length;
    const missedCount = recentDoses.filter(d => d.status === 'MISSED').length;
    const pendingCount = recentDoses.filter(d => d.status === 'PENDING').length;
    const totalCount = recentDoses.length;
    const adherenceRate = totalCount > 0 ? Math.round((takenCount / totalCount) * 100) : 100;

    const upcomingAppointments = await prisma.appointment.findMany({
      where: {
        elderProfileId,
        scheduledAt: { gte: new Date() }
      },
      orderBy: { scheduledAt: 'asc' },
      take: 3
    });

    res.json({
      success: true,
      data: {
        elder: {
          id: elder.id,
          name: elder.user.name,
          email: elder.user.email,
          emergencyPhone: elder.emergencyPhone,
          bloodGroup: elder.bloodGroup,
          medicalNotes: elder.medicalNotes,
          activeGraceMinutes: elder.activeGraceMinutes,
          demoMode: elder.demoMode
        },
        permissions: {
          canEditMeds: link.canEditMeds,
          canEditAppointments: link.canEditAppointments,
          canViewLogs: link.canViewLogs
        },
        stats: {
          adherenceRate,
          takenCount,
          missedCount,
          pendingCount,
          totalCount
        },
        recentDoses: recentDoses.slice(0, 10),
        upcomingAppointments
      }
    });
  } catch (err) {
    next(err);
  }
}

async function getMedications(req, res, next) {
  try {
    const { elderProfileId } = req.params;
    await getAuthorizedLink(req.user.id, elderProfileId);

    const medications = await prisma.medication.findMany({
      where: { elderProfileId, isActive: true },
      orderBy: { createdAt: 'desc' }
    });

    res.json({ success: true, medications });
  } catch (err) {
    next(err);
  }
}

async function addMedication(req, res, next) {
  try {
    const { elderProfileId } = req.params;
    const link = await getAuthorizedLink(req.user.id, elderProfileId);

    if (!link.canEditMeds) {
      return res.status(403).json({ success: false, error: 'Elder has restricted medication editing for your account' });
    }

    const schema = z.object({
      name: z.string().min(1),
      dosage: z.string().min(1),
      instructions: z.string().min(1),
      frequency: z.string().min(1),
      timeSlots: z.array(z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/))
    });

    const data = schema.parse(req.body);

    const med = await prisma.medication.create({
      data: {
        elderProfileId,
        name: data.name,
        dosage: data.dosage,
        instructions: data.instructions,
        frequency: data.frequency,
        timeSlots: data.timeSlots,
        isActive: true
      }
    });

    // Auto-create today's schedule for this medication
    const now = new Date();
    const todayYMD = now.toISOString().split('T')[0];

    for (const timeStr of data.timeSlots) {
      const scheduledTime = new Date(`${todayYMD}T${timeStr}:00.000Z`);
      await prisma.doseSchedule.create({
        data: {
          medicationId: med.id,
          elderProfileId,
          scheduledFor: scheduledTime,
          status: 'PENDING',
          escalationLevel: 0
        }
      });
    }

    await prisma.auditLog.create({
      data: {
        elderProfileId,
        performedById: req.user.id,
        action: 'MEDICATION_ADDED',
        details: `${req.user.name} added medication: ${med.name} (${med.dosage}) at [${med.timeSlots.join(', ')}]`
      }
    });

    res.status(201).json({ success: true, medication: med });
  } catch (err) {
    next(err);
  }
}

async function updateMedication(req, res, next) {
  try {
    const { elderProfileId, medicationId } = req.params;
    const link = await getAuthorizedLink(req.user.id, elderProfileId);

    if (!link.canEditMeds) {
      return res.status(403).json({ success: false, error: 'Elder has restricted medication editing for your account' });
    }

    const schema = z.object({
      name: z.string().min(1),
      dosage: z.string().min(1),
      instructions: z.string().min(1),
      frequency: z.string().min(1),
      timeSlots: z.array(z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/))
    });

    const data = schema.parse(req.body);

    const existing = await prisma.medication.findFirst({
      where: { id: medicationId, elderProfileId }
    });

    if (!existing) {
      return res.status(404).json({ success: false, error: 'Medication not found' });
    }

    const updated = await prisma.medication.update({
      where: { id: medicationId },
      data: {
        name: data.name,
        dosage: data.dosage,
        instructions: data.instructions,
        frequency: data.frequency,
        timeSlots: data.timeSlots
      }
    });

    // Update today's pending dose schedules for this medication to match new slots
    const now = new Date();
    const todayYMD = now.toISOString().split('T')[0];
    const startOfToday = new Date(`${todayYMD}T00:00:00.000Z`);
    const endOfToday = new Date(`${todayYMD}T23:59:59.999Z`);

    // Delete existing pending doses for today
    await prisma.doseSchedule.deleteMany({
      where: {
        medicationId: updated.id,
        elderProfileId,
        scheduledFor: { gte: startOfToday, lte: endOfToday },
        status: 'PENDING'
      }
    });

    // Recreate pending schedules for today's new time slots
    for (const timeStr of data.timeSlots) {
      const scheduledTime = new Date(`${todayYMD}T${timeStr}:00.000Z`);
      await prisma.doseSchedule.create({
        data: {
          medicationId: updated.id,
          elderProfileId,
          scheduledFor: scheduledTime,
          status: 'PENDING',
          escalationLevel: 0
        }
      });
    }

    await prisma.auditLog.create({
      data: {
        elderProfileId,
        performedById: req.user.id,
        action: 'MEDICATION_UPDATED',
        details: `${req.user.name} updated medication: ${updated.name} (${updated.dosage}) at [${updated.timeSlots.join(', ')}]`
      }
    });

    res.json({ success: true, medication: updated });
  } catch (err) {
    next(err);
  }
}

async function deleteMedication(req, res, next) {
  try {
    const { elderProfileId, medicationId } = req.params;
    const link = await getAuthorizedLink(req.user.id, elderProfileId);

    if (!link.canEditMeds) {
      return res.status(403).json({ success: false, error: 'Elder has restricted medication editing for your account' });
    }

    const existing = await prisma.medication.findFirst({
      where: { id: medicationId, elderProfileId }
    });

    if (!existing) {
      return res.status(404).json({ success: false, error: 'Medication not found' });
    }

    await prisma.medication.update({
      where: { id: medicationId },
      data: { isActive: false }
    });

    // Delete any pending schedules
    await prisma.doseSchedule.deleteMany({
      where: {
        medicationId,
        status: 'PENDING'
      }
    });

    await prisma.auditLog.create({
      data: {
        elderProfileId,
        performedById: req.user.id,
        action: 'MEDICATION_DELETED',
        details: `${req.user.name} removed medication: ${existing.name} (${existing.dosage})`
      }
    });

    res.json({ success: true, message: 'Medication removed successfully' });
  } catch (err) {
    next(err);
  }
}

async function parsePrescriptionAI(req, res, next) {
  try {
    const schema = z.object({
      prescriptionText: z.string().min(3)
    });
    const { prescriptionText } = schema.parse(req.body);

    const parsed = await gemini.parsePrescriptionText(prescriptionText);
    res.json({ success: true, parsed });
  } catch (err) {
    next(err);
  }
}

async function getAppointments(req, res, next) {
  try {
    const { elderProfileId } = req.params;
    await getAuthorizedLink(req.user.id, elderProfileId);

    const appointments = await prisma.appointment.findMany({
      where: { elderProfileId },
      orderBy: { scheduledAt: 'asc' }
    });

    res.json({ success: true, appointments });
  } catch (err) {
    next(err);
  }
}

async function addAppointment(req, res, next) {
  try {
    const { elderProfileId } = req.params;
    const link = await getAuthorizedLink(req.user.id, elderProfileId);

    if (!link.canEditAppointments) {
      return res.status(403).json({ success: false, error: 'Elder has restricted appointment management for your account' });
    }

    const schema = z.object({
      doctorName: z.string().min(1),
      specialty: z.string().optional(),
      location: z.string().optional(),
      scheduledAt: z.string(),
      notes: z.string().optional()
    });

    const data = schema.parse(req.body);

    const appointment = await prisma.appointment.create({
      data: {
        elderProfileId,
        doctorName: data.doctorName,
        specialty: data.specialty,
        location: data.location,
        scheduledAt: new Date(data.scheduledAt),
        notes: data.notes
      }
    });

    await prisma.auditLog.create({
      data: {
        elderProfileId,
        performedById: req.user.id,
        action: 'APPOINTMENT_SCHEDULED',
        details: `${req.user.name} scheduled visit with ${appointment.doctorName} on ${new Date(appointment.scheduledAt).toLocaleDateString()}`
      }
    });

    res.status(201).json({ success: true, appointment });
  } catch (err) {
    next(err);
  }
}

async function updateAppointment(req, res, next) {
  try {
    const { elderProfileId, appointmentId } = req.params;
    const link = await getAuthorizedLink(req.user.id, elderProfileId);

    if (!link.canEditAppointments) {
      return res.status(403).json({ success: false, error: 'Elder has restricted appointment management for your account' });
    }

    const schema = z.object({
      doctorName: z.string().min(1),
      specialty: z.string().optional(),
      location: z.string().optional(),
      scheduledAt: z.string(),
      notes: z.string().optional()
    });

    const data = schema.parse(req.body);

    const existing = await prisma.appointment.findFirst({
      where: { id: appointmentId, elderProfileId }
    });

    if (!existing) {
      return res.status(404).json({ success: false, error: 'Appointment not found' });
    }

    const updated = await prisma.appointment.update({
      where: { id: appointmentId },
      data: {
        doctorName: data.doctorName,
        specialty: data.specialty,
        location: data.location,
        scheduledAt: new Date(data.scheduledAt),
        notes: data.notes
      }
    });

    await prisma.auditLog.create({
      data: {
        elderProfileId,
        performedById: req.user.id,
        action: 'APPOINTMENT_UPDATED',
        details: `${req.user.name} updated visit with ${updated.doctorName} on ${new Date(updated.scheduledAt).toLocaleDateString()}`
      }
    });

    res.json({ success: true, appointment: updated });
  } catch (err) {
    next(err);
  }
}

async function deleteAppointment(req, res, next) {
  try {
    const { elderProfileId, appointmentId } = req.params;
    const link = await getAuthorizedLink(req.user.id, elderProfileId);

    if (!link.canEditAppointments) {
      return res.status(403).json({ success: false, error: 'Elder has restricted appointment management for your account' });
    }

    const existing = await prisma.appointment.findFirst({
      where: { id: appointmentId, elderProfileId }
    });

    if (!existing) {
      return res.status(404).json({ success: false, error: 'Appointment not found' });
    }

    await prisma.appointment.delete({
      where: { id: appointmentId }
    });

    await prisma.auditLog.create({
      data: {
        elderProfileId,
        performedById: req.user.id,
        action: 'APPOINTMENT_DELETED',
        details: `${req.user.name} removed visit with ${existing.doctorName}`
      }
    });

    res.json({ success: true, message: 'Appointment removed successfully' });
  } catch (err) {
    next(err);
  }
}

async function getAuditTrail(req, res, next) {
  try {
    const { elderProfileId } = req.params;
    const link = await getAuthorizedLink(req.user.id, elderProfileId);

    if (!link.canViewLogs) {
      return res.status(403).json({ success: false, error: 'Elder has restricted audit log viewing for your account' });
    }

    const logs = await prisma.auditLog.findMany({
      where: { elderProfileId },
      include: {
        performedBy: {
          select: { id: true, name: true, role: true }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 50
    });

    res.json({ success: true, logs });
  } catch (err) {
    next(err);
  }
}

async function simulateEscalation(req, res, next) {
  try {
    const { elderProfileId } = req.params;
    const link = await getAuthorizedLink(req.user.id, elderProfileId);

    const simulatedScheduledTime = new Date(Date.now() - 20 * 60 * 1000);

    let dose = await prisma.doseSchedule.findFirst({
      where: {
        elderProfileId,
        status: { in: ['PENDING', 'MISSED'] }
      },
      include: { medication: true }
    });

    if (!dose) {
      const anyMed = await prisma.medication.findFirst({ where: { elderProfileId } });
      if (!anyMed) {
        return res.status(400).json({ success: false, error: 'No medications exist for this profile yet. Add a medication first.' });
      }
      dose = await prisma.doseSchedule.create({
        data: {
          elderProfileId,
          medicationId: anyMed.id,
          scheduledFor: simulatedScheduledTime,
          status: 'PENDING',
          escalationLevel: 0
        },
        include: { medication: true }
      });
    } else {
      dose = await prisma.doseSchedule.update({
        where: { id: dose.id },
        data: {
          scheduledFor: simulatedScheduledTime,
          status: 'PENDING',
          escalationLevel: 1
        },
        include: { medication: true }
      });
    }

    const summary = await escalation.processEscalationTick(new Date());

    res.json({
      success: true,
      message: 'Escalation simulation triggered successfully',
      targetDose: {
        id: dose.id,
        medication: dose.medication.name,
        dosage: dose.medication.dosage
      },
      summary
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  linkPatientWithCode,
  getElderOverview,
  getMedications,
  addMedication,
  updateMedication,
  deleteMedication,
  parsePrescriptionAI,
  getAppointments,
  addAppointment,
  updateAppointment,
  deleteAppointment,
  getAuditTrail,
  simulateEscalation
};
