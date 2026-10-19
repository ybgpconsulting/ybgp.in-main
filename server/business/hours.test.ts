import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  createDefaultWeeklyHours,
  formatWorkingHours,
  isValidWorkingHoursValue,
  parseWeeklyHours,
} from './hours.js';

test('weekly hours serialize and format day-by-day with closed days', () => {
  const schedule = createDefaultWeeklyHours();
  schedule.monday = { closed: false, open: '09:00', close: '17:30' };
  const value = JSON.stringify(schedule);
  assert.deepEqual(parseWeeklyHours(value), schedule);
  assert.match(formatWorkingHours(value), /^Mon: 09:00–17:30 · Tue: Closed/);
  assert.equal(isValidWorkingHoursValue(value), true);
});

test('legacy hours remain valid and invalid structured schedules are rejected', () => {
  assert.equal(isValidWorkingHoursValue('Mon-Fri, 9am to 5pm'), true);
  assert.equal(formatWorkingHours('Mon-Fri, 9am to 5pm'), 'Mon-Fri, 9am to 5pm');
  assert.equal(isValidWorkingHoursValue('x'.repeat(501)), false);
  assert.equal(isValidWorkingHoursValue('{"monday":{"closed":false}}'), false);
  const schedule = createDefaultWeeklyHours();
  schedule.monday = { closed: false, open: '18:00', close: '09:00' };
  assert.equal(isValidWorkingHoursValue(JSON.stringify(schedule)), false);
});