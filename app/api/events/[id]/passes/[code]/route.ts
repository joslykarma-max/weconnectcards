import { NextRequest, NextResponse } from 'next/server';
import { eventForManager, isPassCode, passesCol } from '@/lib/events-server';
import type { EventPassDoc } from '@/lib/events';

/** Disable a lost / stolen pass, or switch it back on. */
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string; code: string }> }) {
  const { id, code } = await params;
  const guard = await eventForManager(id);
  if ('error' in guard) return NextResponse.json({ error: guard.error }, { status: guard.status });
  if (!isPassCode(code)) return NextResponse.json({ error: 'Pass introuvable.' }, { status: 404 });

  const ref  = passesCol().doc(code);
  const snap = await ref.get();
  if (!snap.exists || (snap.data() as EventPassDoc).eventId !== id) return NextResponse.json({ error: 'Pass introuvable.' }, { status: 404 });

  const body = await req.json().catch(() => ({})) as { status?: string };
  if (body.status !== 'active' && body.status !== 'disabled') return NextResponse.json({ error: 'Statut invalide.' }, { status: 400 });
  await ref.update({ status: body.status });
  return NextResponse.json({ ok: true });
}
