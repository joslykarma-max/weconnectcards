import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { getTransaction } from '@/lib/fedapay';
import '@/lib/firebase-admin';

interface PendingReg {
  profileId:      string;
  username:       string;
  name:           string;
  email:          string;
  phone:          string;
  ticketTypeId:   string;
  ticketTypeName: string;
  ticketPrice:    number;
}

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const token         = searchParams.get('token');
  const transactionId = searchParams.get('id');
  const appUrl        = process.env.NEXT_PUBLIC_APP_URL ?? 'https://weconnect.cards';

  if (!token) return NextResponse.redirect(`${appUrl}/`);

  const pendingRef  = adminDb.collection('pendingEventRegistrations').doc(token);
  const pendingSnap = await pendingRef.get();
  if (!pendingSnap.exists) return NextResponse.redirect(`${appUrl}/`);

  const pending = pendingSnap.data() as PendingReg;
  const cancelUrl = `${appUrl}/m/${pending.username}/event?payment=cancelled`;

  // Vérifier le paiement
  if (!transactionId) return NextResponse.redirect(cancelUrl);

  try {
    const transaction = await getTransaction(Number(transactionId));
    if (transaction.status !== 'approved') return NextResponse.redirect(cancelUrl);
  } catch {
    return NextResponse.redirect(`${appUrl}/m/${pending.username}/event?payment=error`);
  }

  // Créer l'inscription finale (dédup par téléphone)
  const normalizedPhone = pending.phone.replace(/\D/g, '');
  const docId           = `${pending.profileId}_${normalizedPhone}`;
  const alreadyExists   = await adminDb.collection('eventRegistrations').doc(docId).get();

  if (!alreadyExists.exists) {
    await adminDb.collection('eventRegistrations').doc(docId).set({
      profileId:      pending.profileId,
      name:           pending.name,
      email:          pending.email,
      phone:          pending.phone,
      ticketTypeId:   pending.ticketTypeId,
      ticketTypeName: pending.ticketTypeName,
      ticketPrice:    pending.ticketPrice,
      transactionId,
      registeredAt:   new Date().toISOString(),
    });
  }

  await pendingRef.delete();

  const successUrl = `${appUrl}/m/${pending.username}/event?confirmed=1&name=${encodeURIComponent(pending.name)}&ticket=${encodeURIComponent(pending.ticketTypeName)}`;
  return NextResponse.redirect(successUrl);
}
