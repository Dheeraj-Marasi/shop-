const express = require('express');
const cors = require('cors');
const path = require('path');
const morgan = require('morgan');

const activityRoutes = require('./routes/activityRoutes');
const healthRoutes = require('./routes/healthRoutes');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true, limit: '5mb' }));

if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Serve public static assets (UI Dashboard & Simulator)
app.use(express.static(path.join(__dirname, '..', 'public')));

// Serve client-sdk directly so websites can import via script tag:
// <script src="http://localhost:3000/sdk/website-tracker.js"></script>
app.use('/sdk', express.static(path.join(__dirname, '..', 'client-sdk')));

// API routes
app.use('/api/activity', activityRoutes);
app.use('/api', healthRoutes);

// 404 Handler for undefined API routes
app.use('/api', (req, res) => {
  res.status(404).json({
    success: false,
    error: `API route not found: ${req.method} ${req.originalUrl}`
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled server error:', err);
  res.status(500).json({
    success: false,
    error: err.message || 'Internal server error'
  });
});

module.exports = app;
