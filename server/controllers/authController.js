const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { z } = require('zod');
const prisma = require('../db/prisma');
const config = require('../config');
const { resetLoginRateLimit } = require('../middleware/auth');
const otpService = require('../services/otpService');

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

function generateLinkCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = 'EL-';
  for (let i = 0; i < 4; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

// 1. Send OTP to Email
async function sendOtp(req, res, next) {
  try {
    const schema = z.object({
      email: z.string().email(),
      purpose: z.enum(['REGISTER', 'RESET_CREDENTIAL']).default('REGISTER')
    });
    const { email, purpose } = schema.parse(req.body);
    const normalizedEmail = email.toLowerCase().trim();

    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail }
    });

    if (purpose === 'REGISTER' && existingUser) {
      return res.status(400).json({
        success: false,
        error: 'An account with this email address already exists. Please log in instead.'
      });
    }

    if (purpose === 'RESET_CREDENTIAL' && !existingUser) {
      return res.status(404).json({
        success: false,
        error: 'No account found with this email address.'
      });
    }

    const otpResult = await otpService.createAndSendOtp(normalizedEmail, purpose);

    res.json({
      success: true,
      message: `A 6-digit verification code has been dispatched to ${normalizedEmail}.`,
      ...(otpResult.otp ? { devOtp: otpResult.otp } : {})
    });
  } catch (err) {
    next(err);
  }
}

// 2. Register Senior Citizen (Elder)
async function registerElder(req, res, next) {
  try {
    const schema = z.object({
      email: z.string().email(),
      otp: z.string().min(6).max(6),
      name: z.string().min(2),
      pin: z.string().regex(/^\d{4}$/, 'PIN must be exactly 4 digits'),
      phone: z.string().optional(),
      emergencyPhone: z.string().optional(),
      bloodGroup: z.string().optional(),
      medicalNotes: z.string().optional()
    });

    const data = schema.parse(req.body);
    const normalizedEmail = data.email.toLowerCase().trim();

    // Verify OTP
    const isOtpValid = await otpService.verifyOtp(normalizedEmail, data.otp, 'REGISTER');
    if (!isOtpValid) {
      return res.status(400).json({ success: false, error: 'Invalid or expired verification code' });
    }

    const hashedPin = await bcrypt.hash(data.pin, 10);
    const linkCode = generateLinkCode();

    const user = await prisma.user.create({
      data: {
        name: data.name,
        email: normalizedEmail,
        phone: data.phone,
        role: 'ELDER',
        pinHash: hashedPin,
        emailVerified: true,
        elderProfile: {
          create: {
            linkCode,
            emergencyPhone: data.emergencyPhone,
            bloodGroup: data.bloodGroup,
            medicalNotes: data.medicalNotes || 'General senior care',
            activeGraceMinutes: 15
          }
        }
      },
      include: { elderProfile: true }
    });

    const token = signToken(user.id, user.role);
    setAuthCookie(res, token);

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        elderProfileId: user.elderProfile?.id,
        linkCode: user.elderProfile?.linkCode
      }
    });
  } catch (err) {
    next(err);
  }
}

// 3. Register Caretaker or Family Member
async function registerCaregiver(req, res, next) {
  try {
    const schema = z.object({
      email: z.string().email(),
      otp: z.string().min(6).max(6),
      name: z.string().min(2),
      password: z.string().min(6, 'Password must be at least 6 characters'),
      phone: z.string().optional(),
      role: z.enum(['CARETAKER', 'FAMILY']).default('CARETAKER'),
      relationship: z.string().min(2),
      linkCode: z.string().optional() // Senior's link code
    });

    const data = schema.parse(req.body);
    const normalizedEmail = data.email.toLowerCase().trim();

    const isOtpValid = await otpService.verifyOtp(normalizedEmail, data.otp, 'REGISTER');
    if (!isOtpValid) {
      return res.status(400).json({ success: false, error: 'Invalid or expired verification code' });
    }

    let linkedElderProfile = null;
    if (data.linkCode && data.linkCode.trim()) {
      linkedElderProfile = await prisma.elderProfile.findUnique({
        where: { linkCode: data.linkCode.trim().toUpperCase() }
      });
      if (!linkedElderProfile) {
        return res.status(404).json({ success: false, error: 'Patient Link Code not found. Please double-check the code with the patient.' });
      }
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    const user = await prisma.user.create({
      data: {
        name: data.name,
        email: normalizedEmail,
        phone: data.phone,
        role: data.role,
        passwordHash: hashedPassword,
        emailVerified: true
      }
    });

    if (linkedElderProfile) {
      await prisma.caregiverLink.create({
        data: {
          elderProfileId: linkedElderProfile.id,
          caregiverId: user.id,
          relationship: data.relationship,
          canEditMeds: data.role === 'CARETAKER',
          canEditAppointments: true,
          canViewLogs: true,
          status: 'ACTIVE'
        }
      });
    }

    const token = signToken(user.id, user.role);
    setAuthCookie(res, token);

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        linkedElderProfileId: linkedElderProfile?.id || null
      }
    });
  } catch (err) {
    next(err);
  }
}

// 4. Login (Elder PIN vs Caretaker/Admin Password)
async function login(req, res, next) {
  try {
    const loginSchema = z.object({
      email: z.string().email(),
      pin: z.string().optional(),
      password: z.string().optional()
    });
    const { email, pin, password } = loginSchema.parse(req.body);

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
      include: {
        elderProfile: true,
        caregiverLinks: {
          where: { status: 'ACTIVE' },
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

    if (user.lockedUntil && user.lockedUntil > new Date()) {
      const waitMinutes = Math.ceil((user.lockedUntil - new Date()) / 60000);
      return res.status(403).json({
        success: false,
        error: `Account is temporarily locked due to failed attempts. Please try again in ${waitMinutes} minutes.`
      });
    }

    let isValid = false;

    if (user.role === 'ELDER') {
      if (!pin) {
        return res.status(400).json({ success: false, error: '4-digit PIN is required for senior accounts' });
      }
      isValid = await bcrypt.compare(pin, user.pinHash || '');
    } else {
      if (!password) {
        return res.status(400).json({ success: false, error: 'Password is required' });
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
        elderProfileId: user.elderProfile?.id || null,
        linkCode: user.elderProfile?.linkCode || null
      }
    });
  } catch (err) {
    next(err);
  }
}

// 5. Reset Credential via OTP
async function resetCredential(req, res, next) {
  try {
    const schema = z.object({
      email: z.string().email(),
      otp: z.string().min(6).max(6),
      newCredential: z.string().min(4)
    });
    const { email, otp, newCredential } = schema.parse(req.body);
    const normalizedEmail = email.toLowerCase().trim();

    const isOtpValid = await otpService.verifyOtp(normalizedEmail, otp, 'RESET_CREDENTIAL');
    if (!isOtpValid) {
      return res.status(400).json({ success: false, error: 'Invalid or expired verification code' });
    }

    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail }
    });

    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    if (user.role === 'ELDER') {
      if (!/^\d{4}$/.test(newCredential)) {
        return res.status(400).json({ success: false, error: 'Senior PIN must be exactly 4 digits' });
      }
      const hashedPin = await bcrypt.hash(newCredential, 10);
      await prisma.user.update({
        where: { id: user.id },
        data: { pinHash: hashedPin, failedAttempts: 0, lockedUntil: null }
      });
    } else {
      if (newCredential.length < 6) {
        return res.status(400).json({ success: false, error: 'Password must be at least 6 characters' });
      }
      const hashedPassword = await bcrypt.hash(newCredential, 10);
      await prisma.user.update({
        where: { id: user.id },
        data: { passwordHash: hashedPassword, failedAttempts: 0, lockedUntil: null }
      });
    }

    res.json({
      success: true,
      message: 'Credentials updated successfully. You can now log in.'
    });
  } catch (err) {
    next(err);
  }
}

// 6. Setup Admin Account
async function setupAdmin(req, res, next) {
  try {
    const schema = z.object({
      email: z.string().email(),
      name: z.string().min(2),
      password: z.string().min(6)
    });
    const { email, name, password } = schema.parse(req.body);

    const existingAdmin = await prisma.user.findFirst({
      where: { role: 'ADMIN' }
    });

    if (existingAdmin) {
      return res.status(400).json({
        success: false,
        error: 'Admin account is already configured. Please log in directly.'
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const adminUser = await prisma.user.create({
      data: {
        name,
        email: email.toLowerCase().trim(),
        role: 'ADMIN',
        passwordHash: hashedPassword,
        emailVerified: true
      }
    });

    const token = signToken(adminUser.id, adminUser.role);
    setAuthCookie(res, token);

    res.status(201).json({
      success: true,
      token,
      user: {
        id: adminUser.id,
        name: adminUser.name,
        email: adminUser.email,
        role: adminUser.role
      }
    });
  } catch (err) {
    next(err);
  }
}

// 7. Get Current Session
async function getMe(req, res, next) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: {
        elderProfile: true,
        caregiverLinks: {
          where: { status: 'ACTIVE' },
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
  sendOtp,
  registerElder,
  registerCaregiver,
  login,
  resetCredential,
  setupAdmin,
  getMe,
  logout
};
