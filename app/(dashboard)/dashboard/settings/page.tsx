import { requireAuth } from '@/lib/session';
import { adminDb } from '@/lib/firebase-admin';
import SettingsClient from './SettingsClient';
import type { UserDoc } from '@/lib/types';

export default async function SettingsPage() {
  const authUser = await requireAuth();

  const userSnap = await adminDb.collection('users').doc(authUser.uid).get();
  const userData = userSnap.exists ? (userSnap.data() as UserDoc) : null;

  const user = userData ? {
    email:     userData.email,
    name:      userData.displayName,
    createdAt: new Date(userData.createdAt),
  } : null;

  const subscription = userData ? {
    plan:   userData.plan,
    status: 'active',
  } : null;

  return <SettingsClient user={user} subscription={subscription} />;
}
