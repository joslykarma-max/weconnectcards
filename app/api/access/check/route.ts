import { NextRequest, NextResponse } from 'next/server';
import { createHash } from 'crypto';
import { adminDb } from '@/lib/firebase-admin';
import type { AccessZone, ModuleDoc } from '@/lib/types';
import '@/lib/firebase-admin';

const BLOCK_AFTER    = 5;
const BLOCK_DURATION = 10 * 60 * 1000; // 10 min

function sha256(s: string) {
  return createHash('sha256').update(s).digest('hex');
}

export async function POST(req: NextRequest) {
  const { profileId, zoneId, pin, device } = await req.json() as {
    profileId: string; zoneId: string; pin?: string; device?: string;
  };

  if (!profileId || !zoneId) {
    return NextResponse.json({ error: 'profileId et zoneId requis' }, { status: 400 });
  }

  // Load zone config
  const moduleSnap = await adminDb.collection('modules').doc(`${profileId}_access`).get();
  if (!moduleSnap.exists) return NextResponse.json({ error: 'Module non trouvé' }, { status: 404 });

  const config = (moduleSnap.data() as ModuleDoc).config ?? {};
  const zones  = (config.zones as AccessZone[]) ?? [];
  const zone   = zones.find(z => z.id === zoneId);
  if (!zone) return NextResponse.json({ error: 'Zone non trouvée' }, { status: 404 });

  const logEntry = {
    profileId, zoneId, zoneName: zone.name,
    device: device || 'unknown',
    timestamp: new Date().toISOString(),
  };

  // ── Libre ────────────────────────────────────────────────────────────────────
  if (zone.accessType === 'libre') {
    await adminDb.collection('accessLogs').add({ ...logEntry, status: 'granted' });
    return NextResponse.json({ granted: true, message: zone.afterAccessMessage || '' });
  }

  // ── PIN ──────────────────────────────────────────────────────────────────────
  if (zone.accessType === 'pin') {
    if (!pin) return NextResponse.json({ error: 'PIN requis' }, { status: 400 });

    const attemptRef  = adminDb.collection('accessAttempts').doc(`${profileId}_${zoneId}`);
    const attemptSnap = await attemptRef.get();
    const attempts    = attemptSnap.data() ?? { count: 0 };

    if (attempts.blockedUntil && new Date(attempts.blockedUntil) > new Date()) {
      const until = new Date(attempts.blockedUntil).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
      return NextResponse.json({
        granted: false, blocked: true, blockedUntil: attempts.blockedUntil,
        error: `Trop de tentatives. Réessayez à ${until}`,
      }, { status: 429 });
    }

    const correct = sha256(String(pin)) === zone.pinHash;

    if (correct) {
      await Promise.all([
        attemptRef.delete(),
        adminDb.collection('accessLogs').add({ ...logEntry, status: 'granted' }),
      ]);
      return NextResponse.json({ granted: true, message: zone.afterAccessMessage || '' });
    }

    const newCount     = (attempts.count ?? 0) + 1;
    const blockedUntil = newCount >= BLOCK_AFTER
      ? new Date(Date.now() + BLOCK_DURATION).toISOString()
      : null;

    await Promise.all([
      attemptRef.set({ count: newCount, lastAttemptAt: new Date().toISOString(), ...(blockedUntil ? { blockedUntil } : {}) }),
      adminDb.collection('accessLogs').add({ ...logEntry, status: 'denied' }),
    ]);

    return NextResponse.json({
      granted: false,
      attemptsLeft: Math.max(0, BLOCK_AFTER - newCount),
      ...(blockedUntil ? { blocked: true, blockedUntil } : {}),
    });
  }

  return NextResponse.json({ error: 'Type non géré' }, { status: 400 });
}
