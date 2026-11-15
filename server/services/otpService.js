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
    : purpose === 'ADMIN_LOGIN'
    ? 'SehatSathi Admin Security Code (Master Access)'
    : 'SehatSathi - Your Verification Code';

  const htmlText = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 520px; margin: 0 auto; padding: 32px 20px; background-color: #FFFFFF; color: #1F2937;">
      ${mailer.getEmailBrandedHeader()}
      
      <p style="font-size: 15px; color: #1F2937; line-height: 1.5; margin: 0 0 16px 0;">
        We're verifying a recent ${purpose === 'ADMIN_LOGIN' ? 'administrator sign-in' : 'account verification'} request for <strong style="color: #184e77;">${normalizedEmail}</strong>:
      </p>

      <div style="margin: 22px 0 24px 0; padding: 18px 24px; background-color: #F8FAFC; border-radius: 8px; border-left: 4px solid #168aad;">
        <span style="font-size: 11px; font-weight: 800; color: #64748B; text-transform: uppercase; letter-spacing: 1px; display: block; margin-bottom: 6px;">One-Time Verification Code</span>
        <span style="font-size: 34px; font-weight: 800; letter-spacing: 6px; color: #184e77; font-family: monospace;">${otp}</span>
      </div>

      <table cellpadding="0" cellspacing="0" border="0" style="font-size: 14px; color: #475569; margin: 0 0 24px 0; line-height: 1.6;">
        <tr>
          <td style="font-weight: 700; padding-right: 12px; color: #1F2937;">Timestamp:</td>
          <td>${new Date().toUTCString()}</td>
        </tr>
        <tr>
          <td style="font-weight: 700; padding-right: 12px; color: #1F2937;">Code Expiry:</td>
          <td><strong>5 Minutes</strong> (Strictly single-use)</td>
        </tr>
      </table>

      <p style="font-size: 14px; color: #475569; line-height: 1.5; margin: 0 0 16px 0;">
        You're receiving this message because of a verification action on SehatSathi. <strong>If you did not request this verification, please disregard this email.</strong>
      </p>

      <p style="font-size: 14px; color: #1F2937; margin: 28px 0 0 0;">
        Thanks,<br />
        <strong>The SehatSathi Care & Security Team</strong>
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
