import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/session';
import { adminDb } from '@/lib/firebase-admin';
import { createTransaction, PLANS } from '@/lib/fedapay';
import type { UserDoc, ProfileDoc } from '@/lib/types';

export async function POST(req: NextRequest) {
  const user = await requireAuth();
  const { plan } = await req.json() as { plan: 'essentiel' | 'pro' };

  if (!PLANS[plan]) {
    return NextResponse.json({ error: 'Plan invalide.' }, { status: 400 });
  }

  const [userSnap, profileSnap] = await Promise.all([
    adminDb.collection('users').doc(user.uid).get(),
    adminDb.collection('profiles').doc(user.uid).get(),
  ]);

  const userData    = userSnap.exists ? (userSnap.data() as UserDoc) : null;
  const profileData = profileSnap.exists ? (profileSnap.data() as ProfileDoc) : null;

  if (userData?.plan === 'pro' || userData?.plan === 'equipe') {
    return NextResponse.json({ error: 'Vous êtes déjà sur ce plan ou un plan supérieur.' }, { status: 400 });
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://weconnect.cards';

  const { payment_url } = await createTransaction({
    amount:        PLANS[plan].amount,
    currency:      PLANS[plan].currency,
    description:   PLANS[plan].label,
    customerEmail: user.email ?? userData?.email ?? '',
    customerName:  profileData?.displayName ?? userData?.displayName ?? user.email ?? '',
    callbackUrl:   `${appUrl}/api/webhooks/fedapay?uid=${user.uid}&plan=${plan}`,
    metadata:      { uid: user.uid, plan },
  });

  return NextResponse.json({ payment_url });
}
