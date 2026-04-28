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

  const body    = await req.json() as Partial<AccessCardDoc> & { unlink?: boolean };
  const allowed = ['holderTitle', 'holderName', 'holderRole', 'holderPhoto', 'isActive'] as const;
  const update: Partial<AccessCardDoc> = {};
  for (const k of allowed) {
    if (k in body) (update as Record<string, unknown>)[k] = (body as Record<string, unknown>)[k];
  }

  // ── NFC card assignment ────────────────────────────────────────────────────
  if (body.nfcId !== undefined || body.unlink) {
    const prev = (snap.data() as AccessCardDoc).nfcId;

    if (body.unlink) {
      // Clear nfcId from accessCard
      (update as Record<string, unknown>).nfcId = null;
      // Clear accessCardId from the physical card doc
      if (prev) {
        const physSnap = await adminDb.collection('cards')
          .where('nfcId', '==', prev)
          .where('userId', '==', user.uid)
          .limit(1).get();
        if (!physSnap.empty) {
          await physSnap.docs[0].ref.update({ accessCardId: null });
        }
      }
    } else if (body.nfcId) {
      const nfcId = String(body.nfcId).trim().toUpperCase();

      // Verify the physical card belongs to this user and is active
      const physSnap = await adminDb.collection('cards')
        .where('nfcId', '==', nfcId)
        .where('userId', '==', user.uid)
        .limit(1).get();

      if (physSnap.empty) {
        return NextResponse.json({ error: 'Carte NFC introuvable ou non activée sur ce compte.' }, { status: 404 });
      }

      // Unlink previous card if it was assigned to another porteur
      if (prev && prev !== nfcId) {
        const oldPhysSnap = await adminDb.collection('cards')
          .where('nfcId', '==', prev)
          .where('userId', '==', user.uid)
          .limit(1).get();
        if (!oldPhysSnap.empty) {
          await oldPhysSnap.docs[0].ref.update({ accessCardId: null });
        }
      }

      // Link physical card → this porteur
      await physSnap.docs[0].ref.update({ accessCardId: id });
      (update as Record<string, unknown>).nfcId = nfcId;
    }
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
