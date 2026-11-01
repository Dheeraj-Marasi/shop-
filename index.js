require('dotenv').config();
const app = require('./src/app');
const { getTransporter } = require('./src/config/mailer');

const PORT = process.env.PORT || 3000;

async function startServer() {
  try {
    // Warm up mail transporter
    console.log('🚀 Initializing Activity Email Notification Service...');
    const { info } = await getTransporter();

    app.listen(PORT, () => {
      console.log('====================================================');
      console.log(`✅ Activity Email Service is running on http://localhost:${PORT}`);
      console.log(`📡 API Endpoint: http://localhost:${PORT}/api/activity/notify`);
      console.log(`🖥️  Interactive Dashboard: http://localhost:${PORT}`);
      console.log(`📦 Client SDK script: http://localhost:${PORT}/sdk/website-tracker.js`);
      console.log(`✉️  Mail Provider Mode: ${info.mode.toUpperCase()}`);
      if (info.isTestMode) {
        console.log(`ℹ️  Test mode active: Sent emails generate live web preview URLs in response & dashboard.`);
      }
      console.log('====================================================');
    });
  } catch (error) {
    console.error('Fatal error starting server:', error);
    process.exit(1);
  }
}

startServer();
