import test from 'node:test';
import assert from 'node:assert';
import { ReservationBridge } from '../src/services/reservation-bridge.js';
import { BackendClient } from '../src/services/backend-client.js';

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
