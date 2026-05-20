import bcrypt from 'bcryptjs';

const SALT_ROUNDS = 12;

/**
 * Hashes a plain-text password for storage.
 *
 * @param {string} password - Plain-text password.
 * @returns {Promise<string>} Bcrypt hash.
 */
export async function hashPassword(password) {
  return bcrypt.hash(password, SALT_ROUNDS);
}

/**
 * Compares a plain-text password with a stored hash.
 *
 * @param {string} password - Plain-text password.
 * @param {string} passwordHash - Stored bcrypt hash.
 * @returns {Promise<boolean>} True when the password matches.
 */
export async function comparePassword(password, passwordHash) {
  return bcrypt.compare(password, passwordHash);
}
