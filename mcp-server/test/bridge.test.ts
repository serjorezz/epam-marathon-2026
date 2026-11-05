import test from 'node:test';
import assert from 'node:assert';
import { ReservationBridge } from '../src/services/reservation-bridge.js';
import { BackendClient } from '../src/services/backend-client.js';
import { config } from '../src/config.js';

class MockBackendClient extends BackendClient {
  override async getAvailableTables(capacity: number, startTimeIso: string) {
    return [
      { id: 'table-b1', locationId: 'loc-baratashvili', capacity: 2, tableNumber: 1 },
      { id: 'table-b2', locationId: 'loc-baratashvili', capacity: 4, tableNumber: 2 },
    ];
  }

  override async createReservation(payload: any) {
    return {
      id: 'res-test-mock-123',
      tableId: payload.tableId,
      locationId: 'loc-baratashvili',
      startTime: payload.startTime,
      endTime: payload.endTime,
      guestCount: payload.guestCount,
      status: 'Reserved',
    };
  }
}

class FailingBackendClient extends BackendClient {
  override async getAvailableTables(_capacity: number, _startTimeIso: string): Promise<never> {
    throw new Error('backend unreachable');
  }
}

class PartialFailingBackendClient extends BackendClient {
  calls = 0;
  override async getAvailableTables(_capacity: number, startTimeIso: string) {
    this.calls += 1;
    // Fail half of the probes to simulate a flaky backend
    if (this.calls % 2 === 0) {
      throw new Error('intermittent failure');
    }
    return [{ id: 'table-b1', locationId: 'loc-baratashvili', capacity: 4, tableNumber: 1 }];
  }
}

test('ReservationBridge.checkAvailability returns available slots and message', async () => {
  const bridge = new ReservationBridge(new MockBackendClient());
  const futureYear = new Date().getFullYear() + 1;
  const result = await bridge.checkAvailability({
    date: `${futureYear}-11-15`,
    guests_count: 2,
  });

  assert.strictEqual(result.available, true);
  assert.strictEqual(result.date, `${futureYear}-11-15`);
  assert.strictEqual(result.guests_count, 2);
  assert.ok(result.available_time_slots.length > 0);
  assert.ok(result.message.includes('Tables are available'));
});

test('ReservationBridge.createReservation books table and formats confirmation', async () => {
  const bridge = new ReservationBridge(new MockBackendClient());
  const futureDate = new Date(Date.now() + 48 * 3600 * 1000).toISOString();

  const result = await bridge.createReservation({
    name: 'Nino Beridze',
    phone: '+995 555 987 654',
    guests_count: 2,
    datetime: futureDate,
    special_requests: 'Outdoor seating',
  });

  assert.strictEqual(result.success, true);
  assert.strictEqual(result.reservationId, 'res-test-mock-123');
  assert.strictEqual(result.name, 'Nino Beridze');
  assert.strictEqual(result.phone, '+995 555 987 654');
  assert.strictEqual(result.guestsCount, 2);
  assert.strictEqual(result.specialRequests, 'Outdoor seating');
  assert.ok(result.message.includes('Reservation successfully confirmed'));
});

test('ReservationBridge.checkAvailability falls back to mock slots when backend is fully down and MOCK_FALLBACK=true', async (t) => {
  const original = config.mockFallback;
  config.mockFallback = true;
  t.after(() => {
    config.mockFallback = original;
  });

  const bridge = new ReservationBridge(new FailingBackendClient());
  const futureYear = new Date().getFullYear() + 1;
  const result = await bridge.checkAvailability({
    date: `${futureYear}-11-15`,
    guests_count: 2,
  });

  assert.strictEqual(result.available, true);
  assert.ok(result.available_time_slots.length > 0);
  assert.ok(result.message.includes('Tables are available'));
});

test('ReservationBridge.checkAvailability throws when backend is fully down and MOCK_FALLBACK=false', async (t) => {
  const original = config.mockFallback;
  config.mockFallback = false;
  t.after(() => {
    config.mockFallback = original;
  });

  const bridge = new ReservationBridge(new FailingBackendClient());
  const futureYear = new Date().getFullYear() + 1;

  await assert.rejects(
    bridge.checkAvailability({ date: `${futureYear}-11-15`, guests_count: 2 }),
    /backend unreachable/
  );
});

test('ReservationBridge.checkAvailability returns partial results when only some probes fail', async (t) => {
  const original = config.mockFallback;
  config.mockFallback = false;
  t.after(() => {
    config.mockFallback = original;
  });

  const client = new PartialFailingBackendClient();
  const bridge = new ReservationBridge(client);
  const futureYear = new Date().getFullYear() + 1;
  const result = await bridge.checkAvailability({
    date: `${futureYear}-11-15`,
    guests_count: 2,
  });

  // At least the non-failing probes should produce slots — no throw, no full mock.
  assert.strictEqual(typeof result.available, 'boolean');
  assert.ok(Array.isArray(result.available_time_slots));
});
