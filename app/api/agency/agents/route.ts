import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/session';
import { adminDb } from '@/lib/firebase-admin';
import type { AgentCardDoc } from '@/lib/types';

// Generates a unique-ish agent code from phone digits (or random) — used when no MIT is supplied.
export function generateAgentCode(phone?: string): string {
  const fromPhone = (phone ?? '').replace(/\D/g, '').slice(-6);
  const suffix    = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `${fromPhone || 'AG'}${suffix}`;
}

// POST — add a new agent
export async function POST(req: NextRequest) {
  const user = await requireAuth();
  const body = await req.json() as {
    fullName: string; function?: string; mit?: string; phone?: string; zone?: string;
  };

  const { fullName, function: fn, mit, phone, zone } = body;
  if (!fullName?.trim()) {
    return NextResponse.json({ error: 'Nom requis.' }, { status: 400 });
  }

  const rawMit  = mit?.trim() || generateAgentCode(phone);
  const safeMit = rawMit.replace(/[^a-zA-Z0-9]/g, '') || generateAgentCode(phone);
  const docId   = `${user.uid}_${safeMit}`;

  const agent: AgentCardDoc = {
    id:        safeMit,
    profileId: user.uid,
    fullName:  fullName.trim(),
    function:  fn?.trim() ?? '',
    mit:       safeMit,
    phone:     phone?.trim() ?? '',
    zone:      zone?.trim() || undefined,
    isActive:  true,
    createdAt: new Date().toISOString(),
  };

  await adminDb.collection('agentCards').doc(docId).set(agent);
  return NextResponse.json({ agent });
}

// PATCH — update agent fields (e.g. photoUrl)
export async function PATCH(req: NextRequest) {
  const user = await requireAuth();
  const { mit, photoUrl } = await req.json() as { mit: string; photoUrl: string };

  if (!mit || !photoUrl) return NextResponse.json({ error: 'MIT et photoUrl requis.' }, { status: 400 });

  const docId = `${user.uid}_${mit}`;
  const snap  = await adminDb.collection('agentCards').doc(docId).get();

  if (!snap.exists || (snap.data() as AgentCardDoc).profileId !== user.uid) {
    return NextResponse.json({ error: 'Non autorisé.' }, { status: 403 });
  }

  await adminDb.collection('agentCards').doc(docId).update({ photoUrl });
  return NextResponse.json({ ok: true });
}

// DELETE — remove an agent
export async function DELETE(req: NextRequest) {
  const user = await requireAuth();
  const mit  = new URL(req.url).searchParams.get('mit');
  if (!mit) return NextResponse.json({ error: 'MIT requis.' }, { status: 400 });

  const docId = `${user.uid}_${mit}`;
  const snap  = await adminDb.collection('agentCards').doc(docId).get();

  if (!snap.exists || (snap.data() as AgentCardDoc).profileId !== user.uid) {
    return NextResponse.json({ error: 'Non autorisé.' }, { status: 403 });
  }

  await adminDb.collection('agentCards').doc(docId).update({ isActive: false });
  return NextResponse.json({ ok: true });
}
