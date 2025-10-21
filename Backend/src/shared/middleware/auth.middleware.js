/**
 * Authentication Middleware
 * JWT verification and role-based access control
 */

const { supabase } = require('../../config/database');
const { unauthorizedResponse, forbiddenResponse } = require('../utils/response.util');
const logger = require('../utils/logger.util');

/**
 * Verify JWT token and attach user to request
 */
const verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json(unauthorizedResponse('No token provided'));
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Verify token with Supabase
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      logger.warn('Invalid token attempt', { error: error?.message });
      return res.status(401).json(unauthorizedResponse('Invalid or expired token'));
    }

    // Get user profile with role
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (profileError || !profile) {
      logger.error('Profile not found for user', { userId: user.id });
      return res.status(401).json(unauthorizedResponse('User profile not found'));
    }

    // Attach user info to request
    req.user = {
      id: user.id,
      email: user.email,
      role: profile.role,
      fullName: profile.full_name,
      profile: profile
    };

    next();
  } catch (error) {
    logger.error('Token verification error', { error: error.message });
    return res.status(401).json(unauthorizedResponse('Authentication failed'));
  }
};

/**
 * Require authentication
 */
const requireAuth = () => {
  return verifyToken;
};

/**
 * Require specific role(s)
 * @param {...string} allowedRoles - Allowed roles
 */
const requireRole = (...allowedRoles) => {
  return [
    verifyToken,
    (req, res, next) => {
      if (!req.user) {
        return res.status(401).json(unauthorizedResponse());
      }

      if (!allowedRoles.includes(req.user.role)) {
        logger.warn('Unauthorized role access attempt', {
          userId: req.user.id,
          userRole: req.user.role,
          requiredRoles: allowedRoles
        });
        return res.status(403).json(
          forbiddenResponse(`Access denied. Required role: ${allowedRoles.join(' or ')}`)
        );
      }

      next();
    }
  ];
};

/**
 * Require admin role
 */
const requireAdmin = () => {
  return requireRole('admin');
};

/**
 * Require doctor role
 */
const requireDoctor = () => {
  return requireRole('doctor');
};

/**
 * Require patient role
 */
const requirePatient = () => {
  return requireRole('patient');
};

/**
 * Require any of the specified roles
 * @param {...string} roles - Allowed roles
 */
const requireAnyRole = (...roles) => {
  return requireRole(...roles);
};

/**
 * Optional authentication (attach user if token exists, but don't require it)
 */
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next(); // No token, continue without user
    }

    const token = authHeader.substring(7);
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (!error && user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profile) {
        req.user = {
          id: user.id,
          email: user.email,
          role: profile.role,
          fullName: profile.full_name,
          profile: profile
        };
      }
    }

    next();
  } catch (error) {
    next(); // Continue without user on error
  }
};

module.exports = {
  verifyToken,
  requireAuth,
  requireRole,
  requireAdmin,
  requireDoctor,
  requirePatient,
  requireAnyRole,
  optionalAuth
};
