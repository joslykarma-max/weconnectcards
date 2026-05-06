import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { rateLimit, getClientIp } from '@/lib/rate-limit';
import type { TicketType } from '@/lib/types';

export async function POST(req: NextRequest) {
  if (!rateLimit(getClientIp(req), 5, 60_000)) {
    return NextResponse.json({ error: 'Trop de tentatives. Réessaie dans une minute.' }, { status: 429 });
  }

  let body: unknown;
  try { body = await req.json(); } catch { return NextResponse.json({ error: 'Corps de requête invalide' }, { status: 400 }); }

  const { profileId, name, email, phone, ticketTypeId } =
    body as { profileId?: string; name?: string; email?: string; phone?: string; ticketTypeId?: string };

  if (!profileId || !name || !phone || !ticketTypeId) {
    return NextResponse.json({ error: 'Champs requis manquants' }, { status: 400 });
  }

  // Load ticket type server-side to get name, price and check capacity
  const moduleSnap = await adminDb.collection('modules').doc(`${profileId}_event`).get();
  if (!moduleSnap.exists) {
    return NextResponse.json({ error: 'Module événement introuvable' }, { status: 404 });
  }
  const moduleConfig = (moduleSnap.data()?.config ?? {}) as { ticketTypes?: TicketType[] };
  const ticketType = (moduleConfig.ticketTypes ?? []).find((t) => t.id === ticketTypeId);
  if (!ticketType) {
    return NextResponse.json({ error: 'Type de billet introuvable' }, { status: 404 });
  }

  // Capacity check
  const registrationsSnap = await adminDb.collection('eventRegistrations')
    .where('profileId', '==', profileId)
    .where('ticketTypeId', '==', ticketTypeId)
    .get();
  if (registrationsSnap.size >= ticketType.capacity) {
    return NextResponse.json({ error: 'Plus de places disponibles pour ce type de billet' }, { status: 409 });
  }

  const normalizedPhone = phone.replace(/\D/g, '');
  const docId = `${profileId}_${normalizedPhone}`;

  const existing = await adminDb.collection('eventRegistrations').doc(docId).get();
  if (existing.exists) {
    return NextResponse.json({ error: 'Vous êtes déjà inscrit à cet événement avec ce numéro' }, { status: 409 });
  }

  await adminDb.collection('eventRegistrations').doc(docId).set({
    profileId,
    name,
    email:          email || '',
    phone,
    ticketTypeId,
    ticketTypeName: ticketType.name,
    ticketPrice:    ticketType.price,
    registeredAt:   new Date().toISOString(),
  });

  return NextResponse.json({ success: true });
}
