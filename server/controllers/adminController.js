const prisma = require('../db/prisma');
const { processEscalationTick } = require('../services/escalation');

async function getMetrics(req, res, next) {
  try {
    const [totalUsers, totalElders, totalCaregivers, totalMeds, totalDoses, takenDoses, missedDoses] = await Promise.all([
      prisma.user.count(),
      prisma.elderProfile.count(),
      prisma.user.count({ where: { role: { in: ['CARETAKER', 'FAMILY'] } } }),
      prisma.medication.count({ where: { isActive: true } }),
      prisma.doseSchedule.count(),
      prisma.doseSchedule.count({ where: { status: 'TAKEN' } }),
      prisma.doseSchedule.count({ where: { status: 'MISSED' } })
    ]);

    const adherenceRate = totalDoses > 0 ? Math.round((takenDoses / totalDoses) * 100) : 100;

    res.json({
      success: true,
      metrics: {
        totalUsers,
        totalElders,
        totalCaregivers,
        totalMeds,
        totalDoses,
        takenDoses,
        missedDoses,
        adherenceRate
      }
    });
  } catch (err) {
    next(err);
  }
}

async function getAllUsers(req, res, next) {
  try {
    const users = await prisma.user.findMany({
      include: {
        elderProfile: true,
        caregiverLinks: {
          include: {
            elderProfile: {
              include: { user: true }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({
      success: true,
      users: users.map(u => ({
        id: u.id,
        name: u.name,
        email: u.email,
        phone: u.phone,
        role: u.role,
        failedAttempts: u.failedAttempts,
        isLocked: !!(u.lockedUntil && u.lockedUntil > new Date()),
        linkCode: u.elderProfile?.linkCode || null,
        createdAt: u.createdAt
      }))
    });
  } catch (err) {
    next(err);
  }
}

async function deleteUser(req, res, next) {
  try {
    const { userId } = req.params;
    if (userId === req.user.id) {
      return res.status(400).json({ success: false, error: 'Cannot delete your own admin account' });
    }

    await prisma.user.delete({
      where: { id: userId }
    });

    res.json({ success: true, message: 'User removed from platform' });
  } catch (err) {
    next(err);
  }
}

async function unlockUser(req, res, next) {
  try {
    const { userId } = req.params;
    await prisma.user.update({
      where: { id: userId },
      data: { failedAttempts: 0, lockedUntil: null }
    });

    res.json({ success: true, message: 'User lockout cleared successfully' });
  } catch (err) {
    next(err);
  }
}

async function getSystemAuditLogs(req, res, next) {
  try {
    const logs = await prisma.auditLog.findMany({
      include: {
        performedBy: {
          select: { id: true, name: true, role: true, email: true }
        },
        elderProfile: {
          include: {
            user: {
              select: { name: true }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 100
    });

    res.json({ success: true, logs });
  } catch (err) {
    next(err);
  }
}

async function triggerManualEscalation(req, res, next) {
  try {
    const summary = await processEscalationTick(new Date());
    res.json({
      success: true,
      message: 'Escalation cron tick executed',
      summary
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getMetrics,
  getAllUsers,
  deleteUser,
  unlockUser,
  getSystemAuditLogs,
  triggerManualEscalation
};
