import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import dotenv from 'dotenv';
import { inspectTestDatabaseEnvironment } from '../config/testDatabase.js';

const applicationEnvPath = path.resolve(process.cwd(), '.env');
const applicationEnvironment = existsSync(applicationEnvPath)
  ? dotenv.parse(readFileSync(applicationEnvPath))
  : {};
const testEnvPath = path.resolve(process.cwd(), '.env.test');
const fileEnvironment = existsSync(testEnvPath)
  ? dotenv.parse(readFileSync(testEnvPath))
  : {};
const childEnvironment: NodeJS.ProcessEnv = { ...fileEnvironment, ...process.env };
const validationEnvironment = { ...applicationEnvironment, ...childEnvironment };
const status = inspectTestDatabaseEnvironment(validationEnvironment);
process.stdout.write(`${JSON.stringify(status, null, 2)}\n`);

if (!status.configurationValidationPassed) {
  process.stderr.write('Refusing test database command: run npm run test:integration:check and configure an isolated test database.\n');
  process.exitCode = 1;
} else {
  const commands: Record<string, string[]> = {
    integration: ['--test', 'server/business/business.test.ts'],
    migrate: ['server/db/migrate.ts'],
    seed: ['server/db/seed.ts'],
  };
  const mode = process.argv[2];
  const steps = mode === 'prepare' ? [commands.migrate, commands.seed] : commands[mode] ? [commands[mode]] : null;

  if (!steps) {
    console.error('Unknown test database command.');
    process.exitCode = 1;
  } else {
    for (const args of steps) {
      const result = spawnSync(process.execPath, ['--import', 'tsx', ...args], {
        cwd: process.cwd(),
        env: childEnvironment,
        stdio: 'inherit',
      });
      if (result.error) {
        console.error('Unable to start the test database command.');
        process.exitCode = 1;
        break;
      }
      if (result.status !== 0) {
        process.exitCode = result.status ?? 1;
        break;
      }
    }
  }
}
