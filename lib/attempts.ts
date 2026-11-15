// Limits that hold across every serverless instance (stored in Firestore `rateLimits`).
// The in-memory lib/rate-limit.ts only protects one instance: use it as a cheap first filter.
import { createHash } from 'node:crypto';
import { adminDb } from './firebase-admin';

const col = () => adminDb.collection('rateLimits');
const keyId = (key: string) => createHash('sha256').update(key).digest('hex');

/**
 * Counts one hit for `key` in a fixed window; false once `limit` is reached.
 * Fails open (true) if Firestore is unreachable, so a database hiccup never blocks real users.
 */
export async function hit(key: string, limit: number, windowMs: number): Promise<boolean> {
  const ref = col().doc(keyId(key));
  try {
    return await adminDb.runTransaction(async (t) => {
      const now  = Date.now();
      const data = (await t.get(ref)).data() as { count?: number; resetAt?: number } | undefined;
      if (!data?.resetAt || data.resetAt <= now) {
        t.set(ref, { count: 1, resetAt: now + windowMs, expireAt: new Date(now + windowMs + 86_400_000) });
        return true;
      }
      if ((data.count ?? 0) >= limit) return false;
      t.update(ref, { count: (data.count ?? 0) + 1 });
      return true;
    });
  } catch (err) {
    console.error('[attempts] hit failed', err);
    return true;
  }
}

/** True while `key` has used up its window (does not count a hit). */
export async function isBlocked(key: string, limit: number): Promise<boolean> {
  try {
    const data = (await col().doc(keyId(key)).get()).data() as { count?: number; resetAt?: number } | undefined;
    return !!data?.resetAt && data.resetAt > Date.now() && (data.count ?? 0) >= limit;
  } catch {
    return false;
  }
}

export async function clear(key: string): Promise<void> {
  await col().doc(keyId(key)).delete().catch(() => {});
}
