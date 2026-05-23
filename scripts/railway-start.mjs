import { spawnSync } from 'node:child_process';

/**
 * @param {string} command
 * @param {string[]} args
 */
function run(command, args) {
  const result = spawnSync(command, args, { stdio: 'inherit' });
  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

if (!process.env.DATABASE_URL) {
  console.error(
    'DATABASE_URL is not set. In Railway, link the Postgres service to this API service.'
  );
  process.exit(1);
}

console.log('Syncing database schema...');
run('npx', ['prisma', 'db', 'push']);

const onRailway = Boolean(process.env.RAILWAY_ENVIRONMENT);
const seedDisabled = process.env.SEED_ON_START === 'false';

if (onRailway && !seedDisabled) {
  console.log('Running database seed...');
  run('node', ['prisma/seed.js']);
}

console.log('Starting HTTP server...');
run('node', ['src/server.js']);
