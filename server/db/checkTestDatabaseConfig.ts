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
const environment = { ...applicationEnvironment, ...fileEnvironment, ...process.env };
const status = inspectTestDatabaseEnvironment(environment);

console.log(JSON.stringify(status, null, 2));
if (!status.configurationValidationPassed) process.exitCode = 1;