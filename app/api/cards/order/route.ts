import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { adminDb } from '@/lib/firebase-admin';
import { createTransaction, PLANS } from '@/lib/fedapay';
import type { DeliveryInfo, CardCustomization } from '@/lib/types';

type CardType = 'standard' | 'pro' | 'prestige';

// Compute price based on card type + metallic option
function computeAmount(cardType: CardType, metallic: boolean): number {
  if (cardType === 'prestige')                return PLANS.prestige.amount;            // toujours métal
  if (cardType === 'pro' && metallic)         return PLANS.pro_metal.amount;
  if (cardType === 'pro')                     return PLANS.pro.amount;
  if (cardType === 'standard' && metallic)    return PLANS.standard_metal.amount;
  return PLANS.standard.amount;
}

export async function POST(req: NextRequest) {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

  const body = await req.json() as {
    cardType:      CardType;
    edition:       string;
    metallic?:     boolean;
    pvcColor?:     'white' | 'black';
    customization?: CardCustomization;
    delivery:      DeliveryInfo;
  };

  const { cardType, edition, metallic = false, pvcColor = 'black', customization, delivery } = body;

  if (!cardType || !edition || !delivery?.fullName || !delivery?.phone || !delivery?.address || !delivery?.city || !delivery?.country) {
    return NextResponse.json({ error: 'Champs manquants' }, { status: 400 });
  }

  // Pro/Prestige require at least a display name in customization
  if ((cardType === 'pro' || cardType === 'prestige') && !customization?.displayName?.trim()) {
    return NextResponse.json({ error: 'La personnalisation (nom à afficher) est requise pour les cartes Pro et Prestige.' }, { status: 400 });
  }

  const amount = computeAmount(cardType, metallic);
  const label  = cardType === 'prestige'
    ? 'Carte Prestige'
    : cardType === 'pro'
      ? `Carte Pro${metallic ? ' métal' : ''}`
      : `Carte Standard${metallic ? ' métal' : ''}`;

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://weconnect.cards';

  await adminDb.collection('pendingOrders').doc(user.uid).set({
    uid:       user.uid,
    cardType,
    edition,
    metallic,
    pvcColor: cardType === 'prestige' ? null : pvcColor,
    customization: customization ?? null,
    delivery,
    amount,
    createdAt: new Date().toISOString(),
  });

  const callbackUrl = `${appUrl}/api/webhooks/fedapay?uid=${user.uid}&cardType=${cardType}&edition=${encodeURIComponent(edition)}&source=card`;

  const { payment_url } = await createTransaction({
    amount,
    currency:      'XOF',
    description:   `${label} — We Connect`,
    customerEmail: user.email ?? `${user.uid}@weconnect.cards`,
    customerName:  user.name ?? delivery.fullName,
    callbackUrl,
  });

  return NextResponse.json({ paymentUrl: payment_url });
}
