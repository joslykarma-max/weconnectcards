// FedaPay integration — paiements West Africa
// Docs: https://docs.fedapay.com

const FEDAPAY_BASE = process.env.NODE_ENV === 'production'
  ? 'https://api.fedapay.com/v1'
  : 'https://sandbox-api.fedapay.com/v1';

const headers = {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${process.env.FEDAPAY_SECRET_KEY}`,
};

export interface FedaPayTransaction {
  id: number;
  reference: string;
  amount: number;
  status: string;
  currency: { iso: string };
  customer: { email: string; firstname: string; lastname: string };
}

export async function createTransaction(data: {
  amount: number;
  currency: string;
  description: string;
  customerEmail: string;
  customerName: string;
  callbackUrl: string;
  metadata?: Record<string, unknown>;
}) {
  const res = await fetch(`${FEDAPAY_BASE}/transactions`, {
    method:  'POST',
    headers,
    body: JSON.stringify({
      amount:      data.amount,
      currency:    { iso: data.currency },
      description: data.description,
      callback_url: data.callbackUrl,
      customer: {
        email:     data.customerEmail,
        firstname: data.customerName.split(' ')[0] ?? data.customerName,
        lastname:  data.customerName.split(' ').slice(1).join(' ') || '-',
      },
      metadata: data.metadata,
    }),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message ?? 'FedaPay transaction creation failed');
  }

  return res.json() as Promise<{ transaction: FedaPayTransaction; payment_url: string }>;
}

export async function getTransaction(id: number): Promise<FedaPayTransaction> {
  const res = await fetch(`${FEDAPAY_BASE}/transactions/${id}`, { headers });
  if (!res.ok) throw new Error('FedaPay fetch failed');
  const data = await res.json();
  return data.transaction;
}

export const PLANS = {
  essentiel: { amount: 29_000, currency: 'XOF', label: 'Plan Essentiel' },
  pro:       { amount: 59_000, currency: 'XOF', label: 'Plan Pro' },
  pro_sub:   { amount:  4_990, currency: 'XOF', label: 'Abonnement Pro mensuel' },
} as const;
