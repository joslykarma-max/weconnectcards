import { NextRequest, NextResponse } from 'next/server';
import { eventForManager, eventStats } from '@/lib/events-server';

export const dynamic = 'force-dynamic';

/** Live figures, polled by the organiser screen. */
export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const guard = await eventForManager(id);
  if ('error' in guard) return NextResponse.json({ error: guard.error }, { status: guard.status });
  return NextResponse.json(await eventStats(guard.event), { headers: { 'Cache-Control': 'no-store' } });
}
