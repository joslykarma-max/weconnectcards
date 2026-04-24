import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/session';
import { adminDb } from '@/lib/firebase-admin';

export async function POST(req: NextRequest) {
  const user = await requireAuth();
  const { type, isActive, config } = await req.json() as {
    type:     string;
    isActive: boolean;
    config?:  Record<string, unknown>;
  };

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
