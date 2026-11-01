const express = require('express');
const router = express.Router();
const { sendActivityConfirmation } = require('../services/emailService');
const activityStore = require('../services/activityStore');
const { resolveAndRenderEmail, getTemplateSampleData } = require('../templates');
const { verifyTransporter } = require('../config/mailer');

/**
 * Middleware: Optional API Key verification
 */
function checkApiKey(req, res, next) {
  const configuredKey = process.env.API_KEY;
  if (!configuredKey) {
    return next(); // No key required
  }

  const providedKey = req.headers['x-api-key'] || req.query.apiKey;
  if (providedKey === configuredKey) {
    return next();
  }

  return res.status(401).json({
    success: false,
    error: 'Unauthorized: Invalid or missing API key (x-api-key header required).'
  });
}

/**
 * POST /api/activity/notify
 * Main endpoint called when user completes an activity on the website
 */
router.post('/notify', checkApiKey, async (req, res) => {
  try {
    const payload = req.body;
    if (!payload || typeof payload !== 'object') {
      return res.status(400).json({
        success: false,
        error: 'Invalid request body. Expected JSON object.'
      });
    }

    const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';
    const userAgent = req.headers['user-agent'] || 'Direct API Call';

    const result = await sendActivityConfirmation(payload, {
      ip: clientIp.replace('::ffff:', ''),
      userAgent
    });

    return res.status(200).json(result);
  } catch (error) {
    console.error('Error handling activity notification:', error);
    return res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/activities/history
 * Returns the recent audit log of sent activity emails
 */
router.get('/history', (req, res) => {
  return res.json({
    success: true,
    total: activityStore.getAll().length,
    activities: activityStore.getAll()
  });
});

/**
 * DELETE /api/activities/history
 * Clear audit log
 */
router.delete('/history', (req, res) => {
  activityStore.clear();
  return res.json({ success: true, message: 'Activity history cleared' });
});

/**
 * GET /api/templates/preview/:type
 * Returns the rendered HTML of a template for browser inspection
 */
router.get('/templates/preview/:type', (req, res) => {
  try {
    const type = req.params.type || 'custom';
    const sampleData = getTemplateSampleData(type);
    const rendered = resolveAndRenderEmail(sampleData);
    res.setHeader('Content-Type', 'text/html');
    return res.send(rendered.html);
  } catch (err) {
    return res.status(500).send(`<h3>Error generating template preview:</h3><pre>${err.message}</pre>`);
  }
});

/**
 * POST /api/test-email
 * Sends a quick test email to verify credentials
 */
router.post('/test-email', async (req, res) => {
  try {
    const targetEmail = req.body.email;
    if (!targetEmail) {
      return res.status(400).json({ success: false, error: 'Email address is required in body: { "email": "user@example.com" }' });
    }

    const result = await sendActivityConfirmation({
      user: {
        email: targetEmail,
        name: req.body.name || 'Test Recipient'
      },
      activity: {
        type: 'custom',
        title: 'Connection Test Notification',
        description: 'Congratulations! Your Activity Confirmation Email Service is properly configured and successfully sending emails.',
        metadata: {
          'Test Status': 'Passed 100%',
          'Dispatched At': new Date().toISOString(),
          'Server Host': req.headers.host
        },
        actionUrl: `http://${req.headers.host}`,
        actionText: 'Open Service Dashboard'
      }
    }, {
      ip: req.socket.remoteAddress,
      userAgent: req.headers['user-agent']
    });

    return res.json({
      success: true,
      message: `Test email sent to ${targetEmail}`,
      details: result
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: err.message
    });
  }
});

/**
 * GET /api/verify-smtp
 * Test SMTP connection status
 */
router.get('/verify-smtp', async (req, res) => {
  const result = await verifyTransporter();
  return res.json(result);
});

module.exports = router;
