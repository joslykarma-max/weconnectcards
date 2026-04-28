import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import '@/lib/firebase-admin';

export async function POST(req: NextRequest) {
  const { profileId, name, email, phone, ticketTypeId, ticketTypeName, ticketPrice } = await req.json();

  if (!profileId || !name || !phone || !ticketTypeId) {
    return NextResponse.json({ error: 'Champs requis manquants' }, { status: 400 });
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
    ticketTypeName,
    ticketPrice:    ticketPrice || 0,
    registeredAt:   new Date().toISOString(),
  });

  return NextResponse.json({ success: true });
}
