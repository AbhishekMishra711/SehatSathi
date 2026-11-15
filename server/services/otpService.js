const crypto = require('crypto');
const prisma = require('../db/prisma');
const mailer = require('./mailer');
const config = require('../config');

function generateOtp() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

async function createAndSendOtp(email, purpose = 'REGISTER') {
  const normalizedEmail = email.toLowerCase().trim();

  // Invalidate any existing unused OTPs for this email and purpose
  await prisma.emailOtp.updateMany({
    where: {
      email: normalizedEmail,
      purpose,
      used: false
    },
    data: { used: true }
  });

  const otp = generateOtp();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  await prisma.emailOtp.create({
    data: {
      email: normalizedEmail,
      otp,
      purpose,
      expiresAt
    }
  });

  if (config.nodeEnv === 'development') {
    console.log(`[DEV SECURITY LOG] OTP for ${normalizedEmail} (${purpose}): ${otp}`);
  }

  const subject = purpose === 'RESET_CREDENTIAL'
    ? 'SehatSathi Password / PIN Reset Code'
    : 'SehatSathi Verification Code';

  const htmlText = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 500px; margin: 0 auto; padding: 24px; border: 1px solid #E2E8F0; border-radius: 10px; background-color: #FFFFFF;">
      <div style="border-bottom: 2px solid #184e77; padding-bottom: 12px; margin-bottom: 16px;">
        <h2 style="color: #184e77; margin: 0; font-size: 20px;">SehatSathi Security Verification</h2>
      </div>
      <p style="font-size: 15px; color: #0F172A; line-height: 1.5;">
        Use the following one-time verification code to continue:
      </p>
      <div style="background-color: #F8FAFC; border: 1px dashed #168aad; border-radius: 8px; padding: 18px; text-align: center; margin: 20px 0;">
        <span style="font-size: 32px; font-weight: 800; letter-spacing: 6px; color: #184e77;">${otp}</span>
      </div>
      <p style="font-size: 13px; color: #475569;">
        This verification code is valid for <strong>10 minutes</strong>. Never share this code with anyone.
      </p>
      <hr style="border: none; border-top: 1px solid #E2E8F0; margin: 24px 0 16px 0;" />
      <p style="font-size: 12px; color: #94A3B8; margin: 0;">
        SehatSathi &bull; Dignified Elderly Care & Medication Management
      </p>
    </div>
  `;

  const plainText = `Your SehatSathi verification code is: ${otp}. Valid for 10 minutes.`;

  const mailResult = await mailer.sendEmailNotification({
    to: normalizedEmail,
    subject,
    htmlText,
    plainText
  });

  return {
    success: true,
    mailSent: mailResult.success,
    otp: config.nodeEnv === 'development' ? otp : undefined
  };
}

async function verifyOtp(email, otp, purpose = 'REGISTER') {
  const normalizedEmail = email.toLowerCase().trim();
  const cleanOtp = otp.toString().trim();

  const record = await prisma.emailOtp.findFirst({
    where: {
      email: normalizedEmail,
      otp: cleanOtp,
      purpose,
      used: false,
      expiresAt: { gt: new Date() }
    },
    orderBy: { createdAt: 'desc' }
  });

  if (!record) {
    return false;
  }

  // Mark as used
  await prisma.emailOtp.update({
    where: { id: record.id },
    data: { used: true }
  });

  return true;
}

module.exports = {
  createAndSendOtp,
  verifyOtp
};
