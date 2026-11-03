// Run from the repo root with: node --test
const test = require('node:test');
const assert = require('node:assert');
const { age } = require('../public/assets/js/age.js');

const at = (y, m, d, h = 0, min = 0, s = 0) => Date.UTC(y, m - 1, d, h, min, s);

test('simple age on a later date', () => {
  const a = age({ y: 1990, m: 5, d: 15 }, at(2026, 11, 3));
  assert.deepStrictEqual([a.years, a.months, a.days], [36, 5, 19]);
});

test('day before birthday is still the lower age', () => {
  const a = age({ y: 2000, m: 11, d: 4 }, at(2026, 11, 3));
  assert.deepStrictEqual([a.years, a.months, a.days], [25, 11, 30]);
  assert.strictEqual(a.next.totalDays, 1);
  assert.strictEqual(a.next.turns, 26);
});

test('birthday today', () => {
  const a = age({ y: 2000, m: 11, d: 3 }, at(2026, 11, 3, 10));
  assert.deepStrictEqual([a.years, a.months, a.days, a.hours], [26, 0, 0, 10]);
  assert.strictEqual(a.next.isToday, true);
});

test('31st of the month rolls to the month end', () => {
  const a = age({ y: 2026, m: 1, d: 31 }, at(2026, 2, 28));
  assert.deepStrictEqual([a.years, a.months, a.days], [0, 1, 0]);
});

test('29 February birthday in a common year counts from 28 February', () => {
  const a = age({ y: 2024, m: 2, d: 29 }, at(2025, 2, 28));
  assert.deepStrictEqual([a.years, a.months, a.days], [1, 0, 0]);
  const b = age({ y: 2024, m: 2, d: 29 }, at(2025, 3, 1));
  assert.strictEqual(b.next.totalDays, 364);
});

test('time of birth gives hours, minutes and seconds', () => {
  const a = age({ y: 2026, m: 11, d: 1, h: 22, min: 30 }, at(2026, 11, 3, 1, 15, 20));
  assert.deepStrictEqual([a.days, a.hours, a.minutes, a.seconds], [1, 2, 45, 20]);
  assert.strictEqual(a.total.hours, 26);
  assert.strictEqual(a.total.seconds, 26 * 3600 + 45 * 60 + 20);
});

test('totals', () => {
  const a = age({ y: 2026, m: 1, d: 1 }, at(2026, 2, 1));
  assert.strictEqual(a.total.days, 31);
  assert.strictEqual(a.total.weeks, 4);
  assert.strictEqual(a.total.weekDays, 3);
  assert.strictEqual(a.total.months, 1);
  assert.strictEqual(a.bornOn, 'Thursday');
});

test('birth date in the future returns null', () => {
  assert.strictEqual(age({ y: 2030, m: 1, d: 1 }, at(2026, 11, 3)), null);
});
