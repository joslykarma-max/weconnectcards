import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/session';
import { adminDb } from '@/lib/firebase-admin';
import { uploadAvatar } from '@/lib/cloudinary';

export async function POST(req: NextRequest) {
  const user = await requireAuth();

  const formData = await req.formData();
  const file     = formData.get('file') as File | null;

  if (!file) {
    return NextResponse.json({ error: 'Aucun fichier.' }, { status: 400 });
  }

  if (file.size > 5 * 1024 * 1024) {
    return NextResponse.json({ error: 'Fichier trop volumineux (max 5 Mo).' }, { status: 400 });
  }

  if (!file.type.startsWith('image/')) {
    return NextResponse.json({ error: 'Type de fichier invalide.' }, { status: 400 });
  }

  const arrayBuffer = await file.arrayBuffer();
  const base64      = `data:${file.type};base64,${Buffer.from(arrayBuffer).toString('base64')}`;

  const avatarUrl = await uploadAvatar(base64, user.uid);

  await adminDb.collection('profiles').doc(user.uid).set(
    { avatar: avatarUrl, updatedAt: new Date().toISOString() },
    { merge: true },
  );

  return NextResponse.json({ url: avatarUrl });
}
