import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { adminDb } from '@/lib/firebase-admin';

export async function PATCH(req: NextRequest) {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

  const { cardId, module } = await req.json() as { cardId: string; module: string };
  if (!cardId || !module) return NextResponse.json({ error: 'Champs manquants' }, { status: 400 });

  const cardDoc = await adminDb.collection('cards').doc(cardId).get();
  if (!cardDoc.exists || cardDoc.data()?.userId !== user.uid) {
    return NextResponse.json({ error: 'Carte introuvable' }, { status: 404 });
  }

  await adminDb.collection('cards').doc(cardId).update({
    selectedModule: module,
    updatedAt:      new Date().toISOString(),
  });

  return NextResponse.json({ ok: true });
}
