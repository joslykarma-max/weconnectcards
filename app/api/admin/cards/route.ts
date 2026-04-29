import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin-auth';
import { adminDb } from '@/lib/firebase-admin';
import type { CardDoc, UserDoc } from '@/lib/types';

// GET — list all cards with user info
export async function GET() {
  await requireAdmin();

  const cardsSnap = await adminDb.collection('cards').get();
  const cards = cardsSnap.docs.map(d => ({ id: d.id, ...(d.data() as CardDoc) }));

  const userIds = [...new Set(cards.map(c => c.userId))];
  const userDocs = await Promise.all(userIds.map(uid => adminDb.collection('users').doc(uid).get()));
  const userMap: Record<string, UserDoc> = {};
  userDocs.forEach(d => { if (d.exists) userMap[d.id] = d.data() as UserDoc; });

  const enriched = cards.map(c => ({
    ...c,
    user: userMap[c.userId]
      ? { displayName: userMap[c.userId].displayName, email: userMap[c.userId].email, plan: userMap[c.userId].plan }
      : null,
  }));

  return NextResponse.json(enriched);
}

// POST — create a new card for a user (manual, by admin)
export async function POST(req: NextRequest) {
  await requireAdmin();

  const body = await req.json() as { userId?: string; nfcId?: string; edition?: string; status?: string };
  const { userId, nfcId, edition = 'midnight', status = 'shipped' } = body;

  if (!userId?.trim()) return NextResponse.json({ error: 'userId requis.' }, { status: 400 });
  if (!nfcId?.trim())  return NextResponse.json({ error: 'Code NFC requis.' }, { status: 400 });

  const code = nfcId.trim().toUpperCase();

  // Check NFC ID uniqueness
  const existing = await adminDb.collection('cards').where('nfcId', '==', code).limit(1).get();
  if (!existing.empty) return NextResponse.json({ error: 'Ce code NFC est déjà utilisé.' }, { status: 409 });

  const now = new Date().toISOString();
  const ref = await adminDb.collection('cards').add({
    userId, nfcId: code, edition, status, orderedAt: now,
    ...(status === 'active' ? { activatedAt: now } : {}),
  });

  const userSnap = await adminDb.collection('users').doc(userId).get();
  const user = userSnap.exists
    ? { displayName: (userSnap.data() as UserDoc).displayName, email: (userSnap.data() as UserDoc).email, plan: (userSnap.data() as UserDoc).plan }
    : null;

  return NextResponse.json({
    card: { id: ref.id, userId, nfcId: code, edition, status, orderedAt: now, activatedAt: null, user },
  });
}

// PATCH — update a card (assign NFC ID, change status/edition)
export async function PATCH(req: NextRequest) {
  await requireAdmin();

  const body = await req.json() as { cardId?: string; nfcId?: string; status?: string; edition?: string };
  const { cardId, nfcId, status, edition } = body;

  if (!cardId?.trim()) return NextResponse.json({ error: 'cardId requis.' }, { status: 400 });

  const update: Record<string, string> = {};
  if (nfcId)   update.nfcId   = nfcId.trim().toUpperCase();
  if (status)  update.status  = status;
  if (edition) update.edition = edition;

  if (Object.keys(update).length === 0) {
    return NextResponse.json({ error: 'Aucun champ à mettre à jour.' }, { status: 400 });
  }

  // If assigning NFC ID, check uniqueness
  if (update.nfcId) {
    const existing = await adminDb.collection('cards')
      .where('nfcId', '==', update.nfcId)
      .limit(1)
      .get();
    if (!existing.empty && existing.docs[0].id !== cardId) {
      return NextResponse.json({ error: 'Ce code NFC est déjà utilisé par une autre carte.' }, { status: 409 });
    }
  }

  await adminDb.collection('cards').doc(cardId).update(update);
  return NextResponse.json({ success: true });
}
