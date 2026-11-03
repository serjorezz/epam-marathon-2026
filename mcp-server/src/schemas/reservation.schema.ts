import { z } from 'zod';
import { sanitizeString, sanitizePhone, sanitizeDate } from '../middleware/sanitize.js';

/**
 * Schema for check_availability tool / endpoint
 */
export const CheckAvailabilitySchema = z.object({
  date: z
    .string()
    .min(1, "'date' is required (format: YYYY-MM-DD or ISO 8601)")
    .transform((val) => sanitizeDate(val))
    .refine((val) => /^\d{4}-\d{2}-\d{2}$/.test(val), {
      message: "Invalid date format. Expected 'YYYY-MM-DD' (e.g. 2026-11-10)",
    })
    .refine((val) => {
      const parsed = new Date(val + 'T00:00:00Z');
      if (isNaN(parsed.getTime())) return false;
      const today = new Date();
      today.setUTCHours(0, 0, 0, 0);
      return parsed >= today;
    }, {
      message: "Reservation date cannot be in the past",
    }),

  guests_count: z.coerce
    .number()
    .int("'guests_count' must be an integer")
    .min(1, 'Number of guests must be at least 1')
    .max(20, 'Maximum party size is 20 guests'),
});

export type CheckAvailabilityInput = z.infer<typeof CheckAvailabilitySchema>;

/**
 * Schema for create_reservation tool / endpoint
 */
export const CreateReservationSchema = z.object({
  name: z
    .string()
    .min(1, "'name' is required")
    .transform((val) => sanitizeString(val, 100))
    .refine((val) => val.length >= 2, {
      message: "Customer name must be at least 2 characters",
    }),

  phone: z
    .string()
    .min(1, "'phone' is required")
    .transform((val) => sanitizePhone(val))
    .refine((val) => /^\+?[0-9\s\-()]{7,25}$/.test(val), {
      message: "Invalid phone number format (e.g. +995555123456 or 555-123456)",
    }),

  guests_count: z.coerce
    .number()
    .int("'guests_count' must be an integer")
    .min(1, 'Number of guests must be at least 1')
    .max(20, 'Maximum party size is 20 guests'),

  datetime: z
    .string()
    .min(1, "'datetime' is required (ISO 8601 string, e.g. 2026-11-10T18:00:00Z)")
    .transform((val) => val.trim())
    .refine((val) => {
      const parsed = new Date(val);
      return !isNaN(parsed.getTime());
    }, {
      message: "Invalid datetime format. Expected ISO 8601 (e.g. 2026-11-10T18:00:00Z)",
    })
    .refine((val) => {
      const parsed = new Date(val);
      // Reservation must not be in the past (allow 10-minute clock skew)
      const minTime = new Date(Date.now() - 10 * 60 * 1000);
      return parsed >= minTime;
    }, {
      message: "Reservation datetime cannot be in the past",
    }),

  special_requests: z
    .string()
    .optional()
    .transform((val) => (val ? sanitizeString(val, 500) : undefined)),
});

export type CreateReservationInput = z.infer<typeof CreateReservationSchema>;
