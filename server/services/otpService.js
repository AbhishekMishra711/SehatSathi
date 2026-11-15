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
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes strictly

  await prisma.emailOtp.create({
    data: {
      email: normalizedEmail,
      otp,
      purpose,
      expiresAt
    }
  });

  const subject = purpose === 'RESET_CREDENTIAL'
    ? 'SehatSathi - Your Password / PIN Reset Code'
    : 'SehatSathi - Your Verification Code';

  const htmlText = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 500px; margin: 0 auto; padding: 28px; border: 1.5px solid #76c893; border-radius: 12px; background-color: #FFFFFF;">
      ${mailer.getEmailBrandedHeader()}
      <h3 style="color: #184e77; margin: 0 0 10px 0; font-size: 19px; font-weight: 800;">Security Verification Code</h3>
      <p style="font-size: 15px; color: #0F172A; line-height: 1.5; margin-bottom: 16px;">
        Hello, use the following one-time verification code to complete your verification:
      </p>
      <div style="background-color: #F0FDF4; border: 2px dashed #52b69a; border-radius: 10px; padding: 20px; text-align: center; margin: 24px 0;">
        <span style="font-size: 38px; font-weight: 800; letter-spacing: 8px; color: #184e77;">${otp}</span>
      </div>
      <p style="font-size: 13px; color: #475569; line-height: 1.5;">
        This code is valid for <strong>5 minutes</strong>. If you did not request this, please disregard this email.
      </p>
      <hr style="border: none; border-top: 1px solid #E2E8F0; margin: 24px 0 16px 0;" />
      <p style="font-size: 12px; color: #64748B; margin: 0;">
        SehatSathi &bull; Dignified Senior Care &bull; Prompt Wars X Catalyst 2026
      </p>
    </div>
  `;

  const plainText = `Your SehatSathi verification code is: ${otp}. Valid for 5 minutes.`;

  const mailResult = await mailer.sendEmailNotification({
    to: normalizedEmail,
    subject,
    htmlText,
    plainText
  });

  if (!mailResult.success) {
    console.error(`[OTP Error] Email delivery to ${normalizedEmail} failed:`, mailResult.error);
    const errText = mailResult.error || '';
    if (errText.toLowerCase().includes('testing emails') || errText.toLowerCase().includes('verify a domain')) {
      throw new Error(
        `Resend Free Sandbox restriction: Can only send to ${config.emailFrom.includes('resend.dev') ? 'registered account email' : 'verified domain'}. ` +
        `To send to ANY email address (e.g. ${normalizedEmail}) 100% free with NO credit card, configure free Gmail SMTP in .env (add GMAIL_USER and GMAIL_APP_PASSWORD).`
      );
    }
    throw new Error(`Email delivery failed: ${mailResult.error || 'Mail provider error'}`);
  }

  return { success: true };
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
