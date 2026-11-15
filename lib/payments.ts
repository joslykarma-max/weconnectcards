// Every online payment goes through here.
//
// 1. startPayment() creates the FedaPay transaction and stores what is being bought in
//    payments/{transactionId} — server-side, before the customer pays.
// 2. confirmPayment() is called by the browser return (callback) AND by the FedaPay webhook.
//    It trusts only the stored record and FedaPay's own answer (status + amount), never
//    the URL, and applies the purchase once, inside a Firestore transaction.

import { adminDb } from './firebase-admin';
import { createTransaction, getTransaction } from './fedapay';
import type { CardCustomization, DeliveryInfo, PaymentDoc, UserDoc } from './types';

const APP_URL = (process.env.NEXT_PUBLIC_APP_URL ?? 'https://weconnect.cards').replace(/\/$/, '');
/** FedaPay sends the customer back here with ?id=<transaction>&status=… */
export const PAYMENT_CALLBACK_URL = `${APP_URL}/api/webhooks/fedapay`;

const paymentsCol = () => adminDb.collection('payments');

type Purchase =
  | { kind: 'card'; uid: string; order: {
      cardType: 'standard' | 'pro' | 'prestige'; edition: string; metallic: boolean;
      pvcColor: 'white' | 'black' | null; customization: CardCustomization | null; delivery: DeliveryInfo;
    } }
  | { kind: 'account_upgrade'; uid: string }
  | { kind: 'monthly_sub'; uid: string };

export async function startPayment(input: {
  purchase:    Purchase;
  amount:      number;
  currency:    string;
  description: string;
  customer:    { email: string; name: string };
}): Promise<string> {
  const { purchase } = input;
  const { id, paymentUrl } = await createTransaction({
    amount:        input.amount,
    currency:      input.currency,
    description:   input.description,
    customerEmail: input.customer.email,
    customerName:  input.customer.name,
    callbackUrl:   PAYMENT_CALLBACK_URL,
    metadata:      { kind: purchase.kind, uid: purchase.uid },
  });

  const doc: PaymentDoc = {
    kind:      purchase.kind,
    status:    'pending',
    amount:    input.amount,
    currency:  input.currency,
    createdAt: new Date().toISOString(),
    uid:       purchase.uid,
    ...(purchase.kind === 'card' ? { order: purchase.order } : {}),
  };
  await paymentsCol().doc(String(id)).set(doc);
  return paymentUrl;
}

export type ConfirmState = 'paid' | 'pending' | 'failed' | 'unknown';

const PLAN_RANK: Record<UserDoc['plan'], number> = { essentiel: 0, pro: 1, equipe: 2 };
const CARD_PLAN: Record<'standard' | 'pro' | 'prestige', UserDoc['plan']> = { standard: 'essentiel', pro: 'pro', prestige: 'pro' };
const CARD_FREE_MONTHS: Record<'standard' | 'pro' | 'prestige', number> = { standard: 6, pro: 6, prestige: 12 };

/** Adds months to whichever is later: now or the current end of subscription. */
function extendSubscription(current: string | undefined, months: number, now: Date): string {
  const from = current && new Date(current) > now ? new Date(current) : new Date(now);
  from.setMonth(from.getMonth() + months);
  return from.toISOString();
}

/** Never downgrades: buying a Standard card keeps an existing Pro / Équipe account. */
function bestPlan(current: UserDoc['plan'] | undefined, granted: UserDoc['plan']): UserDoc['plan'] {
  return current && PLAN_RANK[current] >= PLAN_RANK[granted] ? current : granted;
}

/**
 * Checks a transaction with FedaPay and, when it is approved for the expected amount,
 * delivers what was bought. Safe to call any number of times for the same transaction.
 */
export async function confirmPayment(transactionId: number): Promise<{ state: ConfirmState; payment: PaymentDoc | null }> {
  if (!Number.isSafeInteger(transactionId) || transactionId <= 0) return { state: 'unknown', payment: null };

  const ref  = paymentsCol().doc(String(transactionId));
  const snap = await ref.get();
  if (!snap.exists) return { state: 'unknown', payment: null };   // not created by us
  const payment = snap.data() as PaymentDoc;
  if (payment.status === 'paid') return { state: 'paid', payment };

  const transaction = await getTransaction(transactionId);
  if (transaction.status === 'pending') return { state: 'pending', payment };
  if (transaction.status !== 'approved' && transaction.status !== 'transferred') {
    if (payment.status !== 'failed') await ref.update({ status: 'failed', fedapayStatus: transaction.status, updatedAt: new Date().toISOString() });
    return { state: 'failed', payment };
  }
  if (Number(transaction.amount) !== payment.amount) {
    console.error('[payments] amount mismatch', { transactionId, expected: payment.amount, got: transaction.amount });
    await ref.update({ status: 'failed', fedapayStatus: 'amount_mismatch', updatedAt: new Date().toISOString() });
    return { state: 'failed', payment };
  }

  const result = await adminDb.runTransaction(async (t) => {
    const fresh = await t.get(ref);
    const p     = fresh.data() as PaymentDoc;
    if (p.status === 'paid') return p;                               // another call got there first

    const now    = new Date();
    const nowIso = now.toISOString();
    const done: Partial<PaymentDoc> = { status: 'paid', paidAt: nowIso, updatedAt: nowIso };

    // Reads first (Firestore transactions), then writes
    const userRef  = p.uid ? adminDb.collection('users').doc(p.uid) : null;
    const user     = userRef ? ((await t.get(userRef)).data() as UserDoc | undefined) : undefined;

    if (p.kind === 'card' && userRef && p.order) {
      const cardRef = adminDb.collection('cards').doc();
      t.set(userRef, {
        plan:              bestPlan(user?.plan, CARD_PLAN[p.order.cardType]),
        cardType:          p.order.cardType,
        subscriptionUntil: extendSubscription(user?.subscriptionUntil, CARD_FREE_MONTHS[p.order.cardType], now),
        updatedAt:         nowIso,
      }, { merge: true });
      t.set(cardRef, {
        userId:        p.uid,
        edition:       p.order.edition,
        cardType:      p.order.cardType,
        metallic:      p.order.metallic,
        pvcColor:      p.order.pvcColor,
        customization: p.order.customization,
        delivery:      p.order.delivery,
        status:        'pending',
        orderedAt:     nowIso,
        paymentId:     ref.id,
      });
      done.cardId = cardRef.id;
    }

    if (p.kind === 'account_upgrade' && userRef) {
      t.set(userRef, { plan: bestPlan(user?.plan, 'pro'), updatedAt: nowIso }, { merge: true });
    }

    if (p.kind === 'monthly_sub' && userRef) {
      t.set(userRef, { subscriptionUntil: extendSubscription(user?.subscriptionUntil, 1, now), updatedAt: nowIso }, { merge: true });
    }

    t.update(ref, done);
    return { ...p, ...done } as PaymentDoc;
  });

  return { state: 'paid', payment: result };
}

/** Where the customer lands after paying (or not). */
export function resultUrl(payment: PaymentDoc | null, state: ConfirmState): string {
  const outcome = state === 'paid' ? 'success' : state === 'pending' ? 'pending' : 'error';
  if (!payment) return `${APP_URL}/dashboard`;
  return `${APP_URL}${payment.kind === 'card' ? '/dashboard/card' : '/dashboard/settings'}?payment=${outcome}`;
}
