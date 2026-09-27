import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/session';
import { adminDb } from '@/lib/firebase-admin';
import { getOwnedProfileId } from '@/lib/profiles';
import type { LinkDoc } from '@/lib/types';

const linksRef = (profileId: string) =>
  adminDb.collection('profiles').doc(profileId).collection('links');

/** Profile targeted by ?profileId= (main profile when absent), null if not owned. */
async function targetProfile(req: NextRequest, uid: string) {
  return getOwnedProfileId(uid, new URL(req.url).searchParams.get('profileId'));
}

const notFound = () => NextResponse.json({ error: 'Profil introuvable.' }, { status: 404 });

function normalizeUrl(url: string, type?: string): string {
  const s = url.trim();
  if (!s) return s;
  if (/^[a-zA-Z][a-zA-Z0-9+\-.]*:/.test(s)) return s;
  if (type === 'phone') return `tel:${s}`;
  return `https://${s}`;
}

export async function GET(req: NextRequest) {
  const user  = await requireAuth();
  const pid   = await targetProfile(req, user.uid);
  if (!pid) return notFound();
  const snap  = await linksRef(pid).orderBy('order').get();
  const links = snap.docs.map((d) => ({ id: d.id, ...d.data() })) as LinkDoc[];
  return NextResponse.json(links);
}

export async function POST(req: NextRequest) {
  const user = await requireAuth();
  const pid  = await targetProfile(req, user.uid);
  if (!pid) return notFound();
  const body = await req.json() as Omit<LinkDoc, 'id' | 'order' | 'isActive'>;

  const countSnap = await linksRef(pid).count().get();
  const order     = countSnap.data().count;

  const ref  = linksRef(pid).doc();
  const link: LinkDoc = { id: ref.id, ...body, url: normalizeUrl(body.url ?? '', body.type), order, isActive: true };
  await ref.set(link);

  return NextResponse.json(link, { status: 201 });
}

export async function PUT(req: NextRequest) {
  const user  = await requireAuth();
  const pid  = await targetProfile(req, user.uid);
  if (!pid) return notFound();
  const items = await req.json() as Array<{ id: string; order: number }>;

  const batch = adminDb.batch();
  items.forEach(({ id, order }) => {
    batch.update(linksRef(pid).doc(id), { order });
  });
  await batch.commit();

  return NextResponse.json({ ok: true });
}

export async function PATCH(req: NextRequest) {
  const user = await requireAuth();
  const pid  = await targetProfile(req, user.uid);
  if (!pid) return notFound();
  const { id, ...updates } = await req.json() as Partial<LinkDoc> & { id: string };

  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

  // Whitelist editable fields
  const patch: Partial<LinkDoc> = {};
  if (updates.type     !== undefined) patch.type     = updates.type;
  if (updates.label    !== undefined) patch.label    = updates.label;
  if (updates.url      !== undefined) patch.url      = normalizeUrl(updates.url, updates.type);
  if (updates.icon     !== undefined) patch.icon     = updates.icon;
  if (updates.isActive !== undefined) patch.isActive = updates.isActive;

  if (Object.keys(patch).length === 0) {
    return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
  }

  await linksRef(pid).doc(id).update(patch);
  const snap = await linksRef(pid).doc(id).get();
  return NextResponse.json({ id, ...snap.data() });
}

export async function DELETE(req: NextRequest) {
  const user  = await requireAuth();
  const pid  = await targetProfile(req, user.uid);
  if (!pid) return notFound();
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

  await linksRef(pid).doc(id).delete();
  return NextResponse.json({ ok: true });
}
