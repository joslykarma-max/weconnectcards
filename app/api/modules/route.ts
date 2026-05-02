import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/session';
import { adminDb } from '@/lib/firebase-admin';
import type { UserDoc } from '@/lib/types';

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

  // Enforce module cap when activating
  if (isActive) {
    const [userSnap, modulesSnap] = await Promise.all([
      adminDb.collection('users').doc(user.uid).get(),
      adminDb.collection('modules').where('profileId', '==', user.uid).where('isActive', '==', true).get(),
    ]);

    const plan  = (userSnap.data() as UserDoc | undefined)?.plan ?? 'essentiel';
    const limit = MODULE_LIMIT[plan] ?? 1;

    // Don't count the current module (toggling it on is the action)
    const currentActive = modulesSnap.docs.filter(d => d.id !== `${user.uid}_${type}`).length;

    if (currentActive >= limit) {
      return NextResponse.json({
        error: `Limite atteinte (${limit} module${limit > 1 ? 's' : ''} max pour le plan ${plan}). Désactivez un module ou passez au plan supérieur.`,
      }, { status: 403 });
    }
  }

  const docId = `${user.uid}_${type}`;
  await adminDb.collection('modules').doc(docId).set({
    profileId: user.uid,
    type,
    isActive,
    ...(config !== undefined && { config }),
    updatedAt: new Date().toISOString(),
  }, { merge: true });

  return NextResponse.json({ ok: true, type, isActive });
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
