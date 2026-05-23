/**
 * @param {string | { message?: string, errorType?: string }} meta
 * @returns {string}
 */
function formatLogMessage(meta) {
  if (typeof meta === 'string') {
    return meta;
  }

  if (meta && typeof meta.message === 'string') {
    if (meta.errorType) {
      return `[${meta.errorType}] ${meta.message}`;
    }
    return meta.message;
  }

  return String(meta);
}

const logger = {
  error(meta) {
    console.error(formatLogMessage(meta));
  },
  info(meta) {
    console.info(formatLogMessage(meta));
  },
};

export default logger;
