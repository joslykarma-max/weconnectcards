import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { PLANS, isFedaPayConfigured } from '@/lib/fedapay';
import { startPayment } from '@/lib/payments';
import { EDITIONS } from '@/lib/editions';
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

  if (!['standard', 'pro', 'prestige'].includes(cardType) || !EDITIONS.some((e) => e.key === edition)
      || (pvcColor !== 'white' && pvcColor !== 'black') || !['BJ', 'TG', 'BF'].includes(delivery?.country)) {
    return NextResponse.json({ error: 'Commande invalide.' }, { status: 400 });
  }
  if (!cardType || !edition || !delivery?.fullName || !delivery?.phone || !delivery?.address || !delivery?.city || !delivery?.country) {
    return NextResponse.json({ error: 'Champs manquants' }, { status: 400 });
  }

  // Pro/Prestige require at least a display name in customization
  if ((cardType === 'pro' || cardType === 'prestige') && !customization?.displayName?.trim()) {
    return NextResponse.json({ error: 'La personnalisation (nom à afficher) est requise pour les cartes Pro et Prestige.' }, { status: 400 });
  }

  const isMetal = metallic === true;
  const amount  = computeAmount(cardType, isMetal);
  const label  = cardType === 'prestige'
    ? 'Carte Prestige'
    : cardType === 'pro'
      ? `Carte Pro${isMetal ? ' métal' : ''}`
      : `Carte Standard${isMetal ? ' métal' : ''}`;

  if (!isFedaPayConfigured()) {
    console.error('[cards/order] FEDAPAY_SECRET_KEY manquante');
    return NextResponse.json({ error: 'Le paiement en ligne n\'est pas encore disponible. Contactez-nous pour commander.' }, { status: 503 });
  }

  let payment_url: string;
  try {
    payment_url = await startPayment({
      purchase: {
        kind: 'card',
        uid:  user.uid,
        order: {
          cardType,
          edition,
          metallic:      cardType === 'prestige' ? true : isMetal,
          pvcColor:      cardType === 'prestige' ? null : pvcColor,
          customization: customization ?? null,
          delivery,
        },
      },
      amount,
      currency:    'XOF',
      description: `${label} — We Connect`,
      customer:    { email: user.email ?? `${user.uid}@weconnect.cards`, name: user.name ?? delivery.fullName },
    });
  } catch (err) {
    console.error('[cards/order] FedaPay error:', err);
    return NextResponse.json({
      error: 'Le service de paiement est temporairement indisponible. Réessayez dans quelques instants.',
    }, { status: 503 });
  }

  return NextResponse.json({ paymentUrl: payment_url });
}
