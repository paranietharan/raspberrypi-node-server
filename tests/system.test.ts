import { test } from 'node:test';
import assert from 'node:assert/strict';
import { cpuUsageBetween } from '../src/lib/cpu.ts';
import { isAuthorized } from '../src/lib/auth.ts';

const times = (user: number, idle: number) => ({ user, idle, sys: 0, nice: 0, irq: 0 });
test('CPU usage reflects the interval, not lifetime idle time', () => {
  assert.deepEqual(cpuUsageBetween([times(100, 900)], [times(180, 920)]), ['80.0']);
});
test('CPU sampling tolerates zero deltas, resets and newly available cores', () => {
  assert.deepEqual(cpuUsageBetween([times(100, 900)], [times(100, 900), times(1, 1)]), ['0.0', '0.0']);
  assert.deepEqual(cpuUsageBetween([times(100, 900)], [times(1, 1)]), ['0.0']);
});
test('basic authentication denies absent, invalid and partial credentials', () => {
  assert.equal(isAuthorized(null, 'admin', 'test-password'), false);
  assert.equal(isAuthorized('Basic !!!', 'admin', 'test-password'), false);
  assert.equal(isAuthorized(null, 'admin', undefined), false);
  assert.equal(isAuthorized('Basic ' + Buffer.from('admin:wrong').toString('base64'), 'admin', 'test-password'), false);
  assert.equal(isAuthorized('Basic ' + Buffer.from('admin:test-password').toString('base64'), 'admin', 'test-password'), true);
  assert.equal(isAuthorized(null, undefined, undefined), true);
});
