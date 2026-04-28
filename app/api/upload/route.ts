import { NextRequest, NextResponse } from 'next/server';
import admin from 'firebase-admin';
import { getSession } from '@/lib/session';
import '@/lib/firebase-admin';

const MAX_SIZE = 5 * 1024 * 1024; // 5 MB

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });

  const formData = await req.formData();
  const file = formData.get('file') as File | null;
  if (!file) return NextResponse.json({ error: 'Fichier manquant' }, { status: 400 });
  if (!file.type.startsWith('image/')) return NextResponse.json({ error: 'Format non supporté (image uniquement)' }, { status: 400 });
  if (file.size > MAX_SIZE) return NextResponse.json({ error: 'Fichier trop volumineux (max 5 Mo)' }, { status: 400 });

  const buffer = Buffer.from(await file.arrayBuffer());
  const ext    = file.name.split('.').pop()?.replace(/[^a-z0-9]/gi, '') || 'jpg';
  const path   = `menuImages/${session.uid}/${Date.now()}.${ext}`;

  const bucket  = admin.storage().bucket();
  const fileRef = bucket.file(path);

  await fileRef.save(buffer, { metadata: { contentType: file.type } });
  await fileRef.makePublic();

  const url = `https://storage.googleapis.com/${bucket.name}/${path}`;
  return NextResponse.json({ url });
}
