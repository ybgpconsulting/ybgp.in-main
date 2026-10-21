import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { pool } from './pool.js';

const migrationsDirectory = path.join(process.cwd(), 'server', 'db', 'migrations');

const isExpectedRepeatError = (file: string, statement: string, error: unknown): boolean => {
  if (typeof error !== 'object' || error === null || !('code' in error)) return false;
  const code = error.code;

  return (
    (file === '002_tenant_safe_product_categories.sql' &&
      statement.startsWith('ALTER TABLE categories') &&
      code === 'ER_DUP_KEYNAME') ||
    (file === '002_tenant_safe_product_categories.sql' &&
      statement.startsWith('ALTER TABLE products\n  DROP FOREIGN KEY') &&
      code === 'ER_CANT_DROP_FIELD_OR_KEY') ||
    (file === '005_category_images.sql' &&
      statement.startsWith('ALTER TABLE categories') &&
      code === 'ER_DUP_FIELDNAME')
  );
};

const migrate = async (): Promise<void> => {
  if (process.env.NODE_ENV === 'test') {
    const { verifyTestDatabase } = await import('./testDatabaseGuard.js');
    await verifyTestDatabase(pool);
  }

  const files = (await readdir(migrationsDirectory))
    .filter((file) => file.endsWith('.sql'))
    .sort();

  if (files.length === 0) {
    throw new Error(`No SQL migrations found in ${migrationsDirectory}`);
  }

  const connection = await pool.getConnection();
  try {
    for (const file of files) {
      const contents = await readFile(path.join(migrationsDirectory, file), 'utf8');
      const statements = contents
        .replace(/^\s*--.*$/gm, '')
        .split(';')
        .map((statement) => statement.trim())
        .filter(Boolean);

      for (const statement of statements) {
        try {
          await connection.query(statement);
        } catch (error) {
          if (!isExpectedRepeatError(file, statement, error)) throw error;
        }
      }

      console.info(`Applied idempotent migration: ${file}`);
    }
  } finally {
    connection.release();
    await pool.end();
  }
};

void migrate().catch((error: unknown) => {
  if (process.env.NODE_ENV === 'test') {
    const code = typeof error === 'object' && error !== null && 'code' in error && typeof error.code === 'string'
      ? ` (MySQL error ${error.code})`
      : '';
    console.error(`Test database migration failed${code}; verify the disposable schema and user privileges.`);
  } else {
    console.error('Database migration failed:', error);
  }
  process.exitCode = 1;
});
