import test from 'node:test';
import assert from 'node:assert/strict';
import { errorHandler } from '../src/middleware/error.js';
import { httpError } from '../src/utils/httpError.js';

const fakeRes = () => ({ code: null, body: null, status(c) { this.code = c; return this; }, json(b) { this.body = b; return this; } });

test('httpError carries status and message', () => {
  const err = httpError(404, 'Not here');
  assert.equal(err.status, 404);
  assert.equal(err.message, 'Not here');
});

test('errorHandler returns the error status as JSON', () => {
  const res = fakeRes();
  errorHandler(httpError(403, 'Forbidden'), {}, res, () => {});
  assert.equal(res.code, 403);
  assert.deepEqual(res.body, { message: 'Forbidden' });
});