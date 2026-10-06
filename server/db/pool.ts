import mysql from 'mysql2/promise';
import { env } from '../config/env.js';

export const pool = mysql.createPool({
  host: env.database.host,
  port: env.database.port,
  database: env.database.name,
  user: env.database.user,
  password: env.database.password,
  supportBigNumbers: true,
  bigNumberStrings: true,
  timezone: 'Z',
  waitForConnections: true,
  connectionLimit: 10,
  connectTimeout: 10_000,
});
