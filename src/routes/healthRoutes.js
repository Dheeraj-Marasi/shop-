const express = require('express');
const router = express.Router();
const { getTransportInfo } = require('../config/mailer');

const startTime = Date.now();

/**
 * GET /api/health
 */
router.get('/health', (req, res) => {
  return res.json({
    status: 'ok',
    uptimeSeconds: Math.floor((Date.now() - startTime) / 1000),
    timestamp: new Date().toISOString(),
    service: 'website-activity-email-service',
    version: '1.0.0'
  });
});

/**
 * GET /api/config
 */
router.get('/config', (req, res) => {
  const mailerInfo = getTransportInfo();
  return res.json({
    companyName: process.env.COMPANY_NAME || 'Our Website',
    companyWebsite: process.env.COMPANY_WEBSITE || '',
    supportEmail: process.env.SUPPORT_EMAIL || '',
    hasApiKey: Boolean(process.env.API_KEY),
    mailer: {
      mode: mailerInfo.mode,
      host: mailerInfo.host,
      isTestMode: mailerInfo.isTestMode,
      notice: mailerInfo.notice
    }
  });
});

module.exports = router;
