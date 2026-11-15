const prisma = require('../db/prisma');
const mailer = require('./mailer');

/**
 * Pure evaluation function: determines what escalation action a dose requires.
 * Given a dose, elder profile, and current reference time, returns:
 * - 'REMIND_ELDER'
 * - 'ALERT_CARETAKER'
 * - 'ALERT_FAMILY'
 * - 'NONE'
 */
function evaluateDoseEscalation(dose, graceMinutes, currentTime = new Date()) {
  if (dose.status === 'TAKEN') return 'NONE';

  const scheduledTime = new Date(dose.scheduledFor).getTime();
  const now = new Date(currentTime).getTime();
  const graceMs = graceMinutes * 60 * 1000;

  // Has dose time arrived and elder not yet reminded?
  if (now >= scheduledTime && dose.escalationLevel === 0) {
    return 'REMIND_ELDER';
  }

  // Grace period expired after elder reminder, caretaker not yet alerted
  if (now >= (scheduledTime + graceMs) && dose.escalationLevel === 1) {
    return 'ALERT_CARETAKER';
  }

  // Second grace window expired without response, alert extended family
  if (now >= (scheduledTime + (2 * graceMs)) && dose.escalationLevel === 2) {
    return 'ALERT_FAMILY';
  }

  return 'NONE';
}

/**
 * Idempotent cron processor: checks due doses across active elder profiles and runs escalation.
 */
async function processEscalationTick(referenceTime = new Date()) {
  const pendingDoses = await prisma.doseSchedule.findMany({
    where: {
      status: { in: ['PENDING', 'MISSED'] },
      escalationLevel: { lt: 3 },
      scheduledFor: { lte: referenceTime }
    },
    include: {
      medication: true,
      elderProfile: {
        include: {
          user: true,
          caregivers: {
            where: { status: 'ACTIVE' },
            include: { caregiver: true }
          }
        }
      }
    }
  });

  const summary = {
    evaluatedCount: pendingDoses.length,
    remindedElder: 0,
    alertedCaretaker: 0,
    alertedFamily: 0,
    processedAt: referenceTime.toISOString()
  };

  for (const dose of pendingDoses) {
    const elderProfile = dose.elderProfile;
    const graceMinutes = elderProfile.demoMode ? 1 : (elderProfile.activeGraceMinutes || 15);
    const action = evaluateDoseEscalation(dose, graceMinutes, referenceTime);

    if (action === 'REMIND_ELDER') {
      const emailContent = mailer.getElderReminderEmail(
        elderProfile.user.name,
        dose.medication.name,
        dose.medication.dosage,
        dose.medication.instructions
      );

      await mailer.sendEmailNotification({
        to: elderProfile.user.email,
        ...emailContent
      });

      await prisma.doseSchedule.update({
        where: { id: dose.id },
        data: {
          escalationLevel: 1,
          lastNotifiedAt: referenceTime,
          notificationLog: `Reminded elder ${elderProfile.user.name} at ${referenceTime.toLocaleTimeString()}`
        }
      });

      summary.remindedElder++;
    } else if (action === 'ALERT_CARETAKER') {
      const primaryCaretakers = elderProfile.caregivers.filter(c => c.caregiver.role === 'CARETAKER');

      for (const link of primaryCaretakers) {
        const emailContent = mailer.getCaretakerAlertEmail(
          link.caregiver.name,
          elderProfile.user.name,
          dose.medication.name,
          new Date(dose.scheduledFor).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          graceMinutes
        );

        await mailer.sendEmailNotification({
          to: link.caregiver.email,
          ...emailContent
        });
      }

      await prisma.doseSchedule.update({
        where: { id: dose.id },
        data: {
          status: 'MISSED',
          escalationLevel: 2,
          lastNotifiedAt: referenceTime,
          notificationLog: `Grace expired. Primary Caretaker alerted at ${referenceTime.toLocaleTimeString()}`
        }
      });

      await prisma.auditLog.create({
        data: {
          elderProfileId: elderProfile.id,
          performedById: elderProfile.userId,
          action: 'ESCALATION_CARETAKER_ALERTED',
          details: `Missed dose for ${dose.medication.name}. Primary caretaker notified.`
        }
      });

      summary.alertedCaretaker++;
    } else if (action === 'ALERT_FAMILY') {
      const familyMembers = elderProfile.caregivers.filter(c => c.caregiver.role === 'FAMILY');

      for (const link of familyMembers) {
        const emailContent = mailer.getCaretakerAlertEmail(
          link.caregiver.name,
          elderProfile.user.name,
          dose.medication.name,
          new Date(dose.scheduledFor).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          graceMinutes * 2
        );

        await mailer.sendEmailNotification({
          to: link.caregiver.email,
          ...emailContent
        });
      }

      await prisma.doseSchedule.update({
        where: { id: dose.id },
        data: {
          escalationLevel: 3,
          lastNotifiedAt: referenceTime,
          notificationLog: `Final escalation. Extended family alerted at ${referenceTime.toLocaleTimeString()}`
        }
      });

      await prisma.auditLog.create({
        data: {
          elderProfileId: elderProfile.id,
          performedById: elderProfile.userId,
          action: 'ESCALATION_FAMILY_ALERTED',
          details: `Missed dose for ${dose.medication.name}. Extended family notified.`
        }
      });

      summary.alertedFamily++;
    }
  }

  return summary;
}

module.exports = {
  evaluateDoseEscalation,
  processEscalationTick
};
