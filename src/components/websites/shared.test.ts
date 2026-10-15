import assert from 'node:assert/strict';
import { test } from 'node:test';
import { apiRequest } from './shared';

test('apiRequest returns JSON responses', async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () => new Response(JSON.stringify({ ok: true }), {
    headers: { 'content-type': 'application/json' },
  });

  try {
    assert.deepEqual(await apiRequest<{ ok: boolean }>('/api/test'), { ok: true });
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test('apiRequest rejects successful HTML responses instead of treating them as empty API data', async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () => new Response('<!doctype html><title>YBGP</title>', {
    headers: { 'content-type': 'text/html' },
  });

  try {
    await assert.rejects(
      apiRequest('/api/test'),
      /non-JSON response.*Node\.js API may be unavailable/
    );
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test('apiRequest reports invalid JSON responses', async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () => new Response('{', {
    headers: { 'content-type': 'application/json' },
  });

  try {
    await assert.rejects(apiRequest('/api/test'), /API returned invalid JSON/);
  } finally {
    globalThis.fetch = originalFetch;
  }
});
