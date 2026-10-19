import type { Pool, RowDataPacket } from 'mysql2/promise';
import {
  inspectTestDatabaseEnvironment,
  isTestDatabaseGrantSafe,
  requireTestDatabaseConfig,
  TEST_DATABASE_NAME,
} from '../config/testDatabase.js';

const status = inspectTestDatabaseEnvironment(process.env);
if (!status.configurationValidationPassed) {
  throw new Error('Refusing integration tests: run npm run test:integration:check and configure an isolated test database.');
}

export const verifyTestDatabase = async (pool: Pool): Promise<void> => {
  const config = requireTestDatabaseConfig(process.env);
  let connection: Awaited<ReturnType<Pool['getConnection']>>;
  try {
    connection = await pool.getConnection();
  } catch {
    throw new Error('Unable to verify the test database connection; check the dedicated test-user host access and credentials.');
  }
  try {
    const [databaseRows] = await connection.query<Array<RowDataPacket & {
      databaseName: string | null;
      currentUser: string;
    }>>('SELECT DATABASE() AS databaseName, CURRENT_USER() AS currentUser');
    const actualDatabase = databaseRows[0]?.databaseName;
    const actualUser = databaseRows[0]?.currentUser.replace(/[`"']/g, '').split('@', 1)[0];
    if (actualDatabase !== TEST_DATABASE_NAME || actualUser?.toLowerCase() !== config.user.toLowerCase()) {
      throw new Error('Refusing database operations: connected database or user does not match the verified test configuration.');
    }

    const [grantRows] = await connection.query<RowDataPacket[]>('SHOW GRANTS FOR CURRENT_USER()');
    const grants = grantRows.flatMap((row) => Object.values(row))
      .filter((grant): grant is string => typeof grant === 'string');
    if (grants.length === 0 || grants.some((grant) => !isTestDatabaseGrantSafe(grant))) {
      throw new Error('Refusing database operations: test database user has grants outside the dedicated test database.');
    }
  } catch {
    throw new Error('Unable to verify test database identity or grants; require this dedicated user to access only ybgp_websites_test.');
  } finally {
    connection.release();
  }
};