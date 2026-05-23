/**
 * Returns a user object safe for API responses (no password hash).
 *
 * @param {object} user - Prisma user record.
 * @returns {object} Public user fields.
 */
export function sanitizeUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    isVerified: user.isVerified,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}
