// FedaPay integration — paiements West Africa
// Docs: https://docs.fedapay.com

import { createHmac, timingSafeEqual } from 'node:crypto';

// Use FEDAPAY_ENV=production explicitly — do NOT rely on NODE_ENV
// (Vercel always sets NODE_ENV=production even on preview deployments)
const isLive = process.env.FEDAPAY_ENV === 'production';
const FEDAPAY_BASE = isLive
  ? 'https://api.fedapay.com/v1'
  : 'https://sandbox-api.fedapay.com/v1';

function authHeaders() {
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${process.env.FEDAPAY_SECRET_KEY}`,
  };
}

/** True when the secret key is set (payments cannot work without it). */
export function isFedaPayConfigured(): boolean {
  return !!process.env.FEDAPAY_SECRET_KEY?.trim();
}

export interface FedaPayTransaction {
  id:               number;
  reference?:       string;
  amount:           number;
  status:           string; // pending | approved | declined | canceled | refunded | transferred…
  custom_metadata?: Record<string, unknown> | null;
}

// The API wraps resources (« v1/transaction ») — accept the wrapped and the flat shape
function unwrap<T>(data: unknown, key: string): T {
  const obj = (data ?? {}) as Record<string, unknown>;
  return (obj[`v1/${key}`] ?? obj[key] ?? obj) as T;
}

async function call<T>(path: string, init?: RequestInit): Promise<T> {
  const res  = await fetch(`${FEDAPAY_BASE}${path}`, { ...init, headers: authHeaders(), cache: 'no-store' });
  const data = await res.json().catch(() => null) as { message?: string } | null;
  if (!res.ok) throw new Error(`FedaPay ${path} ${res.status}: ${data?.message ?? 'erreur'}`);
  return data as T;
}

/**
 * Creates a transaction and its payment link.
 * `metadata` is stored by FedaPay as `custom_metadata` and read back on confirmation.
 */
export async function createTransaction(data: {
  amount:        number;
  currency:      string;
  description:   string;
  customerEmail: string;
  customerName:  string;
  callbackUrl:   string;
  metadata?:     Record<string, string | number | boolean | null>;
}): Promise<{ id: number; paymentUrl: string }> {
  if (!isFedaPayConfigured()) throw new Error('FEDAPAY_SECRET_KEY manquante');

  const [firstname, ...rest] = data.customerName.trim().split(/\s+/);
  const created = await call<unknown>('/transactions', {
    method: 'POST',
    body: JSON.stringify({
      amount:          data.amount,
      currency:        { iso: data.currency },
      description:     data.description,
      callback_url:    data.callbackUrl,
      customer: {
        email:     data.customerEmail,
        firstname: firstname || 'Client',
        lastname:  rest.join(' ') || '-',
      },
      custom_metadata: data.metadata ?? {},
    }),
  });
  const transaction = unwrap<FedaPayTransaction>(created, 'transaction');
  if (!transaction?.id) throw new Error('FedaPay: transaction sans identifiant');

  // The payment link comes from a separate token call
  const tokenRes = unwrap<{ token?: string; url?: string }>(
    await call<unknown>(`/transactions/${transaction.id}/token`, { method: 'POST' }),
    'token',
  );
  if (!tokenRes?.url) throw new Error('FedaPay: lien de paiement absent');

  return { id: transaction.id, paymentUrl: tokenRes.url };
}

export async function getTransaction(id: number): Promise<FedaPayTransaction> {
  if (!Number.isSafeInteger(id) || id <= 0) throw new Error('FedaPay: identifiant invalide');
  return unwrap<FedaPayTransaction>(await call<unknown>(`/transactions/${id}`), 'transaction');
}

/**
 * Checks the X-FEDAPAY-SIGNATURE header of a webhook (« t=<unix>,s=<hex> »):
 * HMAC-SHA256 of « <t>.<raw body> » with the endpoint secret, at most `toleranceSec` old.
 */
export function verifyWebhookSignature(rawBody: string, header: string | null, secret: string, toleranceSec = 300): boolean {
  if (!header || !secret) return false;
  let timestamp = 0;
  const signatures: string[] = [];
  for (const part of header.split(',')) {
    const [k, v] = part.split('=', 2).map((s) => s?.trim());
    if (k === 't') timestamp = Number.parseInt(v ?? '', 10);
    else if (k === 's' && v) signatures.push(v);
  }
  if (!timestamp || signatures.length === 0) return false;
  if (Math.abs(Date.now() / 1000 - timestamp) > toleranceSec) return false;

  const expected = Buffer.from(createHmac('sha256', secret).update(`${timestamp}.${rawBody}`).digest('hex'));
  return signatures.some((s) => {
    const got = Buffer.from(s);
    return got.length === expected.length && timingSafeEqual(got, expected);
  });
}

// Tarifs officiels We Connect
export const PLANS = {
  // Cartes physiques (achat unique, abonnement inclus)
  standard:  { amount: 10_000, currency: 'XOF', label: 'Carte Standard' },
  pro:       { amount: 15_000, currency: 'XOF', label: 'Carte Pro' },
  prestige:  { amount: 25_000, currency: 'XOF', label: 'Carte Prestige' },
  // Surcoûts version métallique (en pourcentage du prix de base)
  standard_metal: { amount: 12_000, currency: 'XOF', label: 'Carte Standard métal (+20%)' },
  pro_metal:      { amount: 17_100, currency: 'XOF', label: 'Carte Pro métal (+14%)' },
  // Upgrade compte Essentiel → Pro (sans changer de carte)
  account_upgrade: { amount: 5_500, currency: 'XOF', label: 'Passage compte Pro' },
  // Réabonnement mensuel après la période gratuite
  monthly_sub: { amount: 2_000, currency: 'XOF', label: 'Abonnement mensuel' },
} as const;
