import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { createTransaction } from '@/lib/fedapay';
import type { TicketType } from '@/lib/types';

export async function POST(req: NextRequest) {
  let body: unknown;
  try { body = await req.json(); } catch { return NextResponse.json({ error: 'Corps de requête invalide' }, { status: 400 }); }

  const { profileId, username, name, email, phone, ticketTypeId, currency } =
    body as { profileId?: string; username?: string; name?: string; email?: string; phone?: string; ticketTypeId?: string; currency?: string };

  if (!profileId || !name || !phone || !ticketTypeId) {
    return NextResponse.json({ error: 'Champs requis manquants' }, { status: 400 });
  }

  // Load ticket type from server — never trust client-supplied price
  const moduleSnap = await adminDb.collection('modules').doc(`${profileId}_event`).get();
  if (!moduleSnap.exists) {
    return NextResponse.json({ error: 'Module événement introuvable' }, { status: 404 });
  }
  const moduleConfig = (moduleSnap.data()?.config ?? {}) as { ticketTypes?: TicketType[]; currency?: string };
  const ticketType = (moduleConfig.ticketTypes ?? []).find((t) => t.id === ticketTypeId);
  if (!ticketType) {
    return NextResponse.json({ error: 'Type de billet introuvable' }, { status: 404 });
  }
  if (ticketType.price <= 0) {
    return NextResponse.json({ error: 'Ce billet est gratuit, utilisez le formulaire d\'inscription' }, { status: 400 });
  }

  // Check capacity
  const registrationsSnap = await adminDb.collection('eventRegistrations')
    .where('profileId', '==', profileId)
    .where('ticketTypeId', '==', ticketTypeId)
    .get();
  if (registrationsSnap.size >= ticketType.capacity) {
    return NextResponse.json({ error: 'Plus de places disponibles pour ce type de billet' }, { status: 409 });
  }

  // Dédup avant paiement
  const normalizedPhone = phone.replace(/\D/g, '');
  const docId = `${profileId}_${normalizedPhone}`;
  const existing = await adminDb.collection('eventRegistrations').doc(docId).get();
  if (existing.exists) {
    return NextResponse.json({ error: 'Vous êtes déjà inscrit à cet événement avec ce numéro' }, { status: 409 });
  }

  // Stocker l'inscription en attente avec le prix serveur
  const token = `${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
  await adminDb.collection('pendingEventRegistrations').doc(token).set({
    profileId, username: username ?? '', name, email: email || '', phone,
    ticketTypeId,
    ticketTypeName: ticketType.name,
    ticketPrice:    ticketType.price,
    createdAt: new Date().toISOString(),
  });

  const appUrl       = process.env.NEXT_PUBLIC_APP_URL ?? 'https://weconnect.cards';
  const fedaCurrency = currency === 'FCFA' ? 'XOF' : (moduleConfig.currency || currency || 'XOF');

  const result = await createTransaction({
    amount:        ticketType.price,
    currency:      fedaCurrency,
    description:   `Billet ${ticketType.name} — ${username}`,
    customerEmail: email || `${normalizedPhone}@event.weconnect.cards`,
    customerName:  name,
    callbackUrl:   `${appUrl}/api/event/pay/callback?token=${token}`,
    metadata:      { token, profileId, username: username ?? '' },
  });

  return NextResponse.json({ payment_url: result.payment_url });
}
