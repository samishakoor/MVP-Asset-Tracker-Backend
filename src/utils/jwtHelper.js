import jwt from 'jsonwebtoken';
import { JWT_EXPIRES_IN, JWT_SECRET } from '../config/index.js';

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

  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
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
