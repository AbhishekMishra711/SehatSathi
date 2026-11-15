const dotenv = require('dotenv');
dotenv.config();

module.exports = {
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  jwtSecret: process.env.JWT_SECRET || 'sehatsathi-default-secret-change-in-prod',
  cronSecret: process.env.CRON_SECRET || 'sehatsathi-cron-trigger-key-98765',
  resendApiKey: process.env.RESEND_API_KEY || '',
  geminiApiKey: process.env.GEMINI_API_KEY || '',
  geminiModel: process.env.GEMINI_MODEL || 'gemini-flash-lite-latest',
  emailFrom: process.env.EMAIL_FROM || 'onboarding@resend.dev',
};

