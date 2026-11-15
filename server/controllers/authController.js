const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { z } = require('zod');
const prisma = require('../db/prisma');
const config = require('../config');
const { resetLoginRateLimit } = require('../middleware/auth');

const loginSchema = z.object({
  email: z.string().email(),
  pin: z.string().min(4).max(6).optional(),
  password: z.string().min(6).optional()
});

function signToken(userId, role) {
  return jwt.sign({ userId, role }, config.jwtSecret, { expiresIn: '7d' });
}

function setAuthCookie(res, token) {
  res.cookie('token', token, {
    httpOnly: true,
    secure: config.nodeEnv === 'production',
    sameSite: config.nodeEnv === 'production' ? 'none' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000
  });
}

async function login(req, res, next) {
  try {
    const { email, pin, password } = loginSchema.parse(req.body);

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      include: {
        elderProfile: true,
        caregiverLinks: {
          include: {
            elderProfile: {
              include: { user: true }
            }
          }
        }
      }
    });

    if (!user) {
      return res.status(401).json({ success: false, error: 'Invalid email or credentials' });
    }

    // Check account lockout
    if (user.lockedUntil && user.lockedUntil > new Date()) {
      const waitMinutes = Math.ceil((user.lockedUntil - new Date()) / 60000);
      return res.status(403).json({
        success: false,
        error: `Account is temporarily locked due to failed attempts. Please wait ${waitMinutes} minutes.`
      });
    }

    let isValid = false;

    if (user.role === 'ELDER') {
      if (!pin) {
        return res.status(400).json({ success: false, error: 'PIN is required for senior accounts' });
      }
      isValid = await bcrypt.compare(pin, user.pinHash || '');
    } else {
      if (!password) {
        return res.status(400).json({ success: false, error: 'Password is required for caretaker accounts' });
      }
      isValid = await bcrypt.compare(password, user.passwordHash || '');
    }

    if (!isValid) {
      const failed = user.failedAttempts + 1;
      const willLock = failed >= 5;
      await prisma.user.update({
        where: { id: user.id },
        data: {
          failedAttempts: failed,
          lockedUntil: willLock ? new Date(Date.now() + 15 * 60 * 1000) : null
        }
      });

      return res.status(401).json({
        success: false,
        error: willLock
          ? 'Too many failed attempts. Account locked for 15 minutes.'
          : 'Invalid credentials provided'
      });
    }

    // Reset failed counter & rate limiter
    await prisma.user.update({
      where: { id: user.id },
      data: { failedAttempts: 0, lockedUntil: null }
    });
    resetLoginRateLimit(req.ip);

    const token = signToken(user.id, user.role);
    setAuthCookie(res, token);

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        elderProfileId: user.elderProfile?.id || null
      }
    });
  } catch (err) {
    next(err);
  }
}

async function quickDemoLogin(req, res, next) {
  try {
    const roleSchema = z.object({
      role: z.enum(['ELDER', 'CARETAKER', 'FAMILY'])
    });
    const { role } = roleSchema.parse(req.body);

    const emailMap = {
      ELDER: 'ramesh@sehatsathi.demo',
      CARETAKER: 'aarav@sehatsathi.demo',
      FAMILY: 'priya@sehatsathi.demo'
    };

    const targetEmail = emailMap[role];
    const user = await prisma.user.findUnique({
      where: { email: targetEmail },
      include: { elderProfile: true }
    });

    if (!user) {
      return res.status(404).json({ success: false, error: 'Demo user not seeded' });
    }

    const token = signToken(user.id, user.role);
    setAuthCookie(res, token);

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        elderProfileId: user.elderProfile?.id || null
      }
    });
  } catch (err) {
    next(err);
  }
}

async function getMe(req, res, next) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: {
        elderProfile: true,
        caregiverLinks: {
          include: {
            elderProfile: {
              include: { user: true }
            }
          }
        }
      }
    });

    res.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        elderProfile: user.elderProfile,
        linkedElders: user.caregiverLinks.map(link => ({
          linkId: link.id,
          elderProfileId: link.elderProfileId,
          elderName: link.elderProfile.user.name,
          relationship: link.relationship,
          permissions: {
            canEditMeds: link.canEditMeds,
            canEditAppointments: link.canEditAppointments,
            canViewLogs: link.canViewLogs
          }
        }))
      }
    });
  } catch (err) {
    next(err);
  }
}

function logout(req, res) {
  res.clearCookie('token');
  res.json({ success: true, message: 'Logged out successfully' });
}

module.exports = {
  login,
  quickDemoLogin,
  getMe,
  logout
};
