import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import type { LoyaltyCardDoc, ModuleDoc } from '@/lib/types';

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

  // Verify stamp code against module config
  const moduleSnap = await adminDb.collection('modules').doc(`${profileId}_loyalty`).get();
  if (!moduleSnap.exists) {
    return NextResponse.json({ error: 'Module non configuré.' }, { status: 404 });
  }
  const config = (moduleSnap.data() as ModuleDoc).config ?? {};
  const stampCode = String(config.stampCode || '');

  if (!stampCode) {
    return NextResponse.json({ error: 'Le gérant n\'a pas encore configuré de code tampon.' }, { status: 400 });
  }
  if (code.trim() !== stampCode.trim()) {
    return NextResponse.json({ error: 'Code incorrect.' }, { status: 403 });
  }

  const goal  = Number(config.stampGoal) || 10;
  const docId = `${profileId}_${normalizedPhone}`;
  const cardRef = adminDb.collection('loyaltyCards').doc(docId);
  const cardSnap = await cardRef.get();

  const currentStamps = cardSnap.exists ? ((cardSnap.data() as LoyaltyCardDoc).stamps ?? 0) : 0;
  const newStamps = currentStamps + 1;
  const completed = newStamps >= goal;
  const now = new Date().toISOString();

  await cardRef.set({
    profileId,
    phone:       normalizedPhone,
    stamps:      completed ? 0 : newStamps, // reset on completion
    lastStampAt: now,
    ...(cardSnap.exists ? {} : { createdAt: now }),
  }, { merge: true });

  return NextResponse.json({
    stamps:    completed ? 0 : newStamps,
    goal,
    completed,
    reward:    String(config.reward || ''),
  });
}
