import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { adminDb } from '@/lib/firebase-admin';
import { createTransaction, PLANS } from '@/lib/fedapay';
import type { DeliveryInfo } from '@/lib/types';

export async function POST(req: NextRequest) {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

  const body = await req.json() as {
    plan:     'essentiel' | 'pro';
    edition:  string;
    delivery: DeliveryInfo;
  };

  const { plan, edition, delivery } = body;

  if (!plan || !edition || !delivery?.fullName || !delivery?.phone || !delivery?.address || !delivery?.city || !delivery?.country) {
    return NextResponse.json({ error: 'Champs manquants' }, { status: 400 });
  }

  const planInfo = PLANS[plan as keyof typeof PLANS];
  if (!planInfo) return NextResponse.json({ error: 'Plan invalide' }, { status: 400 });

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://weconnect.cards';

  await adminDb.collection('pendingOrders').doc(user.uid).set({
    uid:       user.uid,
    plan,
    edition,
    delivery,
    createdAt: new Date().toISOString(),
  });

  const callbackUrl = `${appUrl}/api/webhooks/fedapay?uid=${user.uid}&plan=${plan}&edition=${encodeURIComponent(edition)}&source=card`;

  const { payment_url } = await createTransaction({
    amount:        planInfo.amount,
    currency:      planInfo.currency,
    description:   `${planInfo.label} — We Connect Cards`,
    customerEmail: user.email ?? `${user.uid}@weconnect.cards`,
    customerName:  user.name ?? delivery.fullName,
    callbackUrl,
  });

  return NextResponse.json({ paymentUrl: payment_url });
}
