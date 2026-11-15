import { NextRequest, NextResponse } from 'next/server';
import { verifyWebhookSignature } from '@/lib/fedapay';
import { confirmPayment, resultUrl } from '@/lib/payments';

export const dynamic = 'force-dynamic';

const APP_URL = (process.env.NEXT_PUBLIC_APP_URL ?? 'https://weconnect.cards').replace(/\/$/, '');

/**
 * Browser return from FedaPay: /api/webhooks/fedapay?id=<transaction>&status=…
 * Only the transaction id is used — what was bought comes from payments/{id}.
 */
export async function GET(req: NextRequest) {
  const id = Number(req.nextUrl.searchParams.get('id'));
  try {
    const { state, payment } = await confirmPayment(id);
    return NextResponse.redirect(resultUrl(payment, state));
  } catch (err) {
    console.error('[fedapay/callback]', err);
    return NextResponse.redirect(`${APP_URL}/dashboard?payment=error`);
  }
}

/**
 * Server-to-server webhook (FedaPay dashboard → Webhooks → this URL).
 * Delivers the purchase even when the customer closed the page after paying.
 */
export async function POST(req: NextRequest) {
  const secret = process.env.FEDAPAY_WEBHOOK_SECRET?.trim();
  if (!secret) {
    console.error('[fedapay/webhook] FEDAPAY_WEBHOOK_SECRET manquante — webhook ignoré');
    return NextResponse.json({ error: 'not configured' }, { status: 503 });
  }

  const raw = await req.text();
  if (!verifyWebhookSignature(raw, req.headers.get('x-fedapay-signature'), secret)) {
    return NextResponse.json({ error: 'invalid signature' }, { status: 401 });
  }

  let event: { name?: string; entity?: { id?: number | string }; object_id?: number | string };
  try { event = JSON.parse(raw); } catch { return NextResponse.json({ error: 'invalid body' }, { status: 400 }); }

  // Only transaction events matter; the transaction is re-read from FedaPay anyway
  if (!event.name?.startsWith('transaction.')) return NextResponse.json({ ok: true, ignored: event.name ?? null });
  const id = Number(event.entity?.id ?? event.object_id);

  try {
    const { state } = await confirmPayment(id);
    return NextResponse.json({ ok: true, state });
  } catch (err) {
    console.error('[fedapay/webhook]', err);
    return NextResponse.json({ error: 'retry' }, { status: 500 });   // FedaPay retries later
  }
}
