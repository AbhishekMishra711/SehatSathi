const jwt = require('jsonwebtoken');
const config = require('../config');
const prisma = require('../db/prisma');

const loginAttempts = new Map();

function rateLimitLogin(req, res, next) {
  const ip = req.ip || req.connection.remoteAddress || 'unknown';
  const now = Date.now();
  const windowMs = 15 * 60 * 1000;
  const maxAttempts = 5;

  const record = loginAttempts.get(ip) || { count: 0, resetTime: now + windowMs };

  if (now > record.resetTime) {
    record.count = 0;
    record.resetTime = now + windowMs;
  }

  if (record.count >= maxAttempts) {
    const retryAfter = Math.ceil((record.resetTime - now) / 1000);
    return res.status(429).json({
      success: false,
      error: `Too many login attempts. Please try again in ${retryAfter} seconds.`
    });
  }

  record.count += 1;
  loginAttempts.set(ip, record);
  next();
}

function resetLoginRateLimit(ip) {
  if (ip && loginAttempts.has(ip)) {
    loginAttempts.delete(ip);
  }
}

async function requireAuth(req, res, next) {
  try {
    let token = req.cookies?.token;
    if (!token && req.headers.authorization?.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({ success: false, error: 'Authentication required' });
    }

    const decoded = jwt.verify(token, config.jwtSecret);
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: { elderProfile: true }
    });

    if (!user) {
      return res.status(401).json({ success: false, error: 'User account not found' });
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, error: 'Invalid or expired session token' });
  }
}

function requireRole(allowedRoles) {
  const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ success: false, error: 'Unauthorized for this action' });
    }
    next();
  };
}

module.exports = {
  requireAuth,
  requireRole,
  rateLimitLogin,
  resetLoginRateLimit
};

