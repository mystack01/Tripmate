import test from 'node:test';
import assert from 'node:assert/strict';
import { convertAmount } from '../src/utils/currency.js';

test('converts using the target rate', () => {
  const result = convertAmount(100, { EUR: 0.9 }, 'EUR');
  assert.deepEqual(result, { rate: 0.9, converted: 90 });
});

test('returns null when the rate is missing', () => {
  assert.equal(convertAmount(100, { EUR: 0.9 }, 'JPY'), null);
});

test('returns null for non-numeric amounts', () => {
  assert.equal(convertAmount('abc', { EUR: 0.9 }, 'EUR'), null);
});
