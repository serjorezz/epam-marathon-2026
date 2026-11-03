import test from 'node:test';
import assert from 'node:assert';
import { verifyApiKey, requireApiKey } from '../src/middleware/auth.js';
import { config } from '../src/config.js';

test('verifyApiKey checks candidate against configured MCP_API_KEY', () => {
  assert.strictEqual(verifyApiKey(config.mcpApiKey), true);
  assert.strictEqual(verifyApiKey('wrong-key'), false);
  assert.strictEqual(verifyApiKey(''), false);
  assert.strictEqual(verifyApiKey(undefined), false);
  assert.strictEqual(verifyApiKey(null), false);
});

test('requireApiKey rejects unauthenticated request with 401', () => {
  let status = 0;
  let jsonBody: any = null;
  let nextCalled = false;

  const req: any = { headers: {}, query: {} };
  const res: any = {
    status: (s: number) => {
      status = s;
      return {
        json: (body: any) => {
          jsonBody = body;
        },
      };
    },
  };
  const next = () => {
    nextCalled = true;
  };

  requireApiKey(req, res, next);
  assert.strictEqual(status, 401);
  assert.strictEqual(jsonBody.error, 'Unauthorized');
  assert.strictEqual(nextCalled, false);
});

test('requireApiKey accepts x-api-key header', () => {
  let nextCalled = false;
  const req: any = { headers: { 'x-api-key': config.mcpApiKey }, query: {} };
  const res: any = {};
  const next = () => {
    nextCalled = true;
  };

  requireApiKey(req, res, next);
  assert.strictEqual(nextCalled, true);
});

test('requireApiKey accepts Authorization: Bearer header', () => {
  let nextCalled = false;
  const req: any = { headers: { authorization: `Bearer ${config.mcpApiKey}` }, query: {} };
  const res: any = {};
  const next = () => {
    nextCalled = true;
  };

  requireApiKey(req, res, next);
  assert.strictEqual(nextCalled, true);
});

test('requireApiKey accepts query parameter api_key', () => {
  let nextCalled = false;
  const req: any = { headers: {}, query: { api_key: config.mcpApiKey } };
  const res: any = {};
  const next = () => {
    nextCalled = true;
  };

  requireApiKey(req, res, next);
  assert.strictEqual(nextCalled, true);
});
