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
    'DATABASE_URL is not set. Add it to Vercel environment variables (Production + Preview).'
  );
  process.exit(1);
}

console.log('Generating Prisma Client...');
run('npx', ['prisma', 'generate']);

console.log('Syncing database schema...');
run('npx', ['prisma', 'db', 'push']);

const seedDisabled = process.env.SEED_ON_BUILD === 'false';

if (seedDisabled) {
  console.log('Skipping database seed (SEED_ON_BUILD=false).');
} else {
  console.log('Running database seed...');
  run('node', ['prisma/seed.js']);
}

console.log('Vercel build complete.');
