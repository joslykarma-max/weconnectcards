import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/session';
import { adminDb } from '@/lib/firebase-admin';
import type { OrderDoc, OrderItem } from '@/lib/types';

// POST — place an order (public, no auth needed)
export async function POST(req: NextRequest) {
  const body = await req.json() as {
    profileId:   string;
    tableNumber: string;
    items:       OrderItem[];
    total:       number;
    currency:    string;
    note?:       string;
  };

  const { profileId, tableNumber, items, total, currency, note } = body;

  if (!profileId || !tableNumber || !Array.isArray(items) || items.length === 0) {
    return NextResponse.json({ error: 'Données manquantes.' }, { status: 400 });
  }

  const docRef = adminDb.collection('orders').doc();
  const order: OrderDoc = {
    id:          docRef.id,
    profileId,
    tableNumber: String(tableNumber).replace(/[^a-zA-Z0-9 ]/g, '').slice(0, 20),
    items:       items.map(i => ({ id: i.id, name: i.name, qty: i.qty, price: i.price, emoji: i.emoji })),
    total:       Number(total) || 0,
    currency:    String(currency || 'FCFA'),
    note:        (note ?? '').slice(0, 300),
    status:      'pending',
    createdAt:   new Date().toISOString(),
  };

  await docRef.set(order);
  return NextResponse.json({ id: order.id });
}

// GET — list orders for authenticated restaurant owner
export async function GET() {
  const user = await requireAuth();

  const snap = await adminDb.collection('orders')
    .where('profileId', '==', user.uid)
    .get();

  const orders = snap.docs
    .map(d => d.data() as OrderDoc)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, 200);

  return NextResponse.json({ orders });
}
