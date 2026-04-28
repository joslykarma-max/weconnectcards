import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/session';
import { adminDb } from '@/lib/firebase-admin';
import type { QrCodeDoc, QrScanDoc } from '@/lib/types';

export async function GET(req: NextRequest) {
  const user = await requireAuth();
  const id   = new URL(req.url).searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'ID requis.' }, { status: 400 });

  const codeSnap = await adminDb.collection('qrCodes').doc(id).get();
  if (!codeSnap.exists || (codeSnap.data() as QrCodeDoc).userId !== user.uid) {
    return NextResponse.json({ error: 'Non autorisé.' }, { status: 403 });
  }

  const code = codeSnap.data() as QrCodeDoc;

  // All scans for this QR code, sorted by date desc
  const scansSnap = await adminDb.collection('qrScans').where('qrId', '==', id).get();
  const allScans  = scansSnap.docs
    .map((d) => d.data() as QrScanDoc)
    .sort((a, b) => new Date(b.scannedAt).getTime() - new Date(a.scannedAt).getTime());

  const recentScans = allScans.slice(0, 20);

  // Daily counts for the last 7 days
  const now  = Date.now();
  const daily = Array.from({ length: 7 }, (_, i) => {
    const d   = new Date(now - (6 - i) * 86_400_000);
    const key = d.toISOString().slice(0, 10);
    return { date: key, count: 0 };
  });

  allScans.forEach((s) => {
    const key = s.scannedAt.slice(0, 10);
    const slot = daily.find((d) => d.date === key);
    if (slot) slot.count++;
  });

  // Device breakdown
  const devices = { mobile: 0, desktop: 0, unknown: 0 };
  allScans.forEach((s) => { devices[s.device]++; });

  return NextResponse.json({
    scanCount:    code.scanCount,
    lastScannedAt: code.lastScannedAt,
    recentScans,
    dailyScans:   daily,
    devices,
  });
}
