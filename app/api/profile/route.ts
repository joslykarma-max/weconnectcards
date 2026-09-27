import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/session';
import { adminDb } from '@/lib/firebase-admin';
import { getOwnedProfileId } from '@/lib/profiles';
import type { ProfileDoc, LinkDoc } from '@/lib/types';

export async function GET(req: NextRequest) {
  const user      = await requireAuth();
  const profileId = await getOwnedProfileId(user.uid, new URL(req.url).searchParams.get('profileId'));
  if (!profileId) return NextResponse.json({ error: 'Profil introuvable.' }, { status: 404 });

  const [profileSnap, linksSnap] = await Promise.all([
    adminDb.collection('profiles').doc(profileId).get(),
    adminDb.collection('profiles').doc(profileId).collection('links').orderBy('order').get(),
  ]);

  if (!profileSnap.exists) return NextResponse.json(null);

  const profile = { id: profileSnap.id, ...profileSnap.data() } as ProfileDoc & { id: string };
  const links   = linksSnap.docs.map((d) => ({ id: d.id, ...d.data() })) as LinkDoc[];

  return NextResponse.json({ ...profile, links });
}

function toSlug(raw: string): string {
  return raw
    .toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

export async function PATCH(req: NextRequest) {
  const user      = await requireAuth();
  const profileId = await getOwnedProfileId(user.uid, new URL(req.url).searchParams.get('profileId'));
  if (!profileId) return NextResponse.json({ error: 'Profil introuvable.' }, { status: 404 });

  const body = await req.json() as Partial<ProfileDoc>;
  // Ownership fields are never client-editable
  delete body.uid;
  delete body.cardId;

  if (body.username) {
    body.username = toSlug(body.username);
  }

  // Check username uniqueness if changing
  if (body.username) {
    const snap = await adminDb.collection('usernames').doc(body.username).get();
    const owner = snap.exists ? (snap.data() as { uid: string; profileId?: string }) : null;
    if (owner && (owner.profileId ?? owner.uid) !== profileId) {
      return NextResponse.json({ error: "Ce nom d'utilisateur est déjà pris." }, { status: 409 });
    }

    // Get current username to delete old mapping
    const currentProfile = await adminDb.collection('profiles').doc(profileId).get();
    const currentUsername = (currentProfile.data() as ProfileDoc | undefined)?.username;

    if (currentUsername && currentUsername !== body.username) {
      const batch = adminDb.batch();
      batch.delete(adminDb.collection('usernames').doc(currentUsername));
      batch.set(
        adminDb.collection('usernames').doc(body.username),
        profileId === user.uid ? { uid: user.uid } : { uid: user.uid, profileId },
      );
      await batch.commit();
    }
  }

  await adminDb.collection('profiles').doc(profileId).set(
    { ...body, updatedAt: new Date().toISOString() },
    { merge: true },
  );

  const updated = await adminDb.collection('profiles').doc(profileId).get();
  return NextResponse.json({ id: updated.id, ...updated.data() });
}
