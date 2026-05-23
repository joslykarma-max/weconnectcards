import { requireAuth } from '@/lib/session';
import { adminDb }     from '@/lib/firebase-admin';
import TablesClient    from './TablesClient';
import type { ModuleDoc, ProfileDoc } from '@/lib/types';

export default async function MenuTablesPage() {
  const user = await requireAuth();

  const [moduleSnap, profileSnap] = await Promise.all([
    adminDb.collection('modules').doc(`${user.uid}_menu`).get(),
    adminDb.collection('profiles').doc(user.uid).get(),
  ]);

  const config     = moduleSnap.exists ? ((moduleSnap.data() as ModuleDoc).config ?? {}) : {};
  const username   = profileSnap.exists ? (profileSnap.data() as ProfileDoc).username ?? '' : '';
  const tableCount = Number(config.tableCount ?? 0);

  return <TablesClient username={username} initialTableCount={tableCount} />;
}
