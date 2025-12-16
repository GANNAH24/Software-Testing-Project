/**
 * Jest Setup File
 * Global test configuration and utilities
 */

// Load environment variables from .env file
require('dotenv').config();

// Set test environment
process.env.NODE_ENV = 'test';

// Only override these if not already set
if (!process.env.JWT_SECRET) process.env.JWT_SECRET = 'test-jwt-secret';
if (!process.env.COOKIE_SECRET) process.env.COOKIE_SECRET = 'test-cookie-secret';
if (!process.env.PORT) process.env.PORT = '3000';
if (!process.env.FRONTEND_URL) process.env.FRONTEND_URL = 'http://localhost:5173';

// For unit tests, we'll mock Supabase. For integration tests, use real credentials from .env

// Global test timeout
jest.setTimeout(30000);

// Mock console methods to reduce noise in tests
// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  // log: jest.fn(), // Unmocked
  // error: jest.fn(), // Unmocked
};
