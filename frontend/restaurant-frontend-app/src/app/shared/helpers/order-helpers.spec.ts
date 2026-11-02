import {
  formatOrderNumber,
  parseOrderReservationDetails,
} from './order-helpers';
import { Reservation, ReservationStatus } from '@app/models/reservations/reservation.model';

describe('order-helpers', () => {
  describe('formatOrderNumber', () => {
    it('should return empty string for empty input', () => {
      expect(formatOrderNumber('')).toBe('');
    });

    it('should return already long numeric order IDs as-is', () => {
      expect(formatOrderNumber('12345678901')).toBe('12345678901');
    });

    it('should convert UUIDs to deterministic 11-digit numbers', () => {
      const res1 = formatOrderNumber('05ee9cae-a3da-4905-86db-d31c4f14ff5f');
      const res2 = formatOrderNumber('05ee9cae-a3da-4905-86db-d31c4f14ff5f');
      expect(res1).toBe(res2);
      expect(res1.length).toBe(11);
      expect(/^\d{11}$/.test(res1)).toBeTrue();
    });

    it('should convert arbitrary string IDs like order-1 to 11-digit numbers', () => {
      const res = formatOrderNumber('order-1');
      expect(res.length).toBe(11);
      expect(/^\d{11}$/.test(res)).toBeTrue();
    });
  });

  describe('parseOrderReservationDetails', () => {
    it('should extract details from reservation when provided', () => {
      const reservation: Reservation = {
        id: 'res-1',
        tableId: 'tab-1',
        customerId: 'cust-1',
        startTime: new Date('2026-10-17T12:00:00Z'),
        endTime: new Date('2026-10-17T14:00:00Z'),
        guestCount: 2,
        status: ReservationStatus.Reserved,
        locationAddress: 'Rustavelli 46 Ave, Table 4',
        tableCapacity: 4,
        waiterId: 'waiter-1',
      };

      const result = parseOrderReservationDetails(
        'Fallback Address',
        'Fallback Time',
        reservation,
      );

      expect(result.location).toBe('Rustavelli 46 Ave');
      expect(result.date).toContain('Oct 17, 2026');
      expect(result.time).toMatch(/\d{2}:\d{2}\s*–\s*\d{2}:\d{2}/);
      expect(result.guests).toBe('2 people');
    });

    it('should handle singular guest count', () => {
      const reservation: Reservation = {
        id: 'res-1',
        tableId: 'tab-1',
        customerId: 'cust-1',
        startTime: new Date('2026-10-17T12:00:00Z'),
        endTime: new Date('2026-10-17T14:00:00Z'),
        guestCount: 1,
        status: ReservationStatus.Reserved,
        locationAddress: 'Rustavelli 46 Ave',
        tableCapacity: 2,
        waiterId: 'waiter-1',
      };

      const result = parseOrderReservationDetails(undefined, undefined, reservation);
      expect(result.guests).toBe('1 person');
    });

    it('should fallback to parsing address and time strings when no reservation exists', () => {
      const result = parseOrderReservationDetails(
        '48 Rustaveli Avenue',
        'Nov 14, 2026, 9:30 AM - 11:00 AM',
      );

      expect(result.location).toBe('48 Rustaveli Avenue');
      expect(result.date).toBe('Nov 14, 2026');
      expect(result.time).toBe('09:30 – 11:00');
      expect(result.guests).toBe('2 people');
    });
  });
});
