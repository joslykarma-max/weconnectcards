import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { PROFILE_MODULE, TAP_MODULES, isProfileModuleActive } from '@/lib/modules';
import type { CardDoc, ProfileDoc, AccessCardDoc, MemberCardDoc, ModuleDoc, UserDoc } from '@/lib/types';

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

  if (card.status !== 'active' || !card.userId) {
    return NextResponse.redirect(`${base}/activate?nfc=${id}`);
  }

  const profileSnap = await adminDb.collection('profiles').doc(card.profileId ?? card.userId).get();
  if (!profileSnap.exists) {
    return NextResponse.redirect(`${base}/dashboard`);
  }

  const profile = profileSnap.data() as ProfileDoc;

  if (!profile.username || !profile.isPublic) {
    return NextResponse.redirect(`${base}/dashboard`);
  }

  const logScan = () => adminDb.collection('scans').add({
    userId:    card.userId,
    nfcId:     id,
    ...(card.profileId && card.profileId !== card.userId ? { profileId: card.profileId } : {}),
    device:    'nfc',
    userAgent: req.headers.get('user-agent')?.slice(0, 512) ?? '',
    scannedAt: new Date().toISOString(),
  }).catch(() => {});

  // If this card is linked to an access porteur, redirect to their badge page
  if (card.accessCardId) {
    const accessCardSnap = await adminDb
      .collection('accessCards')
      .doc(`${card.userId}_${card.accessCardId}`)
      .get();

    if (accessCardSnap.exists && (accessCardSnap.data() as AccessCardDoc).isActive) {
      logScan();
      return NextResponse.redirect(
        `${base}/m/${profile.username}/access?card=${card.accessCardId}`
      );
    }
  }

  // If this card is linked to a member card, redirect to their member page
  if (card.memberCardId) {
    const memberCardSnap = await adminDb
      .collection('memberCards')
      .doc(`${card.userId}_${card.memberCardId}`)
      .get();

    if (memberCardSnap.exists && (memberCardSnap.data() as MemberCardDoc).isActive) {
      logScan();
      return NextResponse.redirect(
        `${base}/m/${profile.username}/member?card=${card.memberCardId}`
      );
    }
  }

  // Digital profile switched off → the tap opens the card's module directly
  // (modules are hidden once the subscription has expired, so the profile shows instead)
  const [modulesSnap, userSnap] = await Promise.all([
    adminDb.collection('modules').where('profileId', '==', card.userId).get(),
    adminDb.collection('users').doc(card.userId).get(),
  ]);
  const modules            = modulesSnap.docs.map((d) => d.data() as ModuleDoc);
  const tapModules         = modules.filter((m) => m.isActive && TAP_MODULES.has(m.type));
  const subscriptionUntil  = (userSnap.data() as UserDoc | undefined)?.subscriptionUntil;
  const subscriptionActive = !subscriptionUntil || new Date(subscriptionUntil) > new Date();

  if (subscriptionActive && tapModules.length === 1
      && !isProfileModuleActive(modules.find((m) => m.type === PROFILE_MODULE))) {
    logScan();
    return NextResponse.redirect(`${base}/m/${profile.username}/${tapModules[0].type}`);
  }

  logScan();
  return NextResponse.redirect(`${base}/${profile.username}`);
}
