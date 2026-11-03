import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import { config } from '../config.js';

/**
 * Timing-safe string comparison to protect against timing attacks.
 */
function timingSafeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) {
    return false;
  }
  return crypto.timingSafeEqual(bufA, bufB);
}

/**
 * Validates whether the given raw token matches the configured MCP_API_KEY.
 */
export function verifyApiKey(candidate: string | undefined | null): boolean {
  if (!candidate || typeof candidate !== 'string') {
    return false;
  }
  const expected = config.mcpApiKey;
  if (!expected) {
    return false;
  }
  return timingSafeEqual(candidate.trim(), expected.trim());
}

/**
 * Express middleware enforcing API key or Bearer token validation for incoming requests.
 */
export function requireApiKey(req: Request, res: Response, next: NextFunction): void {
  // Check 'x-api-key' header
  const apiKeyHeader = req.headers['x-api-key'];
  if (typeof apiKeyHeader === 'string' && verifyApiKey(apiKeyHeader)) {
    return next();
  }

  // Check 'Authorization: Bearer <token>' header
  const authHeader = req.headers['authorization'];
  if (authHeader && typeof authHeader === 'string') {
    const parts = authHeader.split(' ');
    if (parts.length === 2 && parts[0].toLowerCase() === 'bearer') {
      if (verifyApiKey(parts[1])) {
        return next();
      }
    }
  }

  // Check query parameter 'api_key' for SSE or tool client handshakes
  const queryApiKey = req.query['api_key'];
  if (typeof queryApiKey === 'string' && verifyApiKey(queryApiKey)) {
    return next();
  }

  res.status(401).json({
    error: 'Unauthorized',
    message: "Invalid or missing API key. Provide via 'x-api-key' header or 'Authorization: Bearer <key>'.",
  });
}
