import ms from 'ms';

const DURATION_UNITS = [
  { ms: 86400000, singular: 'day', plural: 'days' },
  { ms: 3600000, singular: 'hour', plural: 'hours' },
  { ms: 60000, singular: 'minute', plural: 'minutes' },
  { ms: 1000, singular: 'second', plural: 'seconds' },
];

/**
 * Converts a JWT-style duration string (e.g. "1h", "7d") into readable text.
 *
 * @param {string} duration - Duration string supported by jsonwebtoken expiresIn.
 * @returns {string} Human-readable duration such as "1 hour" or "7 days".
 */
export function formatExpireDuration(duration) {
  const milliseconds = ms(duration);

  if (typeof milliseconds !== 'number' || Number.isNaN(milliseconds)) {
    throw new Error(`Invalid expire duration: ${duration}`);
  }

  for (const unit of DURATION_UNITS) {
    if (milliseconds % unit.ms === 0) {
      const value = milliseconds / unit.ms;
      const label = value === 1 ? unit.singular : unit.plural;
      return `${value} ${label}`;
    }
  }

  const seconds = Math.round(milliseconds / 1000);
  const label = seconds === 1 ? 'second' : 'seconds';
  return `${seconds} ${label}`;
}
