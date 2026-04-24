import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/session';
import { adminDb } from '@/lib/firebase-admin';
import type { CardDoc } from '@/lib/types';

export async function POST(req: NextRequest) {
  const user     = await requireAuth();
  const { nfcId } = await req.json() as { nfcId: string };

  if (!nfcId?.trim()) {
    return NextResponse.json({ error: 'Code NFC manquant.' }, { status: 400 });
  }

  const code = nfcId.trim().toUpperCase();

  // Check if this NFC ID is already linked to another user
  const existing = await adminDb.collection('cards').where('nfcId', '==', code).limit(1).get();

  if (!existing.empty) {
    const data = existing.docs[0].data() as CardDoc;
    if (data.userId !== user.uid) {
      return NextResponse.json({ error: 'Cette carte est déjà liée à un autre compte.' }, { status: 409 });
    }
    // Already linked to this user — just return success
    return NextResponse.json({ success: true, alreadyLinked: true });
  }

  // Check if user already has a card
  const userCards = await adminDb.collection('cards').where('userId', '==', user.uid).limit(1).get();
  if (!userCards.empty) {
    return NextResponse.json({ error: 'Vous avez déjà une carte activée sur ce compte.' }, { status: 409 });
  }

  await adminDb.collection('cards').add({
    userId:      user.uid,
    nfcId:       code,
    edition:     'midnight',
    status:      'active',
    orderedAt:   new Date().toISOString(),
    activatedAt: new Date().toISOString(),
  });

  return NextResponse.json({ success: true });
}
