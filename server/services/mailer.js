const { Resend } = require('resend');
const config = require('../config');

let resendClient = null;
if (config.resendApiKey) {
  resendClient = new Resend(config.resendApiKey);
}

async function sendEmailNotification({ to, subject, htmlText, plainText }) {
  if (!resendClient) {
    console.warn(`[Mailer Mock] Email to ${to} skipped: No API Key configured.`);
    return { success: true, simulated: true };
  }

  try {
    const payload = {
      from: config.emailFrom,
      to: [to],
      subject,
      text: plainText,
      html: htmlText
    };

    const response = await resendClient.emails.send(payload);
    if (response.error) {
      console.error(`[Mailer Error] Failed to send email to ${to}:`, response.error.message);
      return { success: false, error: response.error.message };
    }

    return { success: true, id: response.data?.id };
  } catch (err) {
    console.error(`[Mailer Exception] ${err.message}`);
    return { success: false, error: err.message };
  }
}

function getElderReminderEmail(elderName, medicationName, dosage, instructions) {
  return {
    subject: `Medication Reminder: ${medicationName} (${dosage})`,
    plainText: `Hello ${elderName},\n\nIt is time to take your scheduled dose of ${medicationName} (${dosage}).\nInstructions: ${instructions}\n\nPlease open SehatSathi and confirm once taken.\n\nWarm regards,\nSehatSathi Care Team`,
    htmlText: `
      <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto; padding: 24px; border: 1px solid #E5E7EB; border-radius: 8px;">
        <h2 style="color: #0F4C5C; margin-top: 0;">Medication Reminder</h2>
        <p style="font-size: 16px; color: #1F2937;">Hello <strong>${elderName}</strong>,</p>
        <p style="font-size: 16px; color: #1F2937;">It is time for your scheduled medication:</p>
        <div style="background-color: #F3F4F6; padding: 16px; border-radius: 6px; margin: 16px 0;">
          <p style="margin: 0; font-size: 18px; font-weight: bold; color: #111827;">${medicationName} (${dosage})</p>
          <p style="margin: 8px 0 0 0; color: #4B5563;">${instructions}</p>
        </div>
        <p style="font-size: 15px; color: #4B5563;">Please open SehatSathi on your phone and tap <strong>"I took it"</strong> once completed.</p>
        <hr style="border: none; border-top: 1px solid #E5E7EB; margin: 24px 0;" />
        <p style="font-size: 13px; color: #6B7280; margin-bottom: 0;">SehatSathi &bull; Dignified Senior Care</p>
      </div>
    `
  };
}

function getCaretakerAlertEmail(caretakerName, elderName, medicationName, scheduledTime, graceMinutes) {
  return {
    subject: `Escalation Notice: ${elderName} missed scheduled dose of ${medicationName}`,
    plainText: `Attention ${caretakerName},\n\n${elderName} has not confirmed taking ${medicationName} scheduled for ${scheduledTime}.\nThe ${graceMinutes}-minute grace window has passed without confirmation.\n\nPlease check in with them to ensure their safety and well-being.\n\nSehatSathi Automated Escalation System`,
    htmlText: `
      <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto; padding: 24px; border: 1px solid #FCA5A5; border-radius: 8px;">
        <div style="background-color: #FEF2F2; padding: 12px 16px; border-radius: 6px; margin-bottom: 16px;">
          <h3 style="color: #991B1B; margin: 0;">Dose Escalation Alert</h3>
        </div>
        <p style="font-size: 16px; color: #1F2937;">Attention <strong>${caretakerName}</strong>,</p>
        <p style="font-size: 15px; color: #374151;">
          <strong>${elderName}</strong> was scheduled to take <strong>${medicationName}</strong> at <strong>${scheduledTime}</strong>.
        </p>
        <p style="font-size: 15px; color: #374151;">
          The ${graceMinutes}-minute grace period has passed without confirmation on the SehatSathi portal.
        </p>
        <p style="font-size: 15px; color: #991B1B; font-weight: bold;">
          Action Required: Please check in with ${elderName} directly.
        </p>
        <hr style="border: none; border-top: 1px solid #E5E7EB; margin: 24px 0;" />
        <p style="font-size: 13px; color: #6B7280; margin-bottom: 0;">SehatSathi Automated Escalation Engine</p>
      </div>
    `
  };
}

module.exports = {
  sendEmailNotification,
  getElderReminderEmail,
  getCaretakerAlertEmail
};
