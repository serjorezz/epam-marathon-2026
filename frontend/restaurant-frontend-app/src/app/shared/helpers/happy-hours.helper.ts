import { LocationResponse } from '@app/models/locations/location-response.model';

export interface HappyHoursConfig {
  start: string;
  end: string;
  discountPercentage: number;
}

export const DEFAULT_HAPPY_HOURS: HappyHoursConfig = {
  start: '12:00',
  end: '16:00',
  discountPercentage: 10,
};

export const LOCATION_HAPPY_HOURS_MAP: Record<string, HappyHoursConfig> = {
  'loc-baratashvili': { start: '12:00', end: '16:00', discountPercentage: 10 },
  'loc-abashidze': { start: '12:00', end: '16:00', discountPercentage: 10 },
  'loc-rustaveli': { start: '12:00', end: '16:00', discountPercentage: 10 },
  'loc-chavchavadze': { start: '12:00', end: '16:00', discountPercentage: 10 },
  'loc-agmashenebeli': { start: '12:00', end: '16:00', discountPercentage: 10 },
  'loc-pekini': { start: '12:00', end: '16:00', discountPercentage: 10 },
  'loc-marjanishvili': { start: '12:00', end: '16:00', discountPercentage: 10 },
  'loc-gorgasali': { start: '12:00', end: '16:00', discountPercentage: 10 },
};

export const ADDRESS_HAPPY_HOURS_KEYWORDS: Record<string, HappyHoursConfig> = {
  baratashvili: { start: '12:00', end: '16:00', discountPercentage: 10 },
  abashidze: { start: '12:00', end: '16:00', discountPercentage: 10 },
  rustaveli: { start: '12:00', end: '16:00', discountPercentage: 10 },
  chavchavadze: { start: '12:00', end: '16:00', discountPercentage: 10 },
  agmashenebeli: { start: '12:00', end: '16:00', discountPercentage: 10 },
  pekini: { start: '12:00', end: '16:00', discountPercentage: 10 },
  marjanishvili: { start: '12:00', end: '16:00', discountPercentage: 10 },
  gorgasali: { start: '12:00', end: '16:00', discountPercentage: 10 },
};

export function parseTimeToMinutes(timeStr: string): number | null {
  if (!timeStr) return null;
  // Match HH:mm
  const match = timeStr.match(/(\d{1,2}):(\d{2})/);
  if (!match) return null;
  const hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);
  return hours * 60 + minutes;
}

export function getHappyHoursConfig(
  location?: Partial<LocationResponse> | string | null
): HappyHoursConfig {
  if (!location) {
    return DEFAULT_HAPPY_HOURS;
  }

  if (typeof location === 'string') {
    const locLower = location.toLowerCase();
    if (LOCATION_HAPPY_HOURS_MAP[locLower]) {
      return LOCATION_HAPPY_HOURS_MAP[locLower];
    }
    for (const [key, config] of Object.entries(ADDRESS_HAPPY_HOURS_KEYWORDS)) {
      if (locLower.includes(key)) {
        return config;
      }
    }
    return DEFAULT_HAPPY_HOURS;
  }

  if (location.happyHoursStart && location.happyHoursEnd && location.discountPercentage) {
    return {
      start: location.happyHoursStart,
      end: location.happyHoursEnd,
      discountPercentage: location.discountPercentage,
    };
  }

  if (location.id && LOCATION_HAPPY_HOURS_MAP[location.id]) {
    return LOCATION_HAPPY_HOURS_MAP[location.id];
  }

  if (location.address) {
    const addrLower = location.address.toLowerCase();
    for (const [key, config] of Object.entries(ADDRESS_HAPPY_HOURS_KEYWORDS)) {
      if (addrLower.includes(key)) {
        return config;
      }
    }
  }

  return DEFAULT_HAPPY_HOURS;
}

export function isTimeInHappyHours(
  timeInput: Date | string | null | undefined,
  config: HappyHoursConfig = DEFAULT_HAPPY_HOURS
): boolean {
  if (!timeInput) return false;

  const startMin = parseTimeToMinutes(config.start);
  const endMin = parseTimeToMinutes(config.end);
  if (startMin === null || endMin === null) return false;

  let testMin: number | null = null;

  if (timeInput instanceof Date) {
    testMin = timeInput.getHours() * 60 + timeInput.getMinutes();
  } else if (typeof timeInput === 'string') {
    // Check if ISO date string containing "T"
    if (timeInput.includes('T')) {
      const parsedDate = new Date(timeInput);
      if (!isNaN(parsedDate.getTime())) {
        testMin = parsedDate.getHours() * 60 + parsedDate.getMinutes();
      }
    }

    if (testMin === null) {
      // Try to find HH:mm pattern, e.g. "13:30 - 15:00" -> extract 13:30
      const match = timeInput.match(/(\d{1,2}):(\d{2})/);
      if (match) {
        testMin = parseInt(match[1], 10) * 60 + parseInt(match[2], 10);
      }
    }
  }

  if (testMin === null) return false;

  // Active if reservation start is within [startMin, endMin)
  return testMin >= startMin && testMin < endMin;
}

export interface HappyHourEvaluation {
  isHappyHour: boolean;
  discountPercentage: number;
  start: string;
  end: string;
}

export function evaluateHappyHours(params: {
  locationId?: string | null;
  locationAddress?: string | null;
  startTime?: Date | string | null;
  reservationLabel?: string | null;
}): HappyHourEvaluation {
  const config = getHappyHoursConfig(
    params.locationId || params.locationAddress || params.reservationLabel || null
  );

  let timeToCheck: Date | string | null = params.startTime ?? null;

  if (!timeToCheck && params.reservationLabel) {
    // Extract time from label, e.g. "13:30 - 15:00"
    const match = params.reservationLabel.match(/(\d{1,2}:\d{2})/);
    if (match) {
      timeToCheck = match[1];
    }
  }

  const isHappyHour = isTimeInHappyHours(timeToCheck, config);

  return {
    isHappyHour,
    discountPercentage: isHappyHour ? config.discountPercentage : 0,
    start: config.start,
    end: config.end,
  };
}

export function calculateDiscountedPrice(
  originalPrice: number,
  discountPercentage: number
): number {
  if (!discountPercentage || discountPercentage <= 0) {
    return originalPrice;
  }
  const factor = 1 - discountPercentage / 100;
  const discounted = originalPrice * factor;
  return Math.round(discounted * 100) / 100;
}

export function getHappyHoursLocationDescription(
  config: HappyHoursConfig = DEFAULT_HAPPY_HOURS
): string {
  return `Daily from ${config.start} to ${config.end} — ${config.discountPercentage}% discount on all menu dishes.`;
}
