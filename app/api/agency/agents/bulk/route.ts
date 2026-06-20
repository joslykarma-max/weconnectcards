import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/session';
import { adminDb } from '@/lib/firebase-admin';
import type { AgentCardDoc } from '@/lib/types';
import { generateAgentCode } from '@/app/api/agency/agents/route';

interface BulkInput {
  fullName: string;
  phone?:   string;
  zone?:    string;
  function?: string;
}

// POST — add many agents at once (bulk import)
export async function POST(req: NextRequest) {
  const user = await requireAuth();
  const body = await req.json() as { agents: BulkInput[] };

  const list = body.agents;
  if (!Array.isArray(list) || list.length === 0) {
    return NextResponse.json({ error: 'Liste vide.' }, { status: 400 });
  }
  if (list.length > 200) {
    return NextResponse.json({ error: 'Maximum 200 agents par import.' }, { status: 400 });
  }

  const batch    = adminDb.batch();
  const used     = new Set<string>();
  const created: AgentCardDoc[] = [];

  for (const raw of list) {
    const fullName = raw.fullName?.trim();
    if (!fullName) continue;

    let code = generateAgentCode(raw.phone).replace(/[^a-zA-Z0-9]/g, '');
    while (used.has(code)) code = generateAgentCode(raw.phone).replace(/[^a-zA-Z0-9]/g, '');
    used.add(code);

    const agent: AgentCardDoc = {
      id:        code,
      profileId: user.uid,
      fullName,
      function:  raw.function?.trim() ?? '',
      mit:       code,
      phone:     raw.phone?.trim() ?? '',
      zone:      raw.zone?.trim() || undefined,
      isActive:  true,
      createdAt: new Date().toISOString(),
    };

    const docId = `${user.uid}_${code}`;
    batch.set(adminDb.collection('agentCards').doc(docId), agent);
    created.push(agent);
  }

  if (created.length === 0) {
    return NextResponse.json({ error: 'Aucun agent valide (nom requis).' }, { status: 400 });
  }

  await batch.commit();
  return NextResponse.json({ agents: created, count: created.length });
}
