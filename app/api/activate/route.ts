import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/session';
import { adminDb } from '@/lib/firebase-admin';
import type { CardDoc } from '@/lib/types';

export async function POST(req: NextRequest) {
  const user = await requireAuth();
  const { nfcId, cardId } = await req.json() as { nfcId: string; cardId?: string };

  if (!nfcId?.trim()) {
    return NextResponse.json({ error: 'Code NFC manquant.' }, { status: 400 });
  }

  const code = nfcId.trim().toUpperCase();
  const now  = new Date().toISOString();

  // 1. Check if this NFC code already exists in the system
  const codeSnap = await adminDb.collection('cards').where('nfcId', '==', code).limit(1).get();
  const codeDoc  = codeSnap.empty ? null : codeSnap.docs[0];
  const codeData = codeDoc ? (codeDoc.data() as CardDoc) : null;

  if (codeData?.userId && codeData.userId !== user.uid) {
    return NextResponse.json({ error: 'Cette carte est déjà liée à un autre compte.' }, { status: 409 });
  }

  // ── Activation of a specific card chosen by the user ────────────────────────
  if (cardId) {
    const targetRef  = adminDb.collection('cards').doc(cardId);
    const targetSnap = await targetRef.get();
    const target     = targetSnap.exists ? (targetSnap.data() as CardDoc) : null;

    if (!target || target.userId !== user.uid) {
      return NextResponse.json({ error: 'Carte introuvable.' }, { status: 404 });
    }
    if (target.status === 'active') {
      return NextResponse.json({ success: true, alreadyLinked: true });
    }

    if (codeDoc && codeDoc.id !== cardId) {
      // Code belongs to another of the user's cards
      if (codeData?.userId === user.uid) {
        return NextResponse.json({ error: 'Ce code est déjà lié à une autre de tes cartes.' }, { status: 409 });
      }
      // Unclaimed stock card — move its code onto the ordered card, drop the stock entry
      if (codeData?.status === 'in_stock' && !codeData.userId) {
        if (target.nfcId && target.nfcId !== code) {
          return NextResponse.json({ error: 'Ce code ne correspond pas à cette carte.' }, { status: 400 });
        }
        const batch = adminDb.batch();
        batch.update(targetRef, { nfcId: code, status: 'active', activatedAt: now });
        batch.delete(codeDoc.ref);
        await batch.commit();
        return NextResponse.json({ success: true });
      }
    }

    if (!codeDoc && target.nfcId && target.nfcId !== code) {
      return NextResponse.json({ error: 'Ce code ne correspond pas à cette carte.' }, { status: 400 });
    }

    await targetRef.update({ nfcId: code, status: 'active', activatedAt: now });
    return NextResponse.json({ success: true });
  }

  // ── Activation by code only ─────────────────────────────────────────────────
  if (codeDoc && codeData) {
    // In-stock card (no owner yet) — claim it
    if (codeData.status === 'in_stock' && !codeData.userId) {
      await codeDoc.ref.update({
        userId:      user.uid,
        status:      'active',
        activatedAt: now,
      });
      return NextResponse.json({ success: true });
    }
    if (codeData.status === 'active') {
      return NextResponse.json({ success: true, alreadyLinked: true });
    }
    // Code belongs to user but shipped → activate
    await codeDoc.ref.update({ status: 'active', activatedAt: now });
    return NextResponse.json({ success: true });
  }

  // 2. Code not in system — look for an ordered card without a code yet (oldest first)
  const pendingSnap = await adminDb
    .collection('cards')
    .where('userId', '==', user.uid)
    .where('status', 'in', ['pending', 'shipped'])
    .get();

  const unlinked = pendingSnap.docs
    .filter((d) => !(d.data() as CardDoc).nfcId)
    .sort((a, b) => ((a.data() as CardDoc).orderedAt ?? '').localeCompare((b.data() as CardDoc).orderedAt ?? ''))[0];

  if (unlinked) {
    await unlinked.ref.update({ nfcId: code, status: 'active', activatedAt: now });
    return NextResponse.json({ success: true });
  }

  // 3. No match — refuse without creating a card
  return NextResponse.json({
    error: 'Code NFC invalide. Vérifie le code imprimé dans l\'emballage de ta carte.',
  }, { status: 404 });
}
