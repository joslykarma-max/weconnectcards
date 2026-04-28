import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { createTransaction } from '@/lib/fedapay';
import '@/lib/firebase-admin';

export async function POST(req: NextRequest) {
  const { profileId, username, name, email, phone, ticketTypeId, ticketTypeName, ticketPrice, currency } = await req.json();

  if (!profileId || !name || !phone || !ticketTypeId || !ticketPrice) {
    return NextResponse.json({ error: 'Champs requis manquants' }, { status: 400 });
  }

  // Dédup avant paiement
  const normalizedPhone = phone.replace(/\D/g, '');
  const docId = `${profileId}_${normalizedPhone}`;
  const existing = await adminDb.collection('eventRegistrations').doc(docId).get();
  if (existing.exists) {
    return NextResponse.json({ error: 'Vous êtes déjà inscrit à cet événement avec ce numéro' }, { status: 409 });
  }

  // Stocker l'inscription en attente
  const token = `${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
  await adminDb.collection('pendingEventRegistrations').doc(token).set({
    profileId, username, name, email: email || '', phone,
    ticketTypeId, ticketTypeName, ticketPrice,
    createdAt: new Date().toISOString(),
  });

  const appUrl       = process.env.NEXT_PUBLIC_APP_URL ?? 'https://weconnect.cards';
  const fedaCurrency = currency === 'FCFA' ? 'XOF' : (currency || 'XOF');

  const result = await createTransaction({
    amount:        ticketPrice,
    currency:      fedaCurrency,
    description:   `Billet ${ticketTypeName} — ${username}`,
    customerEmail: email || `${normalizedPhone}@event.weconnect.cards`,
    customerName:  name,
    callbackUrl:   `${appUrl}/api/event/pay/callback?token=${token}`,
    metadata:      { token, profileId, username },
  });

  return NextResponse.json({ payment_url: result.payment_url });
}
