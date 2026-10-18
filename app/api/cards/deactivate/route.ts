import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/session';
import { adminDb } from '@/lib/firebase-admin';
import { DEACTIVATION_REASONS } from '@/lib/cards';
import type { CardDoc, DeactivationReason } from '@/lib/types';

/**
 * "Changer ma carte" — step 1: the owner switches an active card off.
 * A tap on it then shows the lost-card page; its profile, links and modules
 * stay on the account until a replacement card takes them over.
 */
export async function POST(req: NextRequest) {
  const user = await requireAuth();
  const { cardId, reason, note } = await req.json() as { cardId?: string; reason?: string; note?: string };

  if (!cardId) return NextResponse.json({ error: 'Carte manquante.' }, { status: 400 });
  if (!reason || !(reason in DEACTIVATION_REASONS)) {
    return NextResponse.json({ error: 'Indique le motif du changement.' }, { status: 400 });
  }

  const cardRef  = adminDb.collection('cards').doc(cardId);
  const cardSnap = await cardRef.get();
  const card     = cardSnap.exists ? (cardSnap.data() as CardDoc) : null;
  if (!card || card.userId !== user.uid) {
    return NextResponse.json({ error: 'Carte introuvable.' }, { status: 404 });
  }
  if (card.status !== 'active') {
    return NextResponse.json({ error: 'Seule une carte active peut être désactivée.' }, { status: 400 });
  }

  const trimmedNote = typeof note === 'string' ? note.trim().slice(0, 300) : '';
  await cardRef.update({
    status:             'deactivated',
    deactivatedAt:      new Date().toISOString(),
    deactivationReason: reason as DeactivationReason,
    ...(trimmedNote ? { deactivationNote: trimmedNote } : {}),
  });

  return NextResponse.json({ success: true });
}
