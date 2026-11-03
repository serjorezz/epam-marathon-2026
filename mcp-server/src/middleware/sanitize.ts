/**
 * Input sanitization helpers to prevent injection, XSS, and malformed booking states.
 */

/**
 * Strips HTML tags, script elements, control characters, and excess whitespace.
 */
export function sanitizeString(input: unknown, maxLength = 250): string {
  if (typeof input !== 'string') {
    return '';
  }

  // Remove control characters and null bytes
  let sanitized = input.replace(/[\x00-\x1F\x7F]/g, '');

  // Strip HTML / XML tags
  sanitized = sanitized.replace(/<[^>]*>/g, '');

  // Strip suspicious SQL / command injection sequences
  sanitized = sanitized.replace(/(--|\/\*|\*\/|;|\b(exec|union|select|drop|delete|update)\b)/gi, '');

  // Collapse multiple whitespace characters
  sanitized = sanitized.replace(/\s+/g, ' ').trim();

  // Enforce max length
  if (sanitized.length > maxLength) {
    sanitized = sanitized.slice(0, maxLength).trim();
  }

  return sanitized;
}

/**
 * Sanitizes and normalizes phone numbers (keeps +, digits, spaces, and hyphens).
 */
export function sanitizePhone(input: unknown): string {
  if (typeof input !== 'string') {
    return '';
  }

  // Strip HTML / control chars
  let cleaned = input.replace(/[\x00-\x1F\x7F]/g, '').trim();

  // Keep only leading + and digits / hyphens / spaces / parentheses
  cleaned = cleaned.replace(/[^\d+()-\s]/g, '');

  // Collapse whitespace
  cleaned = cleaned.replace(/\s+/g, ' ').trim();

  return cleaned.slice(0, 30);
}

/**
 * Sanitizes and normalizes dates (YYYY-MM-DD).
 */
export function sanitizeDate(input: unknown): string {
  if (typeof input !== 'string') {
    return '';
  }
  const trimmed = input.trim();
  // Match standard YYYY-MM-DD or ISO string prefix
  const match = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (match) {
    return `${match[1]}-${match[2]}-${match[3]}`;
  }
  return trimmed.slice(0, 30);
}
