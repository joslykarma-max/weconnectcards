import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/session';
import { adminDb } from '@/lib/firebase-admin';
import type { ProfileDoc, LinkDoc } from '@/lib/types';

export async function GET() {
  const user = await requireAuth();

  const [profileSnap, linksSnap] = await Promise.all([
    adminDb.collection('profiles').doc(user.uid).get(),
    adminDb.collection('profiles').doc(user.uid).collection('links').orderBy('order').get(),
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
  const user = await requireAuth();

  const body = await req.json() as Partial<ProfileDoc>;

  if (body.username) {
    body.username = toSlug(body.username);
  }

  // Check username uniqueness if changing
  if (body.username) {
    const snap = await adminDb.collection('usernames').doc(body.username).get();
    if (snap.exists && (snap.data() as { uid: string }).uid !== user.uid) {
      return NextResponse.json({ error: "Ce nom d'utilisateur est déjà pris." }, { status: 409 });
    }

    // Get current username to delete old mapping
    const currentProfile = await adminDb.collection('profiles').doc(user.uid).get();
    const currentUsername = (currentProfile.data() as ProfileDoc | undefined)?.username;

    if (currentUsername && currentUsername !== body.username) {
      const batch = adminDb.batch();
      batch.delete(adminDb.collection('usernames').doc(currentUsername));
      batch.set(adminDb.collection('usernames').doc(body.username), { uid: user.uid });
      await batch.commit();
    }
  }

  await adminDb.collection('profiles').doc(user.uid).set(
    { ...body, updatedAt: new Date().toISOString() },
    { merge: true },
  );

  const updated = await adminDb.collection('profiles').doc(user.uid).get();
  return NextResponse.json({ id: updated.id, ...updated.data() });
}
