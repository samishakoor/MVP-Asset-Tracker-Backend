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

// Sync schema before the API starts (idempotent on every deploy)
run('npx', ['prisma', 'db', 'push']);

// One-time setup: seed runs on Railway only; seed.js skips if admin already exists
const onRailway = Boolean(process.env.RAILWAY_ENVIRONMENT);
const seedDisabled = process.env.SEED_ON_START === 'false';

if (onRailway && !seedDisabled) {
  run('node', ['prisma/seed.js']);
}

run('node', ['src/server.js']);
