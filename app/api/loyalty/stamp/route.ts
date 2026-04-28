import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import type { LoyaltyCardDoc, ModuleDoc, RewardTier } from '@/lib/types';

// POST /api/loyalty/stamp — add one stamp after code validation
export async function POST(req: NextRequest) {
  const { profileId, phone, code } = await req.json() as {
    profileId: string;
    phone:     string;
    code:      string;
  };

  if (!profileId || !phone || !code) {
    return NextResponse.json({ error: 'Données manquantes.' }, { status: 400 });
  }

  const normalizedPhone = phone.replace(/\s/g, '');

  const moduleSnap = await adminDb.collection('modules').doc(`${profileId}_loyalty`).get();
  if (!moduleSnap.exists) {
    return NextResponse.json({ error: 'Module non configuré.' }, { status: 404 });
  }
  const config    = (moduleSnap.data() as ModuleDoc).config ?? {};
  const stampCode = String(config.stampCode || '');

  if (!stampCode) {
    return NextResponse.json({ error: 'Le gérant n\'a pas encore configuré de code tampon.' }, { status: 400 });
  }
  if (code.trim() !== stampCode.trim()) {
    return NextResponse.json({ error: 'Code incorrect.' }, { status: 403 });
  }

  // Resolve tiers
  const rawTiers = config.tiers as RewardTier[] | undefined;
  const tiers: RewardTier[] = rawTiers?.length
    ? rawTiers
    : [{ stamps: Number(config.stampGoal) || 10, reward: String(config.reward ?? '') }];
  const sortedTiers = [...tiers].sort((a, b) => a.stamps - b.stamps);
  const maxStamps   = sortedTiers[sortedTiers.length - 1].stamps;

  const docId   = `${profileId}_${normalizedPhone}`;
  const cardRef = adminDb.collection('loyaltyCards').doc(docId);
  const cardSnap = await cardRef.get();

  const currentStamps = cardSnap.exists ? ((cardSnap.data() as LoyaltyCardDoc).stamps ?? 0) : 0;
  const newStamps     = currentStamps + 1;
  const now           = new Date().toISOString();

  // Check if this stamp crosses a tier threshold
  const triggeredTier = sortedTiers.find(t => t.stamps === newStamps) ?? null;

  // Reset stamps when the highest tier is reached
  const completed   = newStamps >= maxStamps;
  const finalStamps = completed ? 0 : newStamps;

  await cardRef.set({
    profileId,
    phone:       normalizedPhone,
    stamps:      finalStamps,
    lastStampAt: now,
    ...(cardSnap.exists ? {} : { createdAt: now }),
  }, { merge: true });

  return NextResponse.json({
    stamps:        finalStamps,
    completed,
    triggeredTier,
  });
}
