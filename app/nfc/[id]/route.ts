import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import type { CardDoc, ProfileDoc } from '@/lib/types';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const base   = new URL(req.url).origin;

  const snap = await adminDb.collection('cards').where('nfcId', '==', id).limit(1).get();

  if (snap.empty) {
    return NextResponse.redirect(`${base}/activate?nfc=${id}`);
  }

  const card = snap.docs[0].data() as CardDoc;

  if (card.status !== 'active') {
    return NextResponse.redirect(`${base}/activate?nfc=${id}`);
  }

  const profileSnap = await adminDb.collection('profiles').doc(card.userId).get();
  if (!profileSnap.exists) {
    return NextResponse.redirect(`${base}/dashboard`);
  }

  const profile = profileSnap.data() as ProfileDoc;

  if (!profile.username || !profile.isPublic) {
    return NextResponse.redirect(`${base}/dashboard`);
  }

  adminDb.collection('scans').add({
    userId:    card.userId,
    nfcId:     id,
    device:    'nfc',
    userAgent: req.headers.get('user-agent')?.slice(0, 512) ?? '',
    scannedAt: new Date().toISOString(),
  }).catch(() => {});

  return NextResponse.redirect(`${base}/${profile.username}`);
}
