import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/session';
import { adminDb } from '@/lib/firebase-admin';
import QRCode from 'qrcode';
import type { UserDoc, QrCodeDoc, QrType } from '@/lib/types';

const FREE_LIMIT = 5;

function buildQrData(type: QrType, fields: Record<string, string>): string {
  switch (type) {
    case 'url':
      return fields.url?.trim() || 'https://weconnect.cards';
    case 'text':
      return fields.text?.trim() || '';
    case 'wifi':
      return `WIFI:T:${fields.security || 'WPA'};S:${fields.ssid || ''};P:${fields.password || ''};;`;
    case 'contact': {
      const lines = [
        'BEGIN:VCARD', 'VERSION:3.0',
        `N:${fields.lastName || ''};${fields.firstName || ''}`,
        `FN:${[fields.firstName, fields.lastName].filter(Boolean).join(' ')}`,
      ];
      if (fields.phone)   lines.push(`TEL:${fields.phone}`);
      if (fields.email)   lines.push(`EMAIL:${fields.email}`);
      if (fields.company) lines.push(`ORG:${fields.company}`);
      if (fields.website) lines.push(`URL:${fields.website}`);
      lines.push('END:VCARD');
      return lines.join('\n');
    }
    case 'email':
      return `mailto:${fields.to || ''}${fields.subject ? `?subject=${encodeURIComponent(fields.subject)}` : ''}${fields.body ? `${fields.subject ? '&' : '?'}body=${encodeURIComponent(fields.body)}` : ''}`;
    case 'phone':
      return `tel:${fields.phone || ''}`;
    default:
      return '';
  }
}

// POST — save a new QR code
export async function POST(req: NextRequest) {
  const user = await requireAuth();

  const [userSnap, existingSnap] = await Promise.all([
    adminDb.collection('users').doc(user.uid).get(),
    adminDb.collection('qrCodes').where('userId', '==', user.uid).limit(FREE_LIMIT + 1).get(),
  ]);

  const isPro = userSnap.exists ? (userSnap.data() as UserDoc).plan === 'pro' : false;

  if (!isPro && existingSnap.size >= FREE_LIMIT) {
    return NextResponse.json(
      { error: `Limite de ${FREE_LIMIT} QR codes atteinte sur le plan Essentiel.` },
      { status: 403 },
    );
  }

  const { type, fields, fgColor, bgColor, size, ecLevel, label } = await req.json() as {
    type:    QrType;
    fields:  Record<string, string>;
    fgColor: string;
    bgColor: string;
    size:    number;
    ecLevel: 'L' | 'M' | 'Q' | 'H';
    label:   string;
  };

  // Create doc first to get the ID (needed for tracking URL)
  const docRef = adminDb.collection('qrCodes').doc();
  const docId  = docRef.id;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://weconnect.cards';

  let qrData    = buildQrData(type, fields);
  let targetUrl: string | undefined;

  // Pro + URL type → use tracking URL so scans are measured
  if (isPro && type === 'url' && qrData) {
    targetUrl = qrData;
    qrData    = `${appUrl}/qr/${docId}`;
  }

  const dataUrl = await QRCode.toDataURL(qrData, {
    color: { dark: fgColor, light: bgColor },
    width:               Math.min(size, 320),
    margin:              2,
    errorCorrectionLevel: ecLevel,
  });

  const doc: QrCodeDoc = {
    id:        docId,
    userId:    user.uid,
    type,
    label,
    data:      qrData,
    fgColor,
    bgColor,
    dataUrl,
    size,
    ecLevel,
    createdAt: new Date().toISOString(),
    scanCount: 0,
    ...(targetUrl ? { targetUrl } : {}),
  };

  await docRef.set(doc);
  return NextResponse.json({ success: true, code: doc });
}

// PATCH — update destination URL for Pro dynamic QR codes
export async function PATCH(req: NextRequest) {
  const user = await requireAuth();

  const userSnap = await adminDb.collection('users').doc(user.uid).get();
  const isPro    = userSnap.exists ? (userSnap.data() as UserDoc).plan === 'pro' : false;
  if (!isPro) return NextResponse.json({ error: 'Plan Pro requis.' }, { status: 403 });

  const { id, targetUrl } = await req.json() as { id: string; targetUrl: string };
  if (!id || !targetUrl?.trim()) return NextResponse.json({ error: 'ID et URL requis.' }, { status: 400 });

  const docRef = adminDb.collection('qrCodes').doc(id);
  const snap   = await docRef.get();
  if (!snap.exists || (snap.data() as QrCodeDoc).userId !== user.uid) {
    return NextResponse.json({ error: 'Non autorisé.' }, { status: 403 });
  }
  if ((snap.data() as QrCodeDoc).type !== 'url') {
    return NextResponse.json({ error: 'Seuls les QR de type URL peuvent être modifiés.' }, { status: 400 });
  }

  await docRef.update({ targetUrl: targetUrl.trim() });
  return NextResponse.json({ success: true });
}

// DELETE — remove a saved QR code
export async function DELETE(req: NextRequest) {
  const user = await requireAuth();
  const id   = new URL(req.url).searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'ID requis.' }, { status: 400 });

  const docRef = adminDb.collection('qrCodes').doc(id);
  const snap   = await docRef.get();

  if (!snap.exists || (snap.data() as QrCodeDoc).userId !== user.uid) {
    return NextResponse.json({ error: 'Non autorisé.' }, { status: 403 });
  }

  await docRef.delete();

  // Clean up scan history
  const scansSnap = await adminDb.collection('qrScans').where('qrId', '==', id).get();
  if (!scansSnap.empty) {
    const batch = adminDb.batch();
    scansSnap.docs.forEach((d) => batch.delete(d.ref));
    await batch.commit();
  }

  return NextResponse.json({ success: true });
}
