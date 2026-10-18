import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/session';
import { adminDb } from '@/lib/firebase-admin';
import { PROFILE_MODULE } from '@/lib/modules';
import type { ModuleDoc, UserDoc } from '@/lib/types';

// Max active modules per account plan / card type
const MODULE_LIMIT: Record<string, number> = {
  essentiel: 1,
  pro:       3,
  equipe:    99,
};

export async function POST(req: NextRequest) {
  const user = await requireAuth();
  const { type, isActive, config } = await req.json() as {
    type:     string;
    isActive: boolean;
    config?:  Record<string, unknown>;
  };

  const [userSnap, modulesSnap] = await Promise.all([
    adminDb.collection('users').doc(user.uid).get(),
    adminDb.collection('modules').where('profileId', '==', user.uid).where('isActive', '==', true).get(),
  ]);

  const plan  = (userSnap.data() as UserDoc | undefined)?.plan ?? 'essentiel';
  const limit = MODULE_LIMIT[plan] ?? 1;

  // Active modules besides the toggled one — the digital profile never counts toward the cap
  const otherActive = modulesSnap.docs
    .map((d) => (d.data() as ModuleDoc).type)
    .filter((t) => t !== type && t !== PROFILE_MODULE);

  // Enforce module cap when activating
  if (isActive && type !== PROFILE_MODULE && otherActive.length >= limit) {
    return NextResponse.json({
      error: `Limite atteinte (${limit} module${limit > 1 ? 's' : ''} max pour le plan ${plan}). Désactivez un module ou passez au plan supérieur.`,
    }, { status: 403 });
  }

  const now   = new Date().toISOString();
  const batch = adminDb.batch();
  // Other modules switched as a side effect, returned so the client can mirror them
  const changes: Record<string, boolean> = {};
  const setActive = (t: string, on: boolean) => {
    batch.set(adminDb.collection('modules').doc(`${user.uid}_${t}`), {
      profileId: user.uid, type: t, isActive: on, updatedAt: now,
    }, { merge: true });
    changes[t] = on;
  };

  // Single-module plan: the digital profile shares the one slot with the other modules.
  // Activating one switches the other off; the profile comes back once the slot is empty.
  if (limit === 1) {
    if (type === PROFILE_MODULE) {
      if (isActive) otherActive.forEach((t) => setActive(t, false));
    } else if (isActive) {
      setActive(PROFILE_MODULE, false);
    } else if (otherActive.length === 0) {
      setActive(PROFILE_MODULE, true);
    }
  }

  const docId = `${user.uid}_${type}`;
  batch.set(adminDb.collection('modules').doc(docId), {
    profileId: user.uid,
    type,
    isActive,
    ...(config !== undefined && { config }),
    updatedAt: now,
  }, { merge: true });
  await batch.commit();

  return NextResponse.json({ ok: true, type, isActive, changes });
}

export async function PATCH(req: NextRequest) {
  const user = await requireAuth();
  const { type, config } = await req.json() as {
    type:   string;
    config: Record<string, unknown>;
  };

  const docId = `${user.uid}_${type}`;
  await adminDb.collection('modules').doc(docId).set({
    profileId: user.uid,
    type,
    config,
    updatedAt: new Date().toISOString(),
  }, { merge: true });

  return NextResponse.json({ ok: true });
}
