import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/session';
import { FieldValue } from 'firebase-admin/firestore';
import { adminDb } from '@/lib/firebase-admin';
import { getOwnedProfileId } from '@/lib/profiles';
import { toUsernameSlug, usernameProblem } from '@/lib/usernames';
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


export async function PATCH(req: NextRequest) {
  const user      = await requireAuth();
  const profileId = await getOwnedProfileId(user.uid, new URL(req.url).searchParams.get('profileId'));
  if (!profileId) return NextResponse.json({ error: 'Profil introuvable.' }, { status: 404 });

  const body = await req.json() as Partial<ProfileDoc>;
  // Ownership fields are never client-editable
  delete body.uid;
  delete body.cardId;

  // Username: normalised before anything is saved; an empty value never erases it
  if ('username' in body) {
    const slug = toUsernameSlug(typeof body.username === 'string' ? body.username : '');
    if (slug) body.username = slug; else delete body.username;
  }

  // Switcher name: trimmed, capped; empty → back to the default label
  const updates: Record<string, unknown> = { ...body };
  if ('label' in body) {
    const label = typeof body.label === 'string' ? body.label.trim().slice(0, 40) : '';
    updates.label = label || FieldValue.delete();
  }

  // Changing the username: valid, not a page of the site, not taken
  const currentProfile  = body.username ? await adminDb.collection('profiles').doc(profileId).get() : null;
  const currentUsername = (currentProfile?.data() as ProfileDoc | undefined)?.username;
  if (body.username && body.username !== currentUsername) {
    const problem = usernameProblem(body.username);
    if (problem) return NextResponse.json({ error: problem }, { status: 400 });

    const snap = await adminDb.collection('usernames').doc(body.username).get();
    const owner = snap.exists ? (snap.data() as { uid: string; profileId?: string }) : null;
    if (owner && (owner.profileId ?? owner.uid) !== profileId) {
      return NextResponse.json({ error: "Ce nom d'utilisateur est déjà pris." }, { status: 409 });
    }

    const batch = adminDb.batch();
    if (currentUsername) batch.delete(adminDb.collection('usernames').doc(currentUsername));
    batch.set(
      adminDb.collection('usernames').doc(body.username),
      profileId === user.uid ? { uid: user.uid } : { uid: user.uid, profileId },
    );
    await batch.commit();
  }

  await adminDb.collection('profiles').doc(profileId).set(
    { ...updates, updatedAt: new Date().toISOString() },
    { merge: true },
  );

  const updated = await adminDb.collection('profiles').doc(profileId).get();
  return NextResponse.json({ id: updated.id, ...updated.data() });
}
