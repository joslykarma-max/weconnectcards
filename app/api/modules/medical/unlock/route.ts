import { NextRequest, NextResponse } from 'next/server';
import { createHash, timingSafeEqual } from 'node:crypto';
import { adminDb } from '@/lib/firebase-admin';
import { getClientIp, rateLimit } from '@/lib/rate-limit';
import { medicalHasPin, protectedMedicalFields } from '@/lib/medical';
import type { ModuleDoc } from '@/lib/types';

// Brute-force guard, stored in Firestore so it holds across serverless instances:
// after MAX_FAILURES wrong codes the record stays locked for LOCK_MS.
const MAX_FAILURES = 5;
const LOCK_MS      = 15 * 60 * 1000;

const digest = (s: string) => createHash('sha256').update(s).digest();

/** Release the PIN-protected part of a medical card after a server-side PIN check. */
export async function POST(req: NextRequest) {
  // Cheap per-instance throttle before touching the database
  if (!rateLimit(`medical-unlock:${getClientIp(req)}`, 20, 60_000)) {
    return NextResponse.json({ error: 'Trop de tentatives. Réessayez dans une minute.' }, { status: 429 });
  }

  const body = await req.json().catch(() => null) as { username?: unknown; pin?: unknown } | null;
  const username = typeof body?.username === 'string' ? body.username.trim().toLowerCase() : '';
  const pin      = typeof body?.pin === 'string' ? body.pin.trim() : '';
  if (!username || !pin || pin.length > 32) {
    return NextResponse.json({ error: 'Code manquant.' }, { status: 400 });
  }

  const usernameSnap = await adminDb.collection('usernames').doc(username).get();
  if (!usernameSnap.exists) return NextResponse.json({ error: 'Carte introuvable.' }, { status: 404 });
  const { uid } = usernameSnap.data() as { uid: string };

  const moduleSnap = await adminDb.collection('modules').doc(`${uid}_medical`).get();
  const mod = moduleSnap.exists ? (moduleSnap.data() as ModuleDoc) : null;
  if (!mod || !mod.isActive) return NextResponse.json({ error: 'Carte introuvable.' }, { status: 404 });

  const config = (mod.config ?? {}) as Record<string, unknown>;
  if (!medicalHasPin(config)) {
    // No PIN set: nothing is protected
    return NextResponse.json({ fields: protectedMedicalFields(config) });
  }

  const attemptRef = adminDb.collection('medicalAttempts').doc(uid);
  const attempt    = (await attemptRef.get()).data() as { failures?: number; lockedUntil?: number } | undefined;
  const now        = Date.now();
  if (attempt?.lockedUntil && attempt.lockedUntil > now) {
    const minutes = Math.ceil((attempt.lockedUntil - now) / 60_000);
    return NextResponse.json({ error: `Trop de codes incorrects. Réessayez dans ${minutes} min.`, lockedMinutes: minutes }, { status: 429 });
  }

  const ok = timingSafeEqual(digest(pin), digest(String(config.pin)));
  if (ok) {
    if (attempt) await attemptRef.delete();
    return NextResponse.json({ fields: protectedMedicalFields(config) });
  }

  const failures = (attempt?.lockedUntil && attempt.lockedUntil <= now ? 0 : attempt?.failures ?? 0) + 1;
  const locked   = failures >= MAX_FAILURES;
  await attemptRef.set({ failures: locked ? 0 : failures, ...(locked ? { lockedUntil: now + LOCK_MS } : { lockedUntil: 0 }), updatedAt: new Date(now).toISOString() });
  return NextResponse.json(
    locked
      ? { error: 'Trop de codes incorrects. Réessayez dans 15 min.', lockedMinutes: 15 }
      : { error: 'Code incorrect.', attemptsLeft: MAX_FAILURES - failures },
    { status: locked ? 429 : 401 },
  );
}
