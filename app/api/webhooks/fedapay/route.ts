import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { getTransaction } from '@/lib/fedapay';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const uid              = searchParams.get('uid');
  const plan             = searchParams.get('plan') as 'essentiel' | 'pro' | null;
  const transactionId    = searchParams.get('id');

  if (!uid || !plan) {
    return NextResponse.redirect(new URL('/dashboard/settings?payment=error', req.url));
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://weconnect.cards';

  try {
    if (transactionId) {
      const transaction = await getTransaction(Number(transactionId));
      if (transaction.status !== 'approved') {
        return NextResponse.redirect(`${appUrl}/dashboard/settings?payment=cancelled`);
      }
    }

    const now = new Date().toISOString();

    await adminDb.collection('users').doc(uid).set(
      { plan, updatedAt: now },
      { merge: true },
    );

    await adminDb.collection('payments').add({
      uid,
      plan,
      transactionId: transactionId ?? null,
      paidAt:        now,
    });

    // Create a new card order for each successful payment
    await adminDb.collection('cards').add({
      userId:    uid,
      edition:   'midnight',
      status:    'pending',
      orderedAt: now,
    });

    return NextResponse.redirect(`${appUrl}/dashboard/settings?payment=success`);
  } catch (err) {
    console.error('[webhook/fedapay]', err);
    return NextResponse.redirect(`${appUrl}/dashboard/settings?payment=error`);
  }
}
