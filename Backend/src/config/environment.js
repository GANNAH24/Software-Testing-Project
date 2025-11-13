/**
 * Environment Configuration
 * Centralized environment variables
 */

require('dotenv').config();

const config = {
  // Server
  PORT: process.env.PORT || 3000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:3000',
  
  // Database
  SUPABASE_URL: process.env.SUPABASE_URL,
  SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY,
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
  
  // JWT
  JWT_SECRET: process.env.JWT_SECRET || 'your-secret-key-change-in-production',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  
  // Security
  BCRYPT_ROUNDS: parseInt(process.env.BCRYPT_ROUNDS) || 10,
  COOKIE_SECRET: process.env.COOKIE_SECRET || 'dev-cookie-secret',
  COOKIE_NAME: process.env.COOKIE_NAME || 'access_token',
  COOKIE_SECURE: process.env.COOKIE_SECURE === 'true',
  COOKIE_SAMESITE: process.env.COOKIE_SAMESITE || 'lax',
  COOKIE_DOMAIN: process.env.COOKIE_DOMAIN || undefined,
  
  // API
  API_VERSION: 'v1',
  API_PREFIX: '/api',
  
  // Validation
  PASSWORD_MIN_LENGTH: 8,
  
  // Logging
  LOG_LEVEL: process.env.LOG_LEVEL || 'info'
};

// Validate required environment variables
const requiredEnvVars = ['SUPABASE_URL'];
const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

if (missingEnvVars.length > 0) {
  throw new Error(`❌ Missing required environment variables: ${missingEnvVars.join(', ')}`);
}

module.exports = config;
