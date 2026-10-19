import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  createDefaultWeeklyHours,
  formatWorkingHours,
  isValidWorkingHoursValue,
  parseWeeklyHours,
} from './hours.js';

test('weekly hours group matching weekdays and use readable AM/PM lines', () => {
  const schedule = createDefaultWeeklyHours();
  for (const day of ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'] as const) {
    schedule[day] = { closed: false, open: '09:00', close: '17:00' };
  }
  schedule.saturday = { closed: false, open: '09:00', close: '14:00' };
  const value = JSON.stringify(schedule);
  assert.deepEqual(parseWeeklyHours(value), schedule);
  assert.equal(formatWorkingHours(value), 'Monday – Friday 09:00 AM – 05:00 PM\nSaturday 09:00 AM – 02:00 PM\nSunday Closed');
  assert.equal(isValidWorkingHoursValue(value), true);
});

test('weekly hours format midnight and noon in 12-hour time', () => {
  const schedule = createDefaultWeeklyHours();
  schedule.monday = { closed: false, open: '00:00', close: '12:00' };
  assert.match(formatWorkingHours(JSON.stringify(schedule)), /^Monday 12:00 AM – 12:00 PM\n/);
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