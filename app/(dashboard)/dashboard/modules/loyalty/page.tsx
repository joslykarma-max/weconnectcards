import { requireAuth } from '@/lib/session';
import { adminDb } from '@/lib/firebase-admin';
import LoyaltyDashboard from './LoyaltyDashboard';
import type { ModuleDoc, LoyaltyCardDoc } from '@/lib/types';

export default async function LoyaltyPage() {
  const user = await requireAuth();

  const [moduleSnap, cardsSnap] = await Promise.all([
    adminDb.collection('modules').doc(`${user.uid}_loyalty`).get(),
    adminDb.collection('loyaltyCards').where('profileId', '==', user.uid).get(),
  ]);

  const config = moduleSnap.exists
    ? ((moduleSnap.data() as ModuleDoc).config ?? {})
    : {};

  const customers = cardsSnap.docs
    .map((d) => {
      const data = d.data() as LoyaltyCardDoc;
      return {
        phone:       data.phone,
        stamps:      data.stamps,
        lastStampAt: data.lastStampAt ?? null,
        createdAt:   data.createdAt,
      };
    })
    .sort((a, b) => b.stamps - a.stamps);

  return (
    <LoyaltyDashboard
      initialConfig={{
        businessName: String(config.businessName ?? ''),
        reward:       String(config.reward       ?? ''),
        stampGoal:    String(config.stampGoal    ?? '10'),
        expiryDays:   String(config.expiryDays   ?? '365'),
        stampEmoji:   String(config.stampEmoji   ?? '⭐'),
        stampCode:    String(config.stampCode    ?? ''),
      }}
      customers={customers}
    />
  );
}
