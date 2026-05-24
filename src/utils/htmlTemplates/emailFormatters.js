/**
 * Capitalizes the first character of a label string.
 *
 * @param {string} value - Raw label value.
 * @returns {string}
 */
function capitalizeLabel(value) {
  if (!value) {
    return value;
  }

  return value.charAt(0).toUpperCase() + value.slice(1);
}

/**
 * Formats an asset type slug for display in email copy.
 *
 * @param {string} assetType - Asset type slug from the database.
 * @returns {string}
 */
export function formatAssetTypeLabel(assetType) {
  const normalized = assetType.replace(/_/g, ' ');
  return capitalizeLabel(normalized);
}

/**
 * Formats an asset condition slug for display in email copy.
 *
 * @param {string} condition - Asset condition slug from the database.
 * @returns {string}
 */
export function formatAssetConditionLabel(condition) {
  return capitalizeLabel(condition);
}

/**
 * Formats an assignment date for display in email copy.
 *
 * @param {Date|string} date - Assignment timestamp.
 * @returns {string}
 */
export function formatAssignmentDate(date) {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}
