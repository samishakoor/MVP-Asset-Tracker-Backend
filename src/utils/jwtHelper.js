import jwt from 'jsonwebtoken';
import {
  JWT_ACCESS_TOKEN_EXPIRE_TIME,
  JWT_EMAIL_VERIFICATION_TOKEN_EXPIRE_TIME,
  JWT_PASSWORD_RESET_TOKEN_EXPIRE_TIME,
  JWT_SECRET,
} from '../config/index.js';
import { TokenPurpose } from '../constants/index.js';

/**
 * Signs a JWT access token for an authenticated user.
 *
 * @param {object} payload - Claims to embed in the token.
 * @returns {string} Signed JWT string.
 */
export function signToken(payload) {
  if (!JWT_SECRET) {
    throw new Error('JWT_SECRET is not configured');
  }

  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_ACCESS_TOKEN_EXPIRE_TIME });
}

/**
 * Verifies a JWT access token and returns the decoded payload.
 *
 * @param {string} token - Bearer token string.
 * @returns {Promise<object|null>} Decoded payload, or null if invalid or expired.
 */
export async function verifyToken(token) {
  if (!JWT_SECRET) {
    throw new Error('JWT_SECRET is not configured');
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    return payload;
  } catch {
    return null;
  }
}

/**
 * Signs a short-lived JWT for password reset flows.
 *
 * @param {{ id: string, email: string }} payload - User identity claims.
 * @returns {string} Signed JWT string.
 */
export function signPasswordResetToken(payload) {
  if (!JWT_SECRET) {
    throw new Error('JWT_SECRET is not configured');
  }

  return jwt.sign(
    {
      id: payload.id,
      email: payload.email,
      purpose: TokenPurpose.PASSWORD_RESET,
    },
    JWT_SECRET,
    { expiresIn: JWT_PASSWORD_RESET_TOKEN_EXPIRE_TIME }
  );
}

/**
 * Verifies a password reset JWT and returns the decoded payload.
 *
 * @param {string} token - Reset token from the email link.
 * @returns {object|null} Decoded payload when valid, otherwise null.
 */
export function verifyPasswordResetToken(token) {
  if (!JWT_SECRET) {
    throw new Error('JWT_SECRET is not configured');
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET);

    if (payload.purpose !== TokenPurpose.PASSWORD_RESET) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}

/**
 * Signs a JWT for email verification flows.
 *
 * @param {{ id: string, email: string }} payload - User identity claims.
 * @returns {string} Signed JWT string.
 */
export function signEmailVerificationToken(payload) {
  if (!JWT_SECRET) {
    throw new Error('JWT_SECRET is not configured');
  }

  return jwt.sign(
    {
      id: payload.id,
      email: payload.email,
      purpose: TokenPurpose.EMAIL_VERIFICATION,
    },
    JWT_SECRET,
    { expiresIn: JWT_EMAIL_VERIFICATION_TOKEN_EXPIRE_TIME }
  );
}

/**
 * Verifies an email verification JWT and returns the decoded payload.
 *
 * @param {string} token - Verification token from the email link.
 * @returns {object|null} Decoded payload when valid, otherwise null.
 */
export function verifyEmailVerificationToken(token) {
  if (!JWT_SECRET) {
    throw new Error('JWT_SECRET is not configured');
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET);

    if (payload.purpose !== TokenPurpose.EMAIL_VERIFICATION) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}
