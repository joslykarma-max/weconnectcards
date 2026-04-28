import { requireAuth } from '@/lib/session';
import { adminDb } from '@/lib/firebase-admin';
import MenuDashboard from './MenuDashboard';
import type { ModuleDoc, MenuCategory } from '@/lib/types';

export default async function MenuPage() {
  const user = await requireAuth();
  const snap = await adminDb.collection('modules').doc(`${user.uid}_menu`).get();
  const config = snap.exists ? ((snap.data() as ModuleDoc).config ?? {}) : {};

  return (
    <MenuDashboard
      initialInfo={{
        restaurantName: String(config.restaurantName ?? ''),
        address:        String(config.address        ?? ''),
        openHours:      String(config.openHours      ?? ''),
        whatsapp:       String(config.whatsapp       ?? ''),
        currency:       String(config.currency       ?? 'FCFA'),
        menuUrl:        String(config.menuUrl        ?? ''),
      }}
      initialCategories={(config.categories as MenuCategory[] | undefined) ?? []}
    />
  );
}
