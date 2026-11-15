import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/session';
import { adminDb } from '@/lib/firebase-admin';
import { PLANS, isFedaPayConfigured } from '@/lib/fedapay';
import { startPayment } from '@/lib/payments';
import type { UserDoc, ProfileDoc } from '@/lib/types';

export async function POST(req: NextRequest) {
  const user = await requireAuth();
  const { plan } = await req.json() as { plan: string };

  const validUpgradePlans = ['account_upgrade', 'monthly_sub'];
  if (!validUpgradePlans.includes(plan)) {
    return NextResponse.json({ error: 'Plan invalide.' }, { status: 400 });
  }

  const planInfo = PLANS[plan as keyof typeof PLANS];
  if (!planInfo) {
    return NextResponse.json({ error: 'Plan introuvable.' }, { status: 400 });
  }

  const [userSnap, profileSnap] = await Promise.all([
    adminDb.collection('users').doc(user.uid).get(),
    adminDb.collection('profiles').doc(user.uid).get(),
  ]);

  const userData    = userSnap.exists ? (userSnap.data() as UserDoc) : null;
  const profileData = profileSnap.exists ? (profileSnap.data() as ProfileDoc) : null;

  // Renewing the subscription is open to every plan; only the upgrade needs an Essentiel account
  if (plan === 'account_upgrade' && (userData?.plan === 'pro' || userData?.plan === 'equipe')) {
    return NextResponse.json({ error: 'Vous êtes déjà sur ce plan ou un plan supérieur.' }, { status: 400 });
  }

  if (!isFedaPayConfigured()) {
    console.error('[checkout] FEDAPAY_SECRET_KEY manquante');
    return NextResponse.json({ error: 'Le paiement en ligne n\'est pas encore disponible. Contactez-nous.' }, { status: 503 });
  }

  let payment_url: string;
  try {
    payment_url = await startPayment({
      purchase:    { kind: plan as 'account_upgrade' | 'monthly_sub', uid: user.uid },
      amount:      planInfo.amount,
      currency:    planInfo.currency,
      description: planInfo.label,
      customer: {
        email: user.email ?? userData?.email ?? `${user.uid}@weconnect.cards`,
        name:  profileData?.displayName ?? userData?.displayName ?? user.email ?? 'Client We Connect',
      },
    });
  } catch (err) {
    console.error('[checkout] FedaPay error:', err);
    return NextResponse.json({
      error: 'Le service de paiement est temporairement indisponible. Réessayez dans quelques instants.',
    }, { status: 503 });
  }

  return NextResponse.json({ payment_url });
}
