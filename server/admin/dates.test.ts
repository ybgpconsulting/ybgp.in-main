import assert from 'node:assert/strict';
import { test } from 'node:test';
import { isValidDate, isValidSubscriptionPeriod } from './dates.js';

test('date validation accepts real calendar dates and rejects normalized invalid dates', () => {
  assert.equal(isValidDate('2024-02-29'), true);
  assert.equal(isValidDate('2025-02-29'), false);
  assert.equal(isValidDate('2025-02-31'), false);
  assert.equal(isValidDate('2025-13-01'), false);
  assert.equal(isValidDate('0999-12-31'), false);
  assert.equal(isValidDate('2025-2-01'), false);
});

test('subscription periods require valid dates and expiry on or after start', () => {
  assert.equal(isValidSubscriptionPeriod('2025-01-01', '2025-01-01'), true);
  assert.equal(isValidSubscriptionPeriod('2025-01-01', '2026-01-01'), true);
  assert.equal(isValidSubscriptionPeriod('2025-01-02', '2025-01-01'), false);
  assert.equal(isValidSubscriptionPeriod('2025-02-31', '2026-01-01'), false);
});
