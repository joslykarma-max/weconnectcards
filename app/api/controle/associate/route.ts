import { NextRequest, NextResponse } from 'next/server';
import { associateTicket, currentDevice, isPassCode, loadEvent } from '@/lib/events-server';

/** Welcome desk: link the ticket bought on a ticketing platform to the pass just tapped. */
export async function POST(req: NextRequest) {
  const device = await currentDevice();
  if (!device || device.mode !== 'guichet') {
    return NextResponse.json({ error: 'not_desk' }, { status: 403 });
  }
  const event = await loadEvent(device.eventId);
  if (!event || event.status === 'archived') return NextResponse.json({ error: 'wrong_event' }, { status: 403 });

  const body = await req.json().catch(() => ({})) as { code?: string; ticketRef?: string; holderName?: string };
  const code = (body.code ?? '').toUpperCase();
  if (!isPassCode(code) || !body.ticketRef?.trim()) return NextResponse.json({ error: 'pass_not_found' }, { status: 400 });

  const result = await associateTicket(event, code, body.ticketRef, body.holderName ?? null);
  if (!result.ok) return NextResponse.json({ error: result.error, serial: result.serial ?? null }, { status: 409 });
  return NextResponse.json({ ok: true, serial: result.serial });
}
