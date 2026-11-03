import test from 'node:test';
import assert from 'node:assert';
import { sanitizeString, sanitizePhone, sanitizeDate } from '../src/middleware/sanitize.js';

test('sanitizeString strips script and html tags', () => {
  const dirty = '<script>alert("hacked")</script>Hello <b>World</b>!';
  const clean = sanitizeString(dirty);
  assert.strictEqual(clean, 'alert("hacked")Hello World!');
});

test('sanitizeString strips control characters and trims', () => {
  const dirty = '  Hello\x00\x1F World!  ';
  const clean = sanitizeString(dirty);
  assert.strictEqual(clean, 'Hello World!');
});

test('sanitizeString strips SQL injection keywords', () => {
  const dirty = "DROP TABLE reservations; SELECT * FROM users; --";
  const clean = sanitizeString(dirty);
  assert.strictEqual(clean.includes('DROP TABLE'), false);
  assert.strictEqual(clean.includes('SELECT'), false);
});

test('sanitizePhone cleans non-phone characters', () => {
  assert.strictEqual(sanitizePhone('+995 (555) 12-34-56'), '+995 (555) 12-34-56');
  assert.strictEqual(sanitizePhone('<script>+12345</script>'), '+12345');
});

test('sanitizeDate normalizes YYYY-MM-DD', () => {
  assert.strictEqual(sanitizeDate('2026-11-10T18:00:00Z'), '2026-11-10');
  assert.strictEqual(sanitizeDate(' 2026-12-25 '), '2026-12-25');
});
