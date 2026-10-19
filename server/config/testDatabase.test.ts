import assert from 'node:assert/strict';
import { randomBytes } from 'node:crypto';
import { test } from 'node:test';
import { inspectTestDatabaseEnvironment, requireTestDatabaseConfig } from './testDatabase.js';

const validEnvironment = (): NodeJS.ProcessEnv => {
  const testPassword = randomBytes(32).toString('hex');
  const appPassword = randomBytes(32).toString('hex');
  return {
    NODE_ENV: 'test',
    TEST_DB_HOST: '127.0.0.1',
    TEST_DB_PORT: '3306',
    TEST_DB_NAME: 'ybgp_websites_test',
    TEST_DB_USER: 'ybgp_websites_test_user',
    TEST_DB_PASSWORD: testPassword,
    DB_USER: 'ybgp_websites_app',
    DB_PASSWORD: appPassword,
  };
};

test('dedicated loopback test database configuration is accepted', () => {
  const source = validEnvironment();
  const status = inspectTestDatabaseEnvironment(source);
  assert.deepEqual(status, {
    requiredTestVariablesPresent: true,
    databaseNameSatisfiesGuard: true,
    hostType: 'loopback',
    remoteAccessExplicitlyEnabled: false,
    configurationValidationPassed: true,
  });
  assert.equal(requireTestDatabaseConfig(source).name, 'ybgp_websites_test');
});

test('configuration fails closed without test variables or with app credentials reused', () => {
  assert.equal(inspectTestDatabaseEnvironment({
    DB_HOST: '127.0.0.1',
    DB_NAME: 'ybgp_websites_test',
    DB_USER: 'app',
    DB_PASSWORD: 'app-password',
  }).configurationValidationPassed, false);

  const reused = validEnvironment();
  reused.TEST_DB_USER = reused.DB_USER;
  reused.TEST_DB_PASSWORD = reused.DB_PASSWORD;
  assert.equal(inspectTestDatabaseEnvironment(reused).configurationValidationPassed, false);
});

test('remote tests require both explicit remote opt-in and isolation confirmation', () => {
  const source = validEnvironment();
  source.TEST_DB_HOST = 'mysql-test.example.invalid';
  source.TEST_DB_ALLOW_REMOTE = 'true';
  assert.equal(inspectTestDatabaseEnvironment(source).configurationValidationPassed, false);
  source.TEST_DB_REMOTE_ISOLATED = 'true';
  assert.equal(inspectTestDatabaseEnvironment(source).configurationValidationPassed, true);
});

test('test configuration rejects wrong environment, target name, and invalid port', () => {
  const source = validEnvironment();
  source.NODE_ENV = 'development';
  assert.equal(inspectTestDatabaseEnvironment(source).configurationValidationPassed, false);
  source.NODE_ENV = 'test';
  source.TEST_DB_NAME = 'ybgp_websites';
  assert.equal(inspectTestDatabaseEnvironment(source).databaseNameSatisfiesGuard, false);
  source.TEST_DB_NAME = 'ybgp_websites_test';
  source.TEST_DB_PORT = '3306; DROP DATABASE';
  assert.equal(inspectTestDatabaseEnvironment(source).configurationValidationPassed, false);
});