const nodemailer = require('nodemailer');

let cachedTransporter = null;
let transportInfo = {
  mode: 'uninitialized',
  host: null,
  account: null,
  isTestMode: true
};

/**
 * Initialize or get Nodemailer Transporter
 */
async function getTransporter() {
  if (cachedTransporter) {
    return { transporter: cachedTransporter, info: transportInfo };
  }

  const useEthereal = process.env.USE_ETHEREAL !== 'false' || !process.env.SMTP_USER;

  if (useEthereal) {
    console.log('📧 Setting up Ethereal test mail transporter (zero-config testing mode)...');
    try {
      const testAccount = await nodemailer.createTestAccount();
      cachedTransporter = nodemailer.createTransport({
        host: testAccount.smtp.host,
        port: testAccount.smtp.port,
        secure: testAccount.smtp.secure,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass
        }
      });

      transportInfo = {
        mode: 'ethereal',
        host: testAccount.smtp.host,
        user: testAccount.user,
        isTestMode: true,
        notice: 'Emails sent in this mode generate live preview URLs viewable in your browser.'
      };

      console.log(`✅ Test email transporter ready. Test user: ${testAccount.user}`);
    } catch (err) {
      console.warn('⚠️ Could not connect to Ethereal, falling back to JSON stream transporter:', err.message);
      cachedTransporter = nodemailer.createTransport({
        jsonTransport: true
      });
      transportInfo = {
        mode: 'json-fallback',
        isTestMode: true,
        notice: 'Logs emails as JSON objects.'
      };
    }
  } else {
    // Configured with standard SMTP credentials (Gmail, SendGrid, etc.)
    const port = parseInt(process.env.SMTP_PORT || '587', 10);
    const secure = process.env.SMTP_SECURE === 'true' || port === 465;

    cachedTransporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port,
      secure,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      },
      tls: {
        rejectUnauthorized: false
      }
    });

    transportInfo = {
      mode: 'smtp',
      host: process.env.SMTP_HOST,
      port,
      user: process.env.SMTP_USER,
      isTestMode: false,
      notice: `Connected to live SMTP server: ${process.env.SMTP_HOST}:${port}`
    };

    console.log(`✅ Production SMTP transporter configured for ${process.env.SMTP_HOST}:${port}`);
  }

  return { transporter: cachedTransporter, info: transportInfo };
}

/**
 * Verify transporter connection
 */
async function verifyTransporter() {
  const { transporter, info } = await getTransporter();
  try {
    if (transporter.verify) {
      await transporter.verify();
      return { success: true, info };
    }
    return { success: true, info };
  } catch (error) {
    return { success: false, error: error.message, info };
  }
}

function getTransportInfo() {
  return transportInfo;
}

module.exports = {
  getTransporter,
  verifyTransporter,
  getTransportInfo
};
