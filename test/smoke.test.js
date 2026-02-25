import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

test('script contains status mapping and graphql endpoint', () => {
  const src = fs.readFileSync('fetchProjectId.js', 'utf8');
  assert.ok(src.includes('https://api.github.com/graphql'));
  assert.ok(src.includes('statusMapping'));
});
