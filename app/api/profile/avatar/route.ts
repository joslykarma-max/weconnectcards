import { NextRequest, NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import { requireAuth } from '@/lib/session';
import { adminDb, adminStorage } from '@/lib/firebase-admin';

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

  const buffer    = Buffer.from(await file.arrayBuffer());
  const ext       = (file.type.split('/')[1] ?? 'jpg').replace(/[^a-z0-9]/gi, '');
  const filePath  = `avatars/${user.uid}-${Date.now()}.${ext}`;
  const bucket    = adminStorage.bucket();
  const fileRef   = bucket.file(filePath);
  const token     = randomUUID();

  try {
    await fileRef.save(buffer, {
      metadata: {
        contentType: file.type,
        metadata: { firebaseStorageDownloadTokens: token },
      },
      resumable: false,
    });
  } catch (err) {
    console.error('[avatar] upload failed:', err);
    return NextResponse.json({
      error: 'Échec du téléversement. Vérifiez que Firebase Storage est activé.',
    }, { status: 500 });
  }

  const avatarUrl = `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodeURIComponent(filePath)}?alt=media&token=${token}`;

  await adminDb.collection('profiles').doc(user.uid).set(
    { avatar: avatarUrl, updatedAt: new Date().toISOString() },
    { merge: true },
  );

  return NextResponse.json({ url: avatarUrl });
}
