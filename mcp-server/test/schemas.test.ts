import test from 'node:test';
import assert from 'node:assert';
import { CheckAvailabilitySchema, CreateReservationSchema } from '../src/schemas/reservation.schema.js';

test('CheckAvailabilitySchema parses valid input', () => {
  const futureYear = new Date().getFullYear() + 1;
  const result = CheckAvailabilitySchema.safeParse({
    date: `${futureYear}-06-15`,
    guests_count: 4,
  });
  assert.strictEqual(result.success, true);
  if (result.success) {
    assert.strictEqual(result.data.date, `${futureYear}-06-15`);
    assert.strictEqual(result.data.guests_count, 4);
  }
});

test('CheckAvailabilitySchema rejects past date', () => {
  const result = CheckAvailabilitySchema.safeParse({
    date: '2020-01-01',
    guests_count: 2,
  });
  assert.strictEqual(result.success, false);
});

test('CheckAvailabilitySchema rejects invalid party size', () => {
  const futureYear = new Date().getFullYear() + 1;
  const zeroGuests = CheckAvailabilitySchema.safeParse({
    date: `${futureYear}-06-15`,
    guests_count: 0,
  });
  assert.strictEqual(zeroGuests.success, false);

  const tooManyGuests = CheckAvailabilitySchema.safeParse({
    date: `${futureYear}-06-15`,
    guests_count: 50,
  });
  assert.strictEqual(tooManyGuests.success, false);
});

test('CreateReservationSchema parses valid booking payload', () => {
  const futureDate = new Date(Date.now() + 24 * 3600 * 1000).toISOString();
  const result = CreateReservationSchema.safeParse({
    name: '  Giorgi Beridze  ',
    phone: '+995 555 123 456',
    guests_count: '2',
    datetime: futureDate,
    special_requests: '<b>Window table</b> please',
  });

  assert.strictEqual(result.success, true);
  if (result.success) {
    assert.strictEqual(result.data.name, 'Giorgi Beridze');
    assert.strictEqual(result.data.phone, '+995 555 123 456');
    assert.strictEqual(result.data.guests_count, 2);
    assert.strictEqual(result.data.special_requests, 'Window table please');
  }
});

test('CreateReservationSchema rejects short name or invalid phone', () => {
  const futureDate = new Date(Date.now() + 24 * 3600 * 1000).toISOString();
  const shortName = CreateReservationSchema.safeParse({
    name: 'A',
    phone: '+995555123456',
    guests_count: 2,
    datetime: futureDate,
  });
  assert.strictEqual(shortName.success, false);

  const badPhone = CreateReservationSchema.safeParse({
    name: 'Valid Name',
    phone: 'abc',
    guests_count: 2,
    datetime: futureDate,
  });
  assert.strictEqual(badPhone.success, false);
});
