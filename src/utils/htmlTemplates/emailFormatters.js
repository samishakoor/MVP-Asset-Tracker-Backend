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

/**
 * Formats the duration between assignment start and return for email copy.
 *
 * @param {Date|string} startDate - Assignment start timestamp.
 * @param {Date|string} endDate - Assignment return timestamp.
 * @returns {string}
 */
export function formatAssignmentDuration(startDate, endDate) {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffInMs = end.getTime() - start.getTime();
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

  if (diffInDays <= 0) {
    return 'Same day';
  }

  if (diffInDays === 1) {
    return '1 day';
  }

  return `${diffInDays} days`;
}
