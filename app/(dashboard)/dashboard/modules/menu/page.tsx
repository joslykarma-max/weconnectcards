import { requireAuth } from '@/lib/session';
import { adminDb } from '@/lib/firebase-admin';
import MenuDashboard from './MenuDashboard';
import type { ModuleDoc, MenuCategory, ProfileDoc } from '@/lib/types';

export default async function MenuPage() {
  const user = await requireAuth();
  const [moduleSnap, profileSnap] = await Promise.all([
    adminDb.collection('modules').doc(`${user.uid}_menu`).get(),
    adminDb.collection('profiles').doc(user.uid).get(),
  ]);
  const config   = moduleSnap.exists ? ((moduleSnap.data() as ModuleDoc).config ?? {}) : {};
  const username = profileSnap.exists ? (profileSnap.data() as ProfileDoc).username ?? '' : '';

  return (
    <MenuDashboard
      username={username}
      initialInfo={{
        restaurantName: String(config.restaurantName ?? ''),
        address:        String(config.address        ?? ''),
        openHours:      String(config.openHours      ?? ''),
        whatsapp:       String(config.whatsapp       ?? ''),
        currency:       String(config.currency       ?? 'FCFA'),
        menuUrl:        String(config.menuUrl        ?? ''),
        tableCount:     Number(config.tableCount     ?? 0),
      }}
      initialCategories={(config.categories as MenuCategory[] | undefined) ?? []}
    />
  );
}

