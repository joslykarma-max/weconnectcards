import { adminDb } from '@/lib/firebase-admin';
import StockClient from './StockClient';
import type { CardDoc } from '@/lib/types';

export default async function AdminStockPage() {
  const all = await adminDb.collection('cards').limit(1000).get();
  const cards = all.docs.map((d) => ({ id: d.id, ...(d.data() as CardDoc) }));

  const stock = cards
    .filter((c) => c.status === 'in_stock')
    .sort((a, b) => (b.stockedAt ?? '').localeCompare(a.stockedAt ?? ''));

  const totals = {
    inStock: stock.length,
    pending: cards.filter((c) => c.status === 'pending').length,
    active:  cards.filter((c) => c.status === 'active').length,
    total:   cards.length,
  };

  return (
    <StockClient
      stock={stock.map((c) => ({
        id:        c.id,
        nfcId:     c.nfcId ?? '',
        edition:   c.edition,
        stockedAt: c.stockedAt ?? null,
      }))}
      totals={totals}
    />
  );
}
