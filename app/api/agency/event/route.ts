import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import type { AgentEventDoc } from '@/lib/types';

export async function POST(req: NextRequest) {
  const body = await req.json() as {
    profileId: string;
    agentId:   string;
    action:    AgentEventDoc['action'];
  };

  const { profileId, agentId, action } = body;

  const VALID_ACTIONS: AgentEventDoc['action'][] = ['page_view', 'app_client', 'app_driver', 'contact'];
  if (!profileId || !agentId || !VALID_ACTIONS.includes(action)) {
    return NextResponse.json({ error: 'Paramètres invalides.' }, { status: 400 });
  }

  const docRef = adminDb.collection('agentEvents').doc();
  const event: AgentEventDoc = {
    id:        docRef.id,
    profileId,
    agentId,
    action,
    timestamp: new Date().toISOString(),
    userAgent: req.headers.get('user-agent') ?? undefined,
  };

  await docRef.set(event);
  return NextResponse.json({ ok: true });
}
