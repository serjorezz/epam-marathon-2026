import test from 'node:test';
import assert from 'node:assert';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { getOpenApiSpec } from '../src/openapi.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

test('OpenAPI specification is compliant with 3.0.3 and defines core reservation paths', () => {
  const spec = getOpenApiSpec('http://localhost:3000');
  assert.strictEqual(spec.openapi, '3.0.3');
  assert.ok(spec.paths['/api/check-availability']);
  assert.ok(spec.paths['/api/create-reservation']);

  assert.strictEqual(spec.paths['/api/check-availability'].post.operationId, 'check_availability');
  assert.strictEqual(spec.paths['/api/create-reservation'].post.operationId, 'create_reservation');

  assert.ok(spec.components.securitySchemes.ApiKeyAuth);
  assert.ok(spec.components.securitySchemes.BearerAuth);
});

test('manifest.json exists and contains required extension metadata', () => {
  const manifestPath = path.resolve(__dirname, '../manifest.json');
  assert.strictEqual(fs.existsSync(manifestPath), true);

  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
  assert.strictEqual(manifest.schema_version, 'v1');
  assert.strictEqual(manifest.name_for_model, 'green_tasty_reservations');
  assert.ok(manifest.description_for_model.includes('check_availability'));
  assert.ok(manifest.description_for_model.includes('create_reservation'));
  assert.ok(manifest.api.url.includes('openapi.json'));
});

test('gemini-extension.json exists and defines both tools', () => {
  const extPath = path.resolve(__dirname, '../gemini-extension.json');
  assert.strictEqual(fs.existsSync(extPath), true);

  const ext = JSON.parse(fs.readFileSync(extPath, 'utf-8'));
  assert.strictEqual(ext.name, 'green_tasty_reservations');
  const toolNames = ext.tools.map((t: any) => t.name);
  assert.ok(toolNames.includes('check_availability'));
  assert.ok(toolNames.includes('create_reservation'));
});
