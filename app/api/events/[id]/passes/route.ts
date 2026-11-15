import { NextRequest, NextResponse } from 'next/server';
import { eventForManager, listPasses } from '@/lib/events-server';

export const dynamic = 'force-dynamic';

/** Passes of the event, for search and « lost wristband » handling (no URLs: they are the credentials). */
export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const guard = await eventForManager(id);
  if ('error' in guard) return NextResponse.json({ error: guard.error }, { status: guard.status });
  const passes = await listPasses(id);
  return NextResponse.json(passes.map((p) => ({
    code: p.code, serial: p.serial, categoryId: p.categoryId, support: p.support, status: p.status,
    holderName: p.holderName, ticketRef: p.ticketRef, entered: p.entered, inside: p.inside,
    firstEntryAt: p.firstEntryAt, lastEntryAt: p.lastEntryAt,
  })), { headers: { 'Cache-Control': 'no-store' } });
}
