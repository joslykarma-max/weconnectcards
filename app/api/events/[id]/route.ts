import { NextRequest, NextResponse } from 'next/server';
import { eventForManager, eventsCol } from '@/lib/events-server';
import { cleanContent } from '@/lib/events-validate';

/** The organiser edits what guests see on their pass (description, poster, programme, links). */
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const guard = await eventForManager(id);
  if ('error' in guard) return NextResponse.json({ error: guard.error }, { status: guard.status });
  const body = await req.json().catch(() => ({})) as Record<string, unknown>;
  await eventsCol().doc(id).update({ ...cleanContent(body), updatedAt: new Date().toISOString() });
  return NextResponse.json({ ok: true });
}
