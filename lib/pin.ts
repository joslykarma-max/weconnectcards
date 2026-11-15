// Short secret codes (medical PIN…) are stored as salted scrypt hashes, never in clear.
import { randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';

const KEY_LEN = 32;

/** « scrypt:<salt hex>:<hash hex> » */
export function hashPin(pin: string): string {
  const salt = randomBytes(16);
  return `scrypt:${salt.toString('hex')}:${scryptSync(pin, salt, KEY_LEN).toString('hex')}`;
}

export function verifyPin(pin: string, stored: unknown): boolean {
  if (typeof stored !== 'string') return false;
  const [scheme, saltHex, hashHex] = stored.split(':');
  if (scheme !== 'scrypt' || !saltHex || !hashHex) return false;
  const expected = Buffer.from(hashHex, 'hex');
  const actual   = scryptSync(pin, Buffer.from(saltHex, 'hex'), expected.length);
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}
