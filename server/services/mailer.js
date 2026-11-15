const nodemailer = require('nodemailer');
const { Resend } = require('resend');
const path = require('path');
const fs = require('fs');
const config = require('../config');

// Path to official SehatSathi Logo
const logoPath = path.join(__dirname, '../../client/public/logo.png');
let logoBase64 = '';
if (fs.existsSync(logoPath)) {
  try {
    logoBase64 = fs.readFileSync(logoPath).toString('base64');
  } catch (e) {
    console.warn('[Mailer] Could not read logo file for base64 embed.');
  }
}

// 1. Initialize Nodemailer (Gmail SMTP / Custom SMTP) - Free to ANY email, zero card needed
let nodemailerTransporter = null;
if (config.smtpUser && config.smtpPass) {
  nodemailerTransporter = nodemailer.createTransport({
    service: config.smtpHost === 'smtp.gmail.com' ? 'gmail' : undefined,
    host: config.smtpHost !== 'smtp.gmail.com' ? config.smtpHost : undefined,
    port: config.smtpPort,
    secure: config.smtpSecure,
    auth: {
      user: config.smtpUser,
      pass: config.smtpPass
    }
  });
  console.log(`[Mailer] Initialized Gmail/SMTP provider using account: ${config.smtpUser}`);
}

// 2. Initialize Resend Client
let resendClient = null;
if (config.resendApiKey) {
  resendClient = new Resend(config.resendApiKey);
}

/**
 * Send an email notification using SMTP (Nodemailer) first if available,
 * falling back to Resend API. Both attach the official SehatSathi logo.
 */
async function sendEmailNotification({ to, subject, htmlText, plainText }) {
  // Option 0: In test environment, simulate instant success
  if (config.nodeEnv === 'test' || process.env.NODE_ENV === 'test') {
    return { success: true, simulated: true, id: 'test-email-simulated-id' };
  }

  // Option A: Send via Nodemailer (Zero restrictions, delivers to ANY email free of cost)
  if (nodemailerTransporter) {
    try {
      const mailOptions = {
        from: `"SehatSathi Care" <${config.smtpUser}>`,
        to,
        subject,
        text: plainText,
        html: htmlText,
        attachments: fs.existsSync(logoPath) ? [
          {
            filename: 'logo.png',
            path: logoPath,
            cid: 'sehatsathi-logo'
          }
        ] : []
      };

      const info = await nodemailerTransporter.sendMail(mailOptions);
      console.log(`[Mailer SMTP] Successfully delivered email to ${to}. MessageId: ${info.messageId}`);
      return { success: true, id: info.messageId, provider: 'smtp' };
    } catch (err) {
      console.error(`[Mailer SMTP Error] Could not send via SMTP to ${to}:`, err.message);
      // Fall through to Resend if available
    }
  }

  // Option B: Send via Resend API
  if (resendClient) {
    try {
      const payload = {
        from: config.emailFrom,
        to: [to],
        subject,
        text: plainText,
        html: htmlText
      };

      if (logoBase64) {
        payload.attachments = [
          {
            filename: 'logo.png',
            content: logoBase64,
            cid: 'sehatsathi-logo'
          }
        ];
      }

      const response = await resendClient.emails.send(payload);
      if (response.error) {
        console.error(`[Mailer Resend Error] Failed to send email to ${to}:`, response.error.message);
        return { success: false, error: response.error.message, provider: 'resend' };
      }

      console.log(`[Mailer Resend] Successfully dispatched email to ${to}. ID: ${response.data?.id}`);
      return { success: true, id: response.data?.id, provider: 'resend' };
    } catch (err) {
      console.error(`[Mailer Resend Exception] ${err.message}`);
      return { success: false, error: err.message, provider: 'resend' };
    }
  }

  console.warn(`[Mailer Mock] Email to ${to} skipped: No SMTP or Resend credentials configured.`);
  return { success: true, simulated: true };
}

function getEmailBrandedHeader() {
  return `
    <div style="border-bottom: 2px solid #184e77; padding-bottom: 14px; margin-bottom: 20px;">
      <table cellpadding="0" cellspacing="0" border="0" style="width: 100%;">
        <tr>
          <td style="width: 50px; vertical-align: middle;">
            <img src="cid:sehatsathi-logo" alt="SehatSathi Logo" width="46" height="46" style="display: block; border-radius: 8px;" />
          </td>
          <td style="vertical-align: middle; padding-left: 12px;">
            <span style="font-size: 22px; font-weight: 800; color: #184e77; display: block; line-height: 1.1;">SehatSathi</span>
            <span style="font-size: 11px; font-weight: 800; color: #52b69a; letter-spacing: 0.6px;">DIGNIFIED SENIOR CARE</span>
          </td>
        </tr>
      </table>
    </div>
  `;
}

function getElderReminderEmail(elderName, medicationName, dosage, instructions) {
  return {
    subject: `SehatSathi Reminder: Time for your ${medicationName} (${dosage})`,
    plainText: `Hello ${elderName},\n\nIt is time to take your scheduled dose of ${medicationName} (${dosage}).\nInstructions: ${instructions}\n\nPlease open SehatSathi and tap 'I took it' once taken.\n\nWarm regards,\nSehatSathi Care Team`,
    htmlText: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 500px; margin: 0 auto; padding: 26px; border: 1px solid #76c893; border-radius: 12px; background-color: #FFFFFF;">
        ${getEmailBrandedHeader()}
        <h3 style="color: #184e77; margin-top: 0; font-size: 18px;">Medication Reminder</h3>
        <p style="font-size: 15px; color: #1F2937;">Hello <strong>${elderName}</strong>,</p>
        <p style="font-size: 15px; color: #1F2937;">It is time for your scheduled medication:</p>
        <div style="background-color: #F0FDF4; border: 1.5px solid #52b69a; padding: 16px; border-radius: 8px; margin: 16px 0;">
          <p style="margin: 0; font-size: 18px; font-weight: 800; color: #184e77;">${medicationName} (${dosage})</p>
          <p style="margin: 8px 0 0 0; color: #334155; font-size: 14px;">${instructions}</p>
        </div>
        <p style="font-size: 14px; color: #475569;">Please open SehatSathi on your phone and tap <strong>"I took it"</strong> once completed.</p>
        <hr style="border: none; border-top: 1px solid #E2E8F0; margin: 22px 0 14px 0;" />
        <p style="font-size: 12px; color: #64748B; margin-bottom: 0;">SehatSathi &bull; Dignified Senior Care &bull; Prompt Wars X Catalyst 2026</p>
      </div>
    `
  };
}

function getCaretakerAlertEmail(caretakerName, elderName, medicationName, scheduledTime, graceMinutes) {
  return {
    subject: `Escalation Notice: ${elderName} missed scheduled dose of ${medicationName}`,
    plainText: `Attention ${caretakerName},\n\n${elderName} has not confirmed taking ${medicationName} scheduled for ${scheduledTime}.\nThe ${graceMinutes}-minute grace window has passed without confirmation.\n\nPlease check in with them to ensure their safety and well-being.\n\nSehatSathi Automated Escalation System`,
    htmlText: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 500px; margin: 0 auto; padding: 26px; border: 1px solid #FCA5A5; border-radius: 12px; background-color: #FFFFFF;">
        ${getEmailBrandedHeader()}
        <div style="background-color: #FEF2F2; border-left: 4px solid #DC2626; padding: 12px 16px; border-radius: 6px; margin-bottom: 16px;">
          <h3 style="color: #991B1B; margin: 0; font-size: 17px;">Dose Escalation Alert</h3>
        </div>
        <p style="font-size: 15px; color: #1F2937;">Attention <strong>${caretakerName}</strong>,</p>
        <p style="font-size: 15px; color: #374151;">
          <strong>${elderName}</strong> was scheduled to take <strong>${medicationName}</strong> at <strong>${scheduledTime}</strong>.
        </p>
        <p style="font-size: 15px; color: #374151;">
          The ${graceMinutes}-minute grace period has passed without confirmation on the SehatSathi portal.
        </p>
        <p style="font-size: 15px; color: #991B1B; font-weight: 800;">
          Action Required: Please check in with ${elderName} directly.
        </p>
        <hr style="border: none; border-top: 1px solid #E2E8F0; margin: 22px 0 14px 0;" />
        <p style="font-size: 12px; color: #64748B; margin-bottom: 0;">SehatSathi Automated Escalation Engine &bull; Prompt Wars X Catalyst 2026</p>
      </div>
    `
  };
}

module.exports = {
  sendEmailNotification,
  getEmailBrandedHeader,
  getElderReminderEmail,
  getCaretakerAlertEmail
};
