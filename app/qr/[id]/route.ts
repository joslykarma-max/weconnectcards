import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';
import type { QrCodeDoc } from '@/lib/types';

function detectDevice(ua: string): 'mobile' | 'desktop' | 'unknown' {
  if (!ua) return 'unknown';
  return /mobile|android|iphone|ipad|ipod|opera mini/i.test(ua) ? 'mobile' : 'desktop';
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const base   = new URL(req.url).origin;

  const snap = await adminDb.collection('qrCodes').doc(id).get();

  if (!snap.exists) {
    return NextResponse.redirect(`${base}/`);
  }

  const code = snap.data() as QrCodeDoc;
  const ua   = req.headers.get('user-agent') ?? '';

  // Fire-and-forget: record scan + increment counter
  void Promise.all([
    adminDb.collection('qrScans').add({
      qrId:      id,
      userId:    code.userId,
      scannedAt: new Date().toISOString(),
      device:    detectDevice(ua),
      userAgent: ua.slice(0, 512),
    }),
    adminDb.collection('qrCodes').doc(id).update({
      scanCount:     FieldValue.increment(1),
      lastScannedAt: new Date().toISOString(),
    }),
  ]).catch(() => {});

  return NextResponse.redirect(code.targetUrl ?? `${base}/`);
}
