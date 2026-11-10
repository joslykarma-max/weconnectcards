import { adminDb } from '@/lib/firebase-admin';
import { listStandaloneCards } from '@/lib/standalone-server';
import type { CardDoc } from '@/lib/types';
import StandaloneClient from './StandaloneClient';

export default async function AdminStandalonePage() {
  const [cards, stockSnap] = await Promise.all([
    listStandaloneCards(),
    adminDb.collection('cards').where('status', '==', 'in_stock').limit(300).get(),
  ]);

  // Unclaimed stock codes the admin can pick for a new card
  const stockCodes = stockSnap.docs
    .map((d) => d.data() as CardDoc)
    .filter((c) => !c.userId && !c.standalone && !!c.nfcId)
    .map((c) => c.nfcId!)
    .sort();

  return <StandaloneClient initialCards={cards} stockCodes={stockCodes} />;
}
