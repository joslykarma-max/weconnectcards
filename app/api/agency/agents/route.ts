import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/session';
import { adminDb } from '@/lib/firebase-admin';
import type { AgentCardDoc } from '@/lib/types';

// POST — add a new agent
export async function POST(req: NextRequest) {
  const user = await requireAuth();
  const body = await req.json() as {
    fullName: string; function: string; mit: string; phone: string;
  };

  const { fullName, function: fn, mit, phone } = body;
  if (!fullName?.trim() || !mit?.trim()) {
    return NextResponse.json({ error: 'Nom et MIT requis.' }, { status: 400 });
  }

  const safeMit = mit.trim().replace(/[^a-zA-Z0-9]/g, '');
  const docId   = `${user.uid}_${safeMit}`;

  const agent: AgentCardDoc = {
    id:        safeMit,
    profileId: user.uid,
    fullName:  fullName.trim(),
    function:  fn?.trim() ?? '',
    mit:       safeMit,
    phone:     phone?.trim() ?? '',
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
