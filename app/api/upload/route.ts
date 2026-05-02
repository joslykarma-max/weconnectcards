import { NextRequest, NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
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
  const ALLOWED_MIME = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  if (!ALLOWED_MIME.includes(file.type)) return NextResponse.json({ error: 'Format non supporté (JPG, PNG, WEBP, GIF uniquement)' }, { status: 400 });
  if (file.size > MAX_SIZE) return NextResponse.json({ error: 'Fichier trop volumineux (max 5 Mo)' }, { status: 400 });

  const buffer     = Buffer.from(await file.arrayBuffer());
  const ext        = file.name.split('.').pop()?.replace(/[^a-z0-9]/gi, '') || 'jpg';
  const rawFolder  = req.nextUrl.searchParams.get('folder') ?? 'menuImages';
  const safeFolder = rawFolder.replace(/[^a-zA-Z0-9_-]/g, '');
  const path       = `${safeFolder}/${session.uid}/${Date.now()}.${ext}`;

  const bucket  = admin.storage().bucket();
  const fileRef = bucket.file(path);
  const token   = randomUUID();

  try {
    await fileRef.save(buffer, {
      metadata: {
        contentType: file.type,
        metadata: { firebaseStorageDownloadTokens: token },
      },
      resumable: false,
    });
  } catch (err) {
    console.error('[upload] save failed:', err);
    return NextResponse.json({
      error: 'Échec du téléversement. Vérifiez que Firebase Storage est activé.',
    }, { status: 500 });
  }

  const url = `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodeURIComponent(path)}?alt=media&token=${token}`;
  return NextResponse.json({ url });
}
