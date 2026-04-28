import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import type { LoyaltyCardDoc, ModuleDoc } from '@/lib/types';

// GET /api/loyalty?profileId=X&phone=Y — load or create customer card
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const profileId = searchParams.get('profileId');
  const phone     = searchParams.get('phone');

  if (!profileId || !phone) {
    return NextResponse.json({ error: 'profileId et phone requis.' }, { status: 400 });
  }

  const normalizedPhone = phone.replace(/\s/g, '');
  const docId = `${profileId}_${normalizedPhone}`;

  // Load module config (goal, reward, emoji, businessName)
  const moduleSnap = await adminDb.collection('modules').doc(`${profileId}_loyalty`).get();
  if (!moduleSnap.exists) {
    return NextResponse.json({ error: 'Module fidélité non configuré.' }, { status: 404 });
  }
  const moduleData = moduleSnap.data() as ModuleDoc;
  const config = moduleData.config ?? {};

  // Load or create loyalty card for this customer
  const cardRef  = adminDb.collection('loyaltyCards').doc(docId);
  const cardSnap = await cardRef.get();

  if (!cardSnap.exists) {
    const now: LoyaltyCardDoc = {
      profileId,
      phone: normalizedPhone,
      stamps: 0,
      createdAt: new Date().toISOString(),
    };
    await cardRef.set(now);
  }

  const card = cardSnap.exists ? (cardSnap.data() as LoyaltyCardDoc) : { stamps: 0 };

  return NextResponse.json({
    stamps:       card.stamps,
    goal:         Number(config.stampGoal) || 10,
    reward:       String(config.reward     || ''),
    emoji:        String(config.stampEmoji || '⭐'),
    businessName: String(config.businessName || ''),
    expiryDays:   Number(config.expiryDays) || 0,
  });
}
