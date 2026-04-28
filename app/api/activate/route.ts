import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/session';
import { adminDb } from '@/lib/firebase-admin';
import type { CardDoc } from '@/lib/types';

export async function POST(req: NextRequest) {
  const user    = await requireAuth();
  const { nfcId } = await req.json() as { nfcId: string };

  if (!nfcId?.trim()) {
    return NextResponse.json({ error: 'Code NFC manquant.' }, { status: 400 });
  }

  const code = nfcId.trim().toUpperCase();

  // Check if this NFC ID is already taken by another user
  const existing = await adminDb.collection('cards').where('nfcId', '==', code).limit(1).get();
  if (!existing.empty) {
    const data = existing.docs[0].data() as CardDoc;
    if (data.userId !== user.uid) {
      return NextResponse.json({ error: 'Cette carte est déjà liée à un autre compte.' }, { status: 409 });
    }
    return NextResponse.json({ success: true, alreadyLinked: true });
  }

  const now = new Date().toISOString();

  // Try to link to an existing pending card that has no NFC ID yet
  const pendingCards = await adminDb
    .collection('cards')
    .where('userId', '==', user.uid)
    .where('status', '==', 'pending')
    .get();

  const unlinked = pendingCards.docs.find((d) => !((d.data() as CardDoc).nfcId));

  if (unlinked) {
    await unlinked.ref.update({ nfcId: code, status: 'active', activatedAt: now });
    return NextResponse.json({ success: true });
  }

  // No pending card — create a new active card
  await adminDb.collection('cards').add({
    userId:      user.uid,
    nfcId:       code,
    edition:     'midnight',
    status:      'active',
    orderedAt:   now,
    activatedAt: now,
  });

  return NextResponse.json({ success: true });
}
