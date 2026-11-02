import { Reservation } from '@app/models/reservations/reservation.model';

export function formatOrderNumber(orderId: string): string {
  if (!orderId) {
    return '';
  }

  if (/^\d{8,}$/.test(orderId)) {
    return orderId;
  }

  // Deterministic 64-bit FNV-1a hash to 11-digit number
  let hash = 0xcbf29ce484222325n;
  const prime = 0x100000001b3n;

  for (let i = 0; i < orderId.length; i++) {
    hash ^= BigInt(orderId.charCodeAt(i));
    hash = (hash * prime) & 0xffffffffffffffffn;
  }

  const num = (hash % 90000000000n) + 10000000000n;
  return num.toString();
}

export interface OrderReservationDetails {
  location: string;
  date: string;
  time: string;
  guests: string;
}

export function parseOrderReservationDetails(
  address?: string,
  timeStr?: string,
  reservation?: Reservation | null,
): OrderReservationDetails {
  let location = reservation?.locationAddress || address || '';
  location = location.replace(/,\s*table\s*\d+/i, '').trim();

  let date = '';
  let time = '';

  const formatHhMm = (d: Date): string =>
    `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;

  if (reservation?.startTime && reservation?.endTime) {
    const start = new Date(reservation.startTime);
    const end = new Date(reservation.endTime);
    if (!isNaN(start.getTime()) && !isNaN(end.getTime())) {
      date = start.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
      time = `${formatHhMm(start)} – ${formatHhMm(end)}`;
    }
  }

  if (!date && timeStr) {
    if (!isNaN(Date.parse(timeStr)) && timeStr.includes('T')) {
      const d = new Date(timeStr);
      date = d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
      time = formatHhMm(d);
    } else {
      const commaIdx = timeStr.lastIndexOf(',');
      if (commaIdx !== -1) {
        date = timeStr.substring(0, commaIdx).trim();
        const rawTime = timeStr.substring(commaIdx + 1).trim();
        const parts = rawTime.split(/\s*-\s*/);
        if (parts.length === 2) {
          const convertTo24 = (t: string): string => {
            const match = t.trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?$/i);
            if (!match) return t.trim();
            let h = parseInt(match[1], 10);
            const m = match[2];
            const ampm = match[3]?.toUpperCase();
            if (ampm === 'PM' && h < 12) h += 12;
            if (ampm === 'AM' && h === 12) h = 0;
            return `${h.toString().padStart(2, '0')}:${m}`;
          };
          time = `${convertTo24(parts[0])} – ${convertTo24(parts[1])}`;
        } else {
          time = rawTime.replace(/\s*-\s*/g, ' – ');
        }
      } else {
        date = timeStr;
      }
    }
  }

  const count = reservation?.guestCount ?? 2;
  const guests = `${count} ${count === 1 ? 'person' : 'people'}`;

  return { location, date, time, guests };
}
