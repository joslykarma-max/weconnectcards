import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { getTransaction } from '@/lib/fedapay';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const uid           = searchParams.get('uid');
  const plan          = searchParams.get('plan') as 'essentiel' | 'pro' | null;
  const edition       = searchParams.get('edition') ?? 'midnight';
  const transactionId = searchParams.get('id');
  const source        = searchParams.get('source');

  const appUrl  = process.env.NEXT_PUBLIC_APP_URL ?? 'https://weconnect.cards';
  const errDest = source === 'card' ? '/dashboard/card' : '/dashboard/settings';

  // Require all essential params
  if (!uid || !plan || !transactionId) {
    return NextResponse.redirect(`${appUrl}${errDest}?payment=error`);
  }

  try {
    // Verify payment status with FedaPay
    const transaction = await getTransaction(Number(transactionId));
    if (transaction.status !== 'approved') {
      return NextResponse.redirect(`${appUrl}${errDest}?payment=cancelled`);
    }

    // Idempotency — skip if this transactionId was already processed
    const existingPayment = await adminDb
      .collection('payments')
      .where('transactionId', '==', transactionId)
      .limit(1)
      .get();

    if (!existingPayment.empty) {
      const successDest = source === 'card' ? '/dashboard/card' : '/dashboard/settings';
      return NextResponse.redirect(`${appUrl}${successDest}?payment=success`);
    }

    const now = new Date().toISOString();

    // Fetch pending order for delivery info + edition override
    const pendingSnap = await adminDb.collection('pendingOrders').doc(uid).get();
    const pending     = pendingSnap.exists ? pendingSnap.data() : null;

    await adminDb.collection('users').doc(uid).set(
      { plan, updatedAt: now },
      { merge: true },
    );

    await adminDb.collection('payments').add({
      uid,
      plan,
      transactionId,
      paidAt: now,
    });

    await adminDb.collection('cards').add({
      userId:    uid,
      edition:   pending?.edition ?? edition,
      status:    'pending',
      orderedAt: now,
      ...(pending?.delivery ? { delivery: pending.delivery } : {}),
    });

    if (pendingSnap.exists) {
      await adminDb.collection('pendingOrders').doc(uid).delete();
    }

    const successDest = source === 'card' ? '/dashboard/card' : '/dashboard/settings';
    return NextResponse.redirect(`${appUrl}${successDest}?payment=success`);
  } catch (err) {
    console.error('[webhook/fedapay]', err);
    return NextResponse.redirect(`${appUrl}${errDest}?payment=error`);
  }
}
