/**
 * Normalizes a user-provided asset type to a lowercase slug stored in the database.
 *
 * @param {string} raw - Raw asset type input.
 * @returns {string}
 */
export function normalizeAssetType(raw) {
  const normalized = raw
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '_')
    .replace(/[^a-z0-9_-]/g, '');

  return normalized;
}

/**
 * Returns true when the normalized asset type is valid for persistence.
 *
 * @param {string} normalized - Output from normalizeAssetType.
 * @returns {boolean}
 */
export function isValidAssetType(normalized) {
  if (normalized.length === 0 || normalized.length > 64) {
    return false;
  }

  return /^[a-z0-9]+([_-][a-z0-9]+)*$/.test(normalized);
}
