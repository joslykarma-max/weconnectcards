import { requireAuth } from '@/lib/session';
import { adminDb } from '@/lib/firebase-admin';
import QrCodeClient from './QrCodeClient';
import type { UserDoc, QrCodeDoc } from '@/lib/types';

export default async function QrCodePage() {
  const user = await requireAuth();

  const [userSnap, codesSnap] = await Promise.all([
    adminDb.collection('users').doc(user.uid).get(),
    adminDb.collection('qrCodes').where('userId', '==', user.uid).get(),
  ]);

  const isPro = userSnap.exists ? (userSnap.data() as UserDoc).plan === 'pro' : false;

  const codes = codesSnap.docs
    .map((d) => d.data() as QrCodeDoc)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return <QrCodeClient initialCodes={codes} isPro={isPro} />;
}
