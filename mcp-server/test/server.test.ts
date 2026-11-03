import test from 'node:test';
import assert from 'node:assert';
import http from 'http';
import { createExpressApp } from '../src/server.js';
import { ReservationBridge } from '../src/services/reservation-bridge.js';
import { BackendClient } from '../src/services/backend-client.js';
import { config } from '../src/config.js';

class MockBackendClient extends BackendClient {
  override async getAvailableTables(capacity: number, startTimeIso: string) {
    return [{ id: 'table-test', locationId: 'loc-baratashvili', capacity, tableNumber: 1 }];
  }

  override async createReservation(payload: any) {
    return {
      id: 'res-e2e-12345',
      tableId: payload.tableId,
      locationId: 'loc-baratashvili',
      startTime: payload.startTime,
      endTime: payload.endTime,
      guestCount: payload.guestCount,
      status: 'Reserved',
    };
  }
}

test('Express Server Endpoints E2E', async (t) => {
  const bridge = new ReservationBridge(new MockBackendClient());
  const app = createExpressApp(bridge);
  const server = http.createServer(app);

  await new Promise<void>((resolve) => server.listen(0, resolve));
  const address = server.address() as any;
  const baseUrl = `http://localhost:${address.port}`;

  t.after(() => {
    server.close();
  });

  // 1. Health check
  const healthRes = await fetch(`${baseUrl}/health`);
  assert.strictEqual(healthRes.status, 200);
  const healthJson = await healthRes.json() as any;
  assert.strictEqual(healthJson.status, 'ok');

  // 2. Manifest
  const manifestRes = await fetch(`${baseUrl}/manifest.json`);
  assert.strictEqual(manifestRes.status, 200);
  const manifestJson = await manifestRes.json() as any;
  assert.strictEqual(manifestJson.name_for_model, 'green_tasty_reservations');

  // 3. OpenAPI 3.0 spec
  const openApiRes = await fetch(`${baseUrl}/openapi.json`);
  assert.strictEqual(openApiRes.status, 200);
  const openApiJson = await openApiRes.json() as any;
  assert.strictEqual(openApiJson.openapi, '3.0.3');

  // 4. Unauthorized check-availability
  const unauthRes = await fetch(`${baseUrl}/api/check-availability`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ date: '2026-11-10', guests_count: 2 }),
  });
  assert.strictEqual(unauthRes.status, 401);

  // 5. Authorized check-availability
  const futureYear = new Date().getFullYear() + 1;
  const availRes = await fetch(`${baseUrl}/api/check-availability`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': config.mcpApiKey,
    },
    body: JSON.stringify({ date: `${futureYear}-11-10`, guests_count: 2 }),
  });
  assert.strictEqual(availRes.status, 200);
  const availJson = await availRes.json() as any;
  assert.strictEqual(availJson.available, true);
  assert.ok(availJson.available_time_slots.length > 0);

  // 6. Authorized create-reservation
  const futureDate = new Date(Date.now() + 36 * 3600 * 1000).toISOString();
  const bookRes = await fetch(`${baseUrl}/api/create-reservation`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${config.mcpApiKey}`,
    },
    body: JSON.stringify({
      name: 'Tamara Gachechiladze',
      phone: '+995 599 123 456',
      guests_count: 2,
      datetime: futureDate,
      special_requests: 'Quiet table for two',
    }),
  });
  assert.strictEqual(bookRes.status, 201);
  const bookJson = await bookRes.json() as any;
  assert.strictEqual(bookJson.success, true);
  assert.strictEqual(bookJson.reservationId, 'res-e2e-12345');
  assert.strictEqual(bookJson.name, 'Tamara Gachechiladze');
});
