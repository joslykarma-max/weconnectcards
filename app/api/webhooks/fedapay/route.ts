import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { getTransaction } from '@/lib/fedapay';

// Card type → account plan mapping (Pro/Prestige cards auto-grant Pro account)
const CARD_TO_ACCOUNT_PLAN: Record<string, 'essentiel' | 'pro'> = {
  standard: 'essentiel',
  pro:      'pro',
  prestige: 'pro',
};

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const uid           = searchParams.get('uid');
  const cardType      = searchParams.get('cardType');     // standard | pro | prestige (source=card)
  const plan          = searchParams.get('plan');         // pro | account_upgrade (source=settings)
  const edition       = searchParams.get('edition') ?? 'midnight';
  const transactionId = searchParams.get('id');
  const source        = searchParams.get('source') ?? (cardType ? 'card' : 'settings');

  const appUrl  = process.env.NEXT_PUBLIC_APP_URL ?? 'https://weconnect.cards';
  const errDest = source === 'card' ? '/dashboard/card' : '/dashboard/settings';

  if (!uid || !transactionId || (!cardType && !plan)) {
    return NextResponse.redirect(`${appUrl}${errDest}?payment=error`);
  }

  try {
    // 1. Verify payment with FedaPay
    const transaction = await getTransaction(Number(transactionId));
    if (transaction.status !== 'approved') {
      return NextResponse.redirect(`${appUrl}${errDest}?payment=cancelled`);
    }

    // 2. Anti-forgery: validate uid against transaction metadata when available
    type Meta = { uid?: string; cardType?: string; plan?: string };
    const meta = ((transaction as unknown as { metadata?: Meta }).metadata) ?? {};
    if (meta.uid && meta.uid !== uid) {
      console.error('[webhook/fedapay] uid mismatch', { paramUid: uid, metaUid: meta.uid });
      return NextResponse.redirect(`${appUrl}${errDest}?payment=error`);
    }

    // 3. Idempotency — skip if already processed
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

    // 4. Branch by source
    if (source === 'card' && cardType) {
      // ── Card order: read pendingOrder, create full card, bump user plan ──
      const pendingSnap = await adminDb.collection('pendingOrders').doc(uid).get();
      const pending     = pendingSnap.exists ? pendingSnap.data() : null;

      const accountPlan = CARD_TO_ACCOUNT_PLAN[cardType] ?? 'essentiel';
      const freeMonths  = cardType === 'prestige' ? 12 : 6;
      const subUntil    = new Date();
      subUntil.setMonth(subUntil.getMonth() + freeMonths);

      // Bump user account plan + cardType + subscription
      await adminDb.collection('users').doc(uid).set({
        plan:              accountPlan,
        cardType,
        subscriptionUntil: subUntil.toISOString(),
        updatedAt:         now,
      }, { merge: true });

      // Persist payment
      await adminDb.collection('payments').add({
        uid,
        cardType,
        amount:        pending?.amount ?? null,
        transactionId,
        source:        'card',
        paidAt:        now,
      });

      // Create the card with ALL fields from pendingOrder
      await adminDb.collection('cards').add({
        userId:        uid,
        edition:       pending?.edition ?? edition,
        cardType:      pending?.cardType ?? cardType,
        metallic:      pending?.metallic ?? false,
        pvcColor:      pending?.pvcColor ?? null,
        customization: pending?.customization ?? null,
        status:        'pending',
        orderedAt:     now,
        ...(pending?.delivery ? { delivery: pending.delivery } : {}),
      });

      if (pendingSnap.exists) {
        await adminDb.collection('pendingOrders').doc(uid).delete();
      }

      return NextResponse.redirect(`${appUrl}/dashboard/card?payment=success`);
    }

    // ── Account upgrade or monthly subscription (source=settings) ──
    if (plan === 'account_upgrade' || plan === 'pro') {
      // Account upgrade: Essentiel → Pro
      await adminDb.collection('users').doc(uid).set({
        plan:      'pro',
        updatedAt: now,
      }, { merge: true });

      await adminDb.collection('payments').add({
        uid,
        plan,
        transactionId,
        source:    'settings',
        paidAt:    now,
      });
    } else if (plan === 'monthly_sub') {
      // Subscription renewal: extend subscriptionUntil by 1 month
      const userSnap = await adminDb.collection('users').doc(uid).get();
      const cur      = (userSnap.data() as { subscriptionUntil?: string } | undefined)?.subscriptionUntil;
      const base     = cur && new Date(cur) > new Date() ? new Date(cur) : new Date();
      base.setMonth(base.getMonth() + 1);

      await adminDb.collection('users').doc(uid).set({
        subscriptionUntil: base.toISOString(),
        updatedAt:         now,
      }, { merge: true });

      await adminDb.collection('payments').add({
        uid,
        plan:          'monthly_sub',
        transactionId,
        source:        'subscription',
        paidAt:        now,
      });
    }

    return NextResponse.redirect(`${appUrl}/dashboard/settings?payment=success`);
  } catch (err) {
    console.error('[webhook/fedapay]', err);
    return NextResponse.redirect(`${appUrl}${errDest}?payment=error`);
  }
}
