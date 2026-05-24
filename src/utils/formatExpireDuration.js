import ms from 'ms';

const DURATION_UNITS = [
  { ms: 86400000, label: 'day(s)' },
  { ms: 3600000, label: 'hour(s)' },
  { ms: 60000, label: 'minute(s)' },
  { ms: 1000, label: 'second(s)' },
];

/**
 * Converts a JWT-style duration string (e.g. "1h", "7d") into readable text.
 *
 * @param {string} duration - Duration string supported by jsonwebtoken expiresIn.
 * @returns {string} Human-readable duration such as "1 hour(s)" or "7 day(s)".
 */
export function formatExpireDuration(duration) {
  const milliseconds = ms(duration);

  if (typeof milliseconds !== 'number' || Number.isNaN(milliseconds)) {
    throw new Error(`Invalid expire duration: ${duration}`);
  }

  for (const unit of DURATION_UNITS) {
    if (milliseconds % unit.ms === 0) {
      const value = milliseconds / unit.ms;
      return `${value} ${unit.label}`;
    }
  }

  const seconds = Math.round(milliseconds / 1000);
  return `${seconds} second(s)`;
}
