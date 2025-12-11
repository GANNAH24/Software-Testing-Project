/**
 * Express Application Setup
 * Main app configuration for layered monolith
 */

const express = require('express');
const cookieParser = require('cookie-parser');
const config = require('./config/environment');
const logger = require('./shared/utils/logger.util');
const { notFoundHandler, errorHandler } = require('./shared/middleware/error.middleware');

// Import feature routes
const authRoutes = require('./features/auth/auth.routes');
const appointmentsRoutes = require('./features/appointments/appointments.routes');
const doctorsRoutes = require('./features/doctors/doctors.routes');
const schedulesRoutes = require('./features/schedules/schedules.routes');
const patientsRoutes = require('./features/patients/patients.routes');
const messagesRoutes = require('./features/messages/messages.routes');
const adminRoutes = require('./features/admin/admin.routes');

// Create Express app
const app = express();

console.log('[STARTUP] Loading app.js with manual CORS middleware');

// CORS must be first - before any other middleware
app.use((req, res, next) => {
  const origin = req.headers.origin || '*';
  
  console.log(`[CORS] ${req.method} ${req.path} from origin: ${origin}`);
  
  res.header('Access-Control-Allow-Origin', origin);
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Methods', 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Cookie, X-Requested-With, Accept');
  res.header('Access-Control-Expose-Headers', 'Set-Cookie');
  res.header('Access-Control-Max-Age', '86400'); // 24 hours
  
  // Handle preflight with explicit status and end
  if (req.method === 'OPTIONS') {
    console.log(`[CORS] Responding to OPTIONS preflight for ${req.path}`);
    res.status(204);
    res.end();
    return;
  }
  next();
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser(config.COOKIE_SECRET));

// Request logging
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`, {
    ip: req.ip,
    userAgent: req.get('user-agent')
  });
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Se7ety Healthcare API is running',
    timestamp: new Date().toISOString(),
    environment: config.NODE_ENV,
    version: config.API_VERSION
  });
});

// API root endpoint
app.get(`${config.API_PREFIX}/${config.API_VERSION}`, (req, res) => {
  res.json({
    success: true,
    message: 'Welcome to Se7ety Healthcare API',
    version: config.API_VERSION,
    endpoints: {
      auth: `${config.API_PREFIX}/${config.API_VERSION}/auth`,
      appointments: `${config.API_PREFIX}/${config.API_VERSION}/appointments`,
      doctors: `${config.API_PREFIX}/${config.API_VERSION}/doctors`,
      schedules: `${config.API_PREFIX}/${config.API_VERSION}/schedules`
    },
    documentation: {
      health: '/health',
      apiDocs: `${config.API_PREFIX}/${config.API_VERSION}`
    }
  });
});

// Mount feature routes
app.use(`${config.API_PREFIX}/${config.API_VERSION}/auth`, authRoutes);
app.use(`${config.API_PREFIX}/${config.API_VERSION}/appointments`, appointmentsRoutes);
app.use(`${config.API_PREFIX}/${config.API_VERSION}/doctors`, doctorsRoutes);
app.use(`${config.API_PREFIX}/${config.API_VERSION}/schedules`, schedulesRoutes);
app.use(`${config.API_PREFIX}/${config.API_VERSION}/patients`, patientsRoutes);
app.use(`${config.API_PREFIX}/${config.API_VERSION}/messages`, messagesRoutes);
app.use(`${config.API_PREFIX}/${config.API_VERSION}/admin`, adminRoutes);

// 404 handler
app.use(notFoundHandler);

// Global error handler
app.use(errorHandler);

module.exports = app;
