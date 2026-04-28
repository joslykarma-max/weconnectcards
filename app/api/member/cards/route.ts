import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/session';
import { adminDb } from '@/lib/firebase-admin';
import type { MemberCardDoc } from '@/lib/types';

export async function GET() {
  const user = await requireAuth();

  const snap = await adminDb.collection('memberCards')
    .where('profileId', '==', user.uid)
    .get();

  const cards: MemberCardDoc[] = snap.docs
    .map(d => d.data() as MemberCardDoc)
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt));

  return NextResponse.json({ cards });
}

export async function POST(req: NextRequest) {
  const user = await requireAuth();
  const body = await req.json() as Partial<MemberCardDoc>;

  const id   = Date.now().toString();
  const card: MemberCardDoc = {
    id,
    profileId:  user.uid,
    memberName: body.memberName  || '',
    memberId:   body.memberId    || '',
    level:      body.level       || 'silver',
    expiryDate: body.expiryDate  || '',
    photoUrl:   body.photoUrl    || '',
    isActive:   true,
    createdAt:  new Date().toISOString(),
  };

  await adminDb.collection('memberCards').doc(`${user.uid}_${id}`).set(card);
  return NextResponse.json({ card });
}

export async function PATCH(req: NextRequest) {
  const user = await requireAuth();
  const id   = req.nextUrl.searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'id requis' }, { status: 400 });

  const docRef = adminDb.collection('memberCards').doc(`${user.uid}_${id}`);
  const snap   = await docRef.get();
  if (!snap.exists || (snap.data() as MemberCardDoc).profileId !== user.uid) {
    return NextResponse.json({ error: 'Non trouvé' }, { status: 404 });
  }

  const body    = await req.json() as Partial<MemberCardDoc> & { unlink?: boolean };
  const allowed = ['memberName', 'memberId', 'level', 'expiryDate', 'photoUrl', 'isActive'] as const;
  const update: Partial<MemberCardDoc> = {};
  for (const k of allowed) {
    if (k in body) (update as Record<string, unknown>)[k] = (body as Record<string, unknown>)[k];
  }

  // ── NFC card assignment ────────────────────────────────────────────────────
  if (body.nfcId !== undefined || body.unlink) {
    const prev = (snap.data() as MemberCardDoc).nfcId;

    if (body.unlink) {
      (update as Record<string, unknown>).nfcId = null;
      if (prev) {
        const physSnap = await adminDb.collection('cards')
          .where('nfcId', '==', prev)
          .where('userId', '==', user.uid)
          .limit(1).get();
        if (!physSnap.empty) await physSnap.docs[0].ref.update({ memberCardId: null });
      }
    } else if (body.nfcId) {
      const nfcId = String(body.nfcId).trim().toUpperCase();

      const physSnap = await adminDb.collection('cards')
        .where('nfcId', '==', nfcId)
        .where('userId', '==', user.uid)
        .limit(1).get();

      if (physSnap.empty) {
        return NextResponse.json({ error: 'Carte NFC introuvable ou non activée sur ce compte.' }, { status: 404 });
      }

      // Unlink previous card
      if (prev && prev !== nfcId) {
        const oldPhysSnap = await adminDb.collection('cards')
          .where('nfcId', '==', prev)
          .where('userId', '==', user.uid)
          .limit(1).get();
        if (!oldPhysSnap.empty) await oldPhysSnap.docs[0].ref.update({ memberCardId: null });
      }

      await physSnap.docs[0].ref.update({ memberCardId: id });
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

  const docRef = adminDb.collection('memberCards').doc(`${user.uid}_${id}`);
  const snap   = await docRef.get();
  if (!snap.exists || (snap.data() as MemberCardDoc).profileId !== user.uid) {
    return NextResponse.json({ error: 'Non trouvé' }, { status: 404 });
  }

  // Unlink NFC card if assigned
  const data = snap.data() as MemberCardDoc;
  if (data.nfcId) {
    const physSnap = await adminDb.collection('cards')
      .where('nfcId', '==', data.nfcId)
      .where('userId', '==', user.uid)
      .limit(1).get();
    if (!physSnap.empty) await physSnap.docs[0].ref.update({ memberCardId: null });
  }

  await docRef.delete();
  return NextResponse.json({ ok: true });
}
