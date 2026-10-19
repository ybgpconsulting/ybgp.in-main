export const TEST_DATABASE_NAME = 'ybgp_websites_test';

const requiredKeys = [
  'TEST_DB_HOST',
  'TEST_DB_PORT',
  'TEST_DB_NAME',
  'TEST_DB_USER',
  'TEST_DB_PASSWORD',
] as const;

const loopbackHosts = new Set(['localhost', '127.0.0.1', '::1']);

export const isTestDatabaseGrantSafe = (grant: string): boolean => {
  if (/^GRANT\s+USAGE\s+ON\s+\*\.\*\s+TO\b/i.test(grant) && !/\bWITH\s+GRANT\s+OPTION\b/i.test(grant)) {
    return true;
  }
  const grantedDatabase = /\bON\s+(?:`([^`]+)`|"([^"]+)"|'([^']+)'|([A-Za-z0-9_$]+))\s*\./i
    .exec(grant)?.slice(1).find(Boolean);
  return grantedDatabase === TEST_DATABASE_NAME;
};

export interface TestDatabaseConfig {
  host: string;
  port: number;
  name: typeof TEST_DATABASE_NAME;
  user: string;
  password: string;
  isRemote: boolean;
}

export interface TestDatabaseConfigStatus {
  requiredTestVariablesPresent: boolean;
  databaseNameSatisfiesGuard: boolean;
  hostType: 'missing' | 'loopback' | 'remote';
  remoteAccessExplicitlyEnabled: boolean;
  configurationValidationPassed: boolean;
}

export const inspectTestDatabaseEnvironment = (
  source: NodeJS.ProcessEnv
): TestDatabaseConfigStatus => {
  const requiredTestVariablesPresent = requiredKeys.every((key) =>
    typeof source[key] === 'string' && source[key]!.trim().length > 0
  );
  const databaseNameSatisfiesGuard = source.TEST_DB_NAME === TEST_DATABASE_NAME;
  const host = source.TEST_DB_HOST?.trim().toLowerCase() ?? '';
  const hostType = !host ? 'missing' : loopbackHosts.has(host) ? 'loopback' : 'remote';
  const remoteAccessExplicitlyEnabled = source.TEST_DB_ALLOW_REMOTE === 'true';
  const remoteIsolationConfirmed = source.TEST_DB_REMOTE_ISOLATED === 'true';
  const nodeEnvIsTest = source.NODE_ENV === 'test';
  const rawPort = source.TEST_DB_PORT?.trim() ?? '';
  const port = Number(rawPort);
  const portIsValid = /^\d+$/.test(rawPort) && Number.isInteger(port) && port >= 1 && port <= 65535;
  const isDedicatedUser = Boolean(source.TEST_DB_USER?.trim()) &&
    !['root', 'admin', 'mysql'].includes(source.TEST_DB_USER!.trim().toLowerCase()) &&
    (!source.DB_USER || source.TEST_DB_USER !== source.DB_USER);
  const usesDifferentPassword = Boolean(source.TEST_DB_PASSWORD) &&
    (!source.DB_PASSWORD || source.TEST_DB_PASSWORD !== source.DB_PASSWORD);
  const hostIsAllowed = hostType === 'loopback' ||
    (hostType === 'remote' && remoteAccessExplicitlyEnabled && remoteIsolationConfirmed);

  return {
    requiredTestVariablesPresent,
    databaseNameSatisfiesGuard,
    hostType,
    remoteAccessExplicitlyEnabled,
    configurationValidationPassed: requiredTestVariablesPresent && databaseNameSatisfiesGuard &&
      nodeEnvIsTest && portIsValid && isDedicatedUser && usesDifferentPassword && hostIsAllowed,
  };
};

export const requireTestDatabaseConfig = (
  source: NodeJS.ProcessEnv
): TestDatabaseConfig => {
  const status = inspectTestDatabaseEnvironment(source);
  if (!status.configurationValidationPassed) {
    throw new Error('Unsafe or incomplete test database configuration; run npm run test:integration:check.');
  }

  return {
    host: source.TEST_DB_HOST!.trim(),
    port: Number(source.TEST_DB_PORT),
    name: TEST_DATABASE_NAME,
    user: source.TEST_DB_USER!.trim(),
    password: source.TEST_DB_PASSWORD!,
    isRemote: status.hostType === 'remote',
  };
};