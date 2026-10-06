import 'dotenv/config';

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

const databasePassword = process.env.DB_PASSWORD;
if (databasePassword === undefined) {
  throw new Error('Missing required environment variable: DB_PASSWORD');
}

export const env = Object.freeze({
  apiPort: readPort('API_PORT', 3001),
  database: Object.freeze({
    host: readRequired('DB_HOST'),
    port: readPort('DB_PORT', 3306),
    name: readRequired('DB_NAME'),
    user: readRequired('DB_USER'),
    password: databasePassword,
  }),
});
