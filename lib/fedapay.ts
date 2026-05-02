// FedaPay integration — paiements West Africa
// Docs: https://docs.fedapay.com

// Use FEDAPAY_ENV=production explicitly — do NOT rely on NODE_ENV
// (Vercel always sets NODE_ENV=production even on preview deployments)
const isLive = process.env.FEDAPAY_ENV === 'production';
const FEDAPAY_BASE = isLive
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
  // ── Aliases pour compat code existant ──
  essentiel: { amount: 10_000, currency: 'XOF', label: 'Carte Standard' },
  pro_sub:   { amount:  2_000, currency: 'XOF', label: 'Abonnement mensuel' },
} as const;
