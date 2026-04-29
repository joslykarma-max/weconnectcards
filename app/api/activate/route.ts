import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/session';
import { adminDb } from '@/lib/firebase-admin';
import type { CardDoc } from '@/lib/types';

export async function POST(req: NextRequest) {
  const user      = await requireAuth();
  const { nfcId } = await req.json() as { nfcId: string };

  if (!nfcId?.trim()) {
    return NextResponse.json({ error: 'Code NFC manquant.' }, { status: 400 });
  }

  const code = nfcId.trim().toUpperCase();
  const now  = new Date().toISOString();

  // 1. Check if this NFC code already exists in the system
  const codeSnap = await adminDb.collection('cards').where('nfcId', '==', code).limit(1).get();

  if (!codeSnap.empty) {
    const cardDoc = codeSnap.docs[0];
    const data    = cardDoc.data() as CardDoc;

    if (data.userId !== user.uid) {
      return NextResponse.json({ error: 'Cette carte est déjà liée à un autre compte.' }, { status: 409 });
    }
    if (data.status === 'active') {
      return NextResponse.json({ success: true, alreadyLinked: true });
    }
    // Code belongs to user but shipped → activate
    await cardDoc.ref.update({ status: 'active', activatedAt: now });
    return NextResponse.json({ success: true });
  }

  // 2. Code not in system — look for a pending card without a code yet
  const pendingSnap = await adminDb
    .collection('cards')
    .where('userId', '==', user.uid)
    .where('status', '==', 'pending')
    .get();

  const unlinked = pendingSnap.docs.find((d) => !(d.data() as CardDoc).nfcId);

  if (unlinked) {
    await unlinked.ref.update({ nfcId: code, status: 'active', activatedAt: now });
    return NextResponse.json({ success: true });
  }

  // 3. No match — refuse without creating a card
  return NextResponse.json({
    error: 'Code NFC invalide. Vérifie le code imprimé dans l\'emballage de ta carte.',
  }, { status: 404 });
}
