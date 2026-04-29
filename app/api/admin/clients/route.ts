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

// PATCH — update a client's plan
export async function PATCH(req: NextRequest) {
  await requireAdmin();

  const body = await req.json() as { uid?: string; plan?: string };
  const { uid, plan } = body;

  if (!uid?.trim())  return NextResponse.json({ error: 'uid requis.' }, { status: 400 });
  if (!plan?.trim()) return NextResponse.json({ error: 'plan requis.' }, { status: 400 });

  const validPlans = ['essentiel', 'pro', 'equipe'];
  if (!validPlans.includes(plan)) {
    return NextResponse.json({ error: 'Plan invalide.' }, { status: 400 });
  }

  await adminDb.collection('users').doc(uid).update({ plan, updatedAt: new Date().toISOString() });
  return NextResponse.json({ success: true });
}
