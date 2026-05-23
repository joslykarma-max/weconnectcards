import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/session';
import { adminDb } from '@/lib/firebase-admin';
import type { OrderDoc } from '@/lib/types';

type Status = 'pending' | 'preparing' | 'served';
const VALID: Status[] = ['pending', 'preparing', 'served'];

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await requireAuth();
  const { id } = await params;
  const { status } = await req.json() as { status: Status };

  if (!VALID.includes(status)) {
    return NextResponse.json({ error: 'Statut invalide.' }, { status: 400 });
  }

  const docRef = adminDb.collection('orders').doc(id);
  const snap   = await docRef.get();

  if (!snap.exists) return NextResponse.json({ error: 'Commande introuvable.' }, { status: 404 });

  const order = snap.data() as OrderDoc;
  if (order.profileId !== user.uid) {
    return NextResponse.json({ error: 'Non autorisé.' }, { status: 403 });
  }

  await docRef.update({ status });
  return NextResponse.json({ success: true });
}
