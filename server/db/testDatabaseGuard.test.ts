import assert from 'node:assert/strict';
import { test } from 'node:test';
import { isTestDatabaseGrantSafe } from '../config/testDatabase.js';

test('database grants are limited to test schema and non-escalating global usage', () => {
  assert.equal(isTestDatabaseGrantSafe('GRANT USAGE ON *.* TO `tester`@`localhost`'), true);
  assert.equal(isTestDatabaseGrantSafe('GRANT SELECT, INSERT, UPDATE, DELETE ON `ybgp_websites_test`.* TO `tester`@`localhost`'), true);
  assert.equal(isTestDatabaseGrantSafe('GRANT ALL PRIVILEGES ON `ybgp_websites`.* TO `tester`@`localhost`'), false);
  assert.equal(isTestDatabaseGrantSafe('GRANT ALL PRIVILEGES ON *.* TO `tester`@`localhost`'), false);
  assert.equal(isTestDatabaseGrantSafe('GRANT USAGE ON *.* TO `tester`@`localhost` WITH GRANT OPTION'), false);
  assert.equal(isTestDatabaseGrantSafe('GRANT `admin_role` TO `tester`@`localhost`'), false);
});