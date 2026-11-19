import assert from 'node:assert/strict';
import test from 'node:test';
import { parseTasks } from '../src/lib/tasks.ts';

test('parses explicit ps columns including spaces in command names', () => {
  assert.deepEqual(parseTasks('  42 pi  2.5  0.6 task worker'), [
    {pid: 42, user: 'pi', cpu: 2.5, memory: 0.6, name: 'task worker'}
  ]);
});
