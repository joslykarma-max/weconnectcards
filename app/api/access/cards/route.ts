import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/session';
import { adminDb } from '@/lib/firebase-admin';
import type { AccessCardDoc } from '@/lib/types';

export async function GET() {
  const user = await requireAuth();

  const snap = await adminDb.collection('accessCards')
    .where('profileId', '==', user.uid)
    .get();

  const cards: AccessCardDoc[] = snap.docs
    .map(d => d.data() as AccessCardDoc)
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt));

  return NextResponse.json({ cards });
}

export async function POST(req: NextRequest) {
  const user = await requireAuth();
  const body = await req.json() as Partial<AccessCardDoc>;

  const id   = Date.now().toString();
  const card: AccessCardDoc = {
    id,
    profileId:   user.uid,
    holderTitle: body.holderTitle || "Badge d'accès",
    holderName:  body.holderName  || '',
    holderRole:  body.holderRole  || '',
    holderPhoto: body.holderPhoto || '',
    isActive:    true,
    createdAt:   new Date().toISOString(),
  };

  await adminDb.collection('accessCards').doc(`${user.uid}_${id}`).set(card);
  return NextResponse.json({ card });
}

export async function PATCH(req: NextRequest) {
  const user = await requireAuth();
  const id   = req.nextUrl.searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'id requis' }, { status: 400 });

  const docRef = adminDb.collection('accessCards').doc(`${user.uid}_${id}`);
  const snap   = await docRef.get();
  if (!snap.exists || (snap.data() as AccessCardDoc).profileId !== user.uid) {
    return NextResponse.json({ error: 'Non trouvé' }, { status: 404 });
  }

  const body    = await req.json() as Partial<AccessCardDoc>;
  const allowed = ['holderTitle', 'holderName', 'holderRole', 'holderPhoto', 'isActive'] as const;
  const update: Partial<AccessCardDoc> = {};
  for (const k of allowed) {
    if (k in body) (update as Record<string, unknown>)[k] = (body as Record<string, unknown>)[k];
  }

  await docRef.update(update);
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest) {
  const user = await requireAuth();
  const id   = req.nextUrl.searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'id requis' }, { status: 400 });

  const docRef = adminDb.collection('accessCards').doc(`${user.uid}_${id}`);
  const snap   = await docRef.get();
  if (!snap.exists || (snap.data() as AccessCardDoc).profileId !== user.uid) {
    return NextResponse.json({ error: 'Non trouvé' }, { status: 404 });
  }

  await docRef.delete();
  return NextResponse.json({ ok: true });
}
