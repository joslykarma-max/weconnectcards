import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin-auth';
import { adminDb } from '@/lib/firebase-admin';
import type { UserDoc } from '@/lib/types';

// GET — list all clients
export async function GET() {
  await requireAdmin();
  const snap = await adminDb.collection('users').get();
  const clients = snap.docs.map(d => ({ uid: d.id, ...(d.data() as UserDoc) }));
  return NextResponse.json(clients);
}

// PATCH — update a client's plan, cardType, or subscription expiration
export async function PATCH(req: NextRequest) {
  await requireAdmin();

  const body = await req.json() as {
    uid?: string;
    plan?: string;
    cardType?: 'standard' | 'pro' | 'prestige';
    subscriptionUntil?: string;
    extendMonths?: number; // raccourci pour ajouter X mois au subscriptionUntil
  };
  const { uid } = body;

  if (!uid?.trim()) return NextResponse.json({ error: 'uid requis.' }, { status: 400 });

  const update: Record<string, string> = { updatedAt: new Date().toISOString() };

  if (body.plan) {
    const validPlans = ['essentiel', 'pro', 'equipe'];
    if (!validPlans.includes(body.plan)) {
      return NextResponse.json({ error: 'Plan invalide.' }, { status: 400 });
    }
    update.plan = body.plan;
  }

  if (body.cardType) {
    const validCardTypes = ['standard', 'pro', 'prestige'];
    if (!validCardTypes.includes(body.cardType)) {
      return NextResponse.json({ error: 'cardType invalide.' }, { status: 400 });
    }
    update.cardType = body.cardType;
  }

  if (body.subscriptionUntil) {
    update.subscriptionUntil = body.subscriptionUntil;
  } else if (typeof body.extendMonths === 'number' && body.extendMonths > 0) {
    const userSnap = await adminDb.collection('users').doc(uid).get();
    const cur = (userSnap.data() as { subscriptionUntil?: string } | undefined)?.subscriptionUntil;
    const base = cur && new Date(cur) > new Date() ? new Date(cur) : new Date();
    base.setMonth(base.getMonth() + body.extendMonths);
    update.subscriptionUntil = base.toISOString();
  }

  if (Object.keys(update).length === 1) {
    return NextResponse.json({ error: 'Aucun champ à modifier.' }, { status: 400 });
  }

  await adminDb.collection('users').doc(uid).update(update);
  return NextResponse.json({ success: true, update });
}
