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

// Dynamic Transporter Factory so any runtime or .env update is picked up instantly
function getSmtpTransporter() {
  const user = (process.env.GMAIL_USER || config.smtpUser || '').trim();
  const pass = (process.env.GMAIL_APP_PASSWORD || config.smtpPass || '').replace(/\s+/g, '');

  if (user && pass) {
    return {
      user,
      transporter: nodemailer.createTransport({
        service: 'gmail',
        auth: { user, pass }
      })
    };
  }
  return null;
}

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

  const smtp = getSmtpTransporter();

  // Option A: Send via Nodemailer (Zero restrictions, delivers to ANY email free of cost)
  if (smtp) {
    try {
      const mailOptions = {
        from: `"SehatSathi Care" <${smtp.user}>`,
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

      const info = await smtp.transporter.sendMail(mailOptions);
      console.log(`[Mailer SMTP] Successfully delivered email to ${to}. MessageId: ${info.messageId}`);
      return { success: true, id: info.messageId, provider: 'smtp' };
    } catch (err) {
      console.error(`[Mailer SMTP Error] Could not send via Gmail SMTP to ${to}:`, err.message);
      return { success: false, error: `Gmail SMTP Error: ${err.message}`, provider: 'smtp' };
    }
  }

  // Option B: Send via Resend API (Fallback if no Gmail credentials provided)
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
    <table cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 16px;">
      <tr>
        <td style="vertical-align: middle; padding-right: 12px;">
          <img src="cid:sehatsathi-logo" alt="SehatSathi" width="40" height="40" style="display: block; border-radius: 6px;" />
        </td>
        <td style="vertical-align: middle;">
          <span style="font-size: 24px; font-weight: 800; color: #184e77; letter-spacing: -0.5px;">SehatSathi</span>
        </td>
      </tr>
    </table>
    <hr style="border: none; border-top: 1px solid #E5E7EB; margin: 0 0 24px 0;" />
  `;
}

function getElderReminderEmail(elderName, medicationName, dosage, instructions) {
  return {
    subject: `SehatSathi Reminder: Time for your ${medicationName} (${dosage})`,
    plainText: `Hello ${elderName},\n\nIt is time to take your scheduled dose of ${medicationName} (${dosage}).\nInstructions: ${instructions}\n\nPlease open SehatSathi and tap 'I took it' once taken.\n\nWarm regards,\nSehatSathi Care Team`,
    htmlText: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 500px; margin: 0 auto; padding: 26px; border: 1.5px solid #009F6B; border-radius: 12px; background-color: #FFFFFF;">
        ${getEmailBrandedHeader()}
        <h3 style="color: #009F6B; margin-top: 0; font-size: 18px;">Medication Reminder</h3>
        <p style="font-size: 15px; color: #1F2937;">Hello <strong>${elderName}</strong>,</p>
        <p style="font-size: 15px; color: #1F2937;">It is time for your scheduled medication:</p>
        <div style="background-color: #F0FDF4; border: 1.5px solid #00AC73; padding: 16px; border-radius: 8px; margin: 16px 0;">
          <p style="margin: 0; font-size: 18px; font-weight: 800; color: #009F6B;">${medicationName} (${dosage})</p>
          <p style="margin: 8px 0 0 0; color: #334155; font-size: 14px;">${instructions}</p>
        </div>
        <p style="font-size: 14px; color: #475569;">Please open SehatSathi on your phone and tap <strong>"I took it"</strong> once completed.</p>
        <hr style="border: none; border-top: 1px solid #E2E8F0; margin: 22px 0 14px 0;" />
        <p style="font-size: 12px; color: #64748B; margin-bottom: 0;">SehatSathi &bull; Senior Medication Reminders &bull; Prompt Wars X Catalyst 2026</p>
      </div>
    `
  };
}

function getCaretakerAlertEmail(caretakerName, elderName, medicationName, scheduledTime, graceMinutes) {
  return {
    subject: `Escalation Notice: ${elderName} missed scheduled dose of ${medicationName}`,
    plainText: `Attention ${caretakerName},\n\n${elderName} has not confirmed taking ${medicationName} scheduled for ${scheduledTime}.\nThe ${graceMinutes}-minute grace window has passed without confirmation.\n\nPlease check in with them.\n\nSehatSathi Care Team`,
    htmlText: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 500px; margin: 0 auto; padding: 26px; border: 1.5px solid #FCA5A5; border-radius: 12px; background-color: #FFFFFF;">
        ${getEmailBrandedHeader()}
        <div style="background-color: #FEF2F2; border-left: 4px solid #DC2626; padding: 12px 16px; border-radius: 6px; margin-bottom: 16px;">
          <h3 style="color: #991B1B; margin: 0; font-size: 17px;">Dose Escalation Alert</h3>
        </div>
        <p style="font-size: 15px; color: #1F2937;">Attention <strong>${caretakerName}</strong>,</p>
        <p style="font-size: 15px; color: #374151;">
          <strong>${elderName}</strong> was scheduled to take <strong>${medicationName}</strong> at <strong>${scheduledTime}</strong>.
        </p>
        <p style="font-size: 15px; color: #374151;">
          The ${graceMinutes}-minute grace period has passed without confirmation in SehatSathi.
        </p>
        <p style="font-size: 15px; color: #991B1B; font-weight: 800;">
          Action Required: Please check in with ${elderName} directly.
        </p>
        <hr style="border: none; border-top: 1px solid #E2E8F0; margin: 22px 0 14px 0;" />
        <p style="font-size: 12px; color: #64748B; margin-bottom: 0;">SehatSathi &bull; Senior Medication Reminders &bull; Prompt Wars X Catalyst 2026</p>
      </div>
    `
  };
}

function getCaretakerDoseTakenEmail(caretakerName, elderName, medicationName, dosage, takenTime) {
  return {
    subject: `Dose Taken Confirmation: ${elderName} took ${medicationName} (${dosage})`,
    plainText: `Hello ${caretakerName},\n\n${elderName} has marked their dose of ${medicationName} (${dosage}) as taken at ${takenTime}.\n\nSehatSathi Care Team`,
    htmlText: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 500px; margin: 0 auto; padding: 26px; border: 1.5px solid #A7F3D0; border-radius: 12px; background-color: #FFFFFF;">
        ${getEmailBrandedHeader()}
        <div style="background-color: #ECFDF5; border-left: 4px solid #00AC73; padding: 12px 16px; border-radius: 6px; margin-bottom: 16px;">
          <h3 style="color: #065F46; margin: 0; font-size: 17px;">Dose Taken Confirmation</h3>
        </div>
        <p style="font-size: 15px; color: #1F2937;">Hello <strong>${caretakerName}</strong>,</p>
        <p style="font-size: 15px; color: #374151;">
          <strong>${elderName}</strong> marked the scheduled dose as taken in SehatSathi:
        </p>
        <div style="background-color: #F8FAFC; border: 1px solid #E2E8F0; padding: 14px 18px; border-radius: 8px; margin: 16px 0;">
          <p style="margin: 0; font-size: 16px; font-weight: 700; color: #0F172A;">${medicationName} (${dosage})</p>
          <p style="margin: 4px 0 0 0; color: #00AC73; font-weight: 600; font-size: 14px;">Recorded At: ${takenTime}</p>
        </div>
        <p style="font-size: 14px; color: #64748B;">No further action is required. The schedule is on track.</p>
        <hr style="border: none; border-top: 1px solid #E2E8F0; margin: 22px 0 14px 0;" />
        <p style="font-size: 12px; color: #64748B; margin-bottom: 0;">SehatSathi &bull; Senior Medication Reminders &bull; Prompt Wars X Catalyst 2026</p>
      </div>
    `
  };
}

function getElderUpcomingDoseEmail(elderName, medicationName, dosage, instructions, scheduledTime) {
  return {
    subject: `Upcoming Medication: ${medicationName} is due in 10 minutes (${scheduledTime})`,
    plainText: `Hello ${elderName},\n\nThis is a reminder that your dose of ${medicationName} (${dosage}) is scheduled in 10 minutes at ${scheduledTime}.\nInstructions: ${instructions}\n\nPlease have a glass of water ready and tap 'I took it' once you take your dose.\n\nSehatSathi Care Team`,
    htmlText: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 500px; margin: 0 auto; padding: 26px; border: 1.5px solid #00AC73; border-radius: 12px; background-color: #FFFFFF;">
        ${getEmailBrandedHeader()}
        <div style="background-color: #E8F8EE; border-left: 4px solid #00AC73; padding: 12px 16px; border-radius: 6px; margin-bottom: 16px;">
          <h3 style="color: #00704A; margin: 0; font-size: 17px;">Upcoming Dose in 10 Minutes</h3>
        </div>
        <p style="font-size: 15px; color: #1F2937;">Hello <strong>${elderName}</strong>,</p>
        <p style="font-size: 15px; color: #374151;">
          Your upcoming scheduled dose is due in 10 minutes:
        </p>
        <div style="background-color: #F8FAFC; border: 1px solid #E2E8F0; padding: 14px 18px; border-radius: 8px; margin: 16px 0;">
          <p style="margin: 0; font-size: 17px; font-weight: 800; color: #00AC73;">${medicationName} (${dosage})</p>
          <p style="margin: 6px 0 0 0; color: #0F172A; font-size: 14px; font-weight: 600;">Due Time: ${scheduledTime}</p>
          <p style="margin: 4px 0 0 0; color: #475569; font-size: 13px;">${instructions}</p>
        </div>
        <p style="font-size: 14px; color: #475569;">Please take this dose with water and tap 'I took it' in your SehatSathi app.</p>
        <hr style="border: none; border-top: 1px solid #E2E8F0; margin: 22px 0 14px 0;" />
        <p style="font-size: 12px; color: #64748B; margin-bottom: 0;">SehatSathi &bull; Senior Medication Reminders &bull; Prompt Wars X Catalyst 2026</p>
      </div>
    `
  };
}

module.exports = {
  sendEmailNotification,
  getEmailBrandedHeader,
  getElderReminderEmail,
  getCaretakerAlertEmail,
  getCaretakerDoseTakenEmail,
  getElderUpcomingDoseEmail
};
