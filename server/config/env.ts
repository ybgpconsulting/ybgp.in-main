import 'dotenv/config';
import { normalizeSiteUrl } from './site.js';
import { requireTestDatabaseConfig } from './testDatabase.js';

const readRequired = (name: string): string => {
  const value = process.env[name];
  if (value === undefined || value.trim() === '') {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value.trim();
};

const readPort = (name: string, fallback: number): number => {
  const rawValue = process.env[name];
  if (rawValue === undefined || rawValue.trim() === '') return fallback;

  const value = Number(rawValue);
  if (!Number.isInteger(value) || value < 1 || value > 65535) {
    throw new Error(`${name} must be an integer between 1 and 65535`);
  }
  return value;
};

const isTestEnvironment = process.env.NODE_ENV === 'test';
const database = isTestEnvironment
  ? requireTestDatabaseConfig(process.env)
  : (() => {
    const password = process.env.DB_PASSWORD;
    if (password === undefined) {
      throw new Error('Missing required environment variable: DB_PASSWORD');
    }
    return Object.freeze({
      host: readRequired('DB_HOST'),
      port: readPort('DB_PORT', 3306),
      name: readRequired('DB_NAME'),
      user: readRequired('DB_USER'),
      password,
    });
  })();

const apiPort = process.env.PORT === undefined
  ? readPort('API_PORT', 3001)
  : readPort('PORT', 3001);

export const env = Object.freeze({
  apiPort,
  siteUrl: normalizeSiteUrl(process.env.VITE_SITE_URL),
  database,
});
