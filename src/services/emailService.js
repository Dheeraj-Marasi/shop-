const nodemailer = require('nodemailer');
const { getTransporter } = require('../config/mailer');
const { resolveAndRenderEmail } = require('../templates');
const activityStore = require('./activityStore');

/**
 * Send activity confirmation email
 * @param {Object} payload 
 * @param {Object} clientMeta - Optional IP, User-Agent from HTTP request
 */
async function sendActivityConfirmation(payload, clientMeta = {}) {
  // Normalize payload
  const user = payload.user || {};
  const recipientEmail = user.email || payload.email || payload.recipient;
  const recipientName = user.name || payload.name || 'Valued User';

  if (!recipientEmail || !validateEmail(recipientEmail)) {
    throw new Error(`Invalid or missing recipient email: "${recipientEmail}"`);
  }

  // Enrich activity with client metadata if not supplied
  const activity = payload.activity || {};
  if (!activity.type) {
    activity.type = payload.type || 'activity';
  }
  if (!activity.title) {
    activity.title = payload.title || `Activity: ${activity.type}`;
  }
  if (!activity.timestamp) {
    activity.timestamp = new Date().toUTCString();
  }
  if (!activity.ip && clientMeta.ip) {
    activity.ip = clientMeta.ip;
  }
  if (!activity.userAgent && clientMeta.userAgent) {
    activity.userAgent = clientMeta.userAgent;
  }
  if (!activity.device && activity.userAgent) {
    activity.device = parseUserAgent(activity.userAgent);
  }

  const normalizedPayload = {
    user: { email: recipientEmail, name: recipientName },
    activity
  };

  // Render email
  const rendered = resolveAndRenderEmail(normalizedPayload);

  // Record pending activity in store
  const record = activityStore.add({
    recipientEmail,
    recipientName,
    activityType: rendered.activityType,
    activityTitle: activity.title,
    subject: rendered.subject,
    status: 'sending',
    ip: activity.ip,
    device: activity.device
  });

  try {
    const { transporter, info } = await getTransporter();

    const fromAddress = process.env.EMAIL_FROM || `"${process.env.COMPANY_NAME || 'Our Website'}" <no-reply@example.com>`;

    const mailOptions = {
      from: fromAddress,
      to: `"${recipientName}" <${recipientEmail}>`,
      subject: rendered.subject,
      text: rendered.text,
      html: rendered.html
    };

    const sendResult = await transporter.sendMail(mailOptions);

    let previewUrl = null;
    if (info.mode === 'ethereal') {
      previewUrl = nodemailer.getTestMessageUrl(sendResult);
    }

    // Update record
    activityStore.update(record.id, {
      status: 'sent',
      messageId: sendResult.messageId,
      previewUrl: previewUrl || null
    });

    console.log(`✉️ Email successfully dispatched to ${recipientEmail} [Activity: ${activity.type}]`);
    if (previewUrl) {
      console.log(`🔗 Preview URL: ${previewUrl}`);
    }

    return {
      success: true,
      activityId: record.id,
      messageId: sendResult.messageId,
      recipient: recipientEmail,
      activityType: rendered.activityType,
      subject: rendered.subject,
      previewUrl,
      mode: info.mode
    };
  } catch (err) {
    console.error('❌ Failed to dispatch email:', err);
    activityStore.update(record.id, {
      status: 'failed',
      error: err.message
    });

    throw err;
  }
}

/**
 * Basic email format validator
 */
function validateEmail(email) {
  if (typeof email !== 'string') return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

/**
 * Friendly device name extractor from user-agent string
 */
function parseUserAgent(ua) {
  if (!ua || typeof ua !== 'string') return 'Unknown Browser';
  let browser = 'Browser';
  let os = 'Device';

  if (ua.includes('Edg/')) browser = 'Microsoft Edge';
  else if (ua.includes('Chrome/')) browser = 'Google Chrome';
  else if (ua.includes('Firefox/')) browser = 'Mozilla Firefox';
  else if (ua.includes('Safari/') && !ua.includes('Chrome/')) browser = 'Apple Safari';

  if (ua.includes('Windows')) os = 'Windows';
  else if (ua.includes('Mac OS') || ua.includes('Macintosh')) os = 'macOS';
  else if (ua.includes('Android')) os = 'Android';
  else if (ua.includes('iPhone') || ua.includes('iPad')) os = 'iOS';
  else if (ua.includes('Linux')) os = 'Linux';

  return `${browser} on ${os}`;
}

module.exports = {
  sendActivityConfirmation,
  validateEmail,
  parseUserAgent
};
