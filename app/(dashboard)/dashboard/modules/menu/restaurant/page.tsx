import { requireAuth }  from '@/lib/session';
import { adminDb }      from '@/lib/firebase-admin';
import RestaurantClient from './RestaurantClient';
import type { ModuleDoc } from '@/lib/types';

export default async function RestaurantPage() {
  const user       = await requireAuth();
  const moduleSnap = await adminDb.collection('modules').doc(`${user.uid}_menu`).get();

  let restaurantName = '';
  if (moduleSnap.exists) {
    const data = moduleSnap.data() as ModuleDoc;
    restaurantName = (data.config?.restaurantName as string | undefined) ?? '';
  }

  return <RestaurantClient uid={user.uid} restaurantName={restaurantName} />;
}
