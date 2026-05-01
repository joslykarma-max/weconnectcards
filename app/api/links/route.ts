import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/session';
import { adminDb } from '@/lib/firebase-admin';
import type { LinkDoc } from '@/lib/types';

const linksRef = (uid: string) =>
  adminDb.collection('profiles').doc(uid).collection('links');

export async function GET() {
  const user  = await requireAuth();
  const snap  = await linksRef(user.uid).orderBy('order').get();
  const links = snap.docs.map((d) => ({ id: d.id, ...d.data() })) as LinkDoc[];
  return NextResponse.json(links);
}

export async function POST(req: NextRequest) {
  const user = await requireAuth();
  const body = await req.json() as Omit<LinkDoc, 'id' | 'order' | 'isActive'>;

  const countSnap = await linksRef(user.uid).count().get();
  const order     = countSnap.data().count;

  const ref  = linksRef(user.uid).doc();
  const link: LinkDoc = { id: ref.id, ...body, order, isActive: true };
  await ref.set(link);

  return NextResponse.json(link, { status: 201 });
}

export async function PUT(req: NextRequest) {
  const user  = await requireAuth();
  const items = await req.json() as Array<{ id: string; order: number }>;

  const batch = adminDb.batch();
  items.forEach(({ id, order }) => {
    batch.update(linksRef(user.uid).doc(id), { order });
  });
  await batch.commit();

  return NextResponse.json({ ok: true });
}

export async function PATCH(req: NextRequest) {
  const user = await requireAuth();
  const { id, ...updates } = await req.json() as Partial<LinkDoc> & { id: string };

  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

  // Whitelist editable fields
  const patch: Partial<LinkDoc> = {};
  if (updates.type     !== undefined) patch.type     = updates.type;
  if (updates.label    !== undefined) patch.label    = updates.label;
  if (updates.url      !== undefined) patch.url      = updates.url;
  if (updates.icon     !== undefined) patch.icon     = updates.icon;
  if (updates.isActive !== undefined) patch.isActive = updates.isActive;

  if (Object.keys(patch).length === 0) {
    return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
  }

  await linksRef(user.uid).doc(id).update(patch);
  const snap = await linksRef(user.uid).doc(id).get();
  return NextResponse.json({ id, ...snap.data() });
}

export async function DELETE(req: NextRequest) {
  const user  = await requireAuth();
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

  await linksRef(user.uid).doc(id).delete();
  return NextResponse.json({ ok: true });
}
