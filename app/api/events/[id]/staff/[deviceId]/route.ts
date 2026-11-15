import { NextRequest, NextResponse } from 'next/server';
import { devicesCol, eventForManager } from '@/lib/events-server';
import type { EventDeviceDoc } from '@/lib/events';

/** Remove a staff phone (lost phone, staff member gone). */
export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string; deviceId: string }> }) {
  const { id, deviceId } = await params;
  const guard = await eventForManager(id);
  if ('error' in guard) return NextResponse.json({ error: guard.error }, { status: guard.status });
  if (!/^[a-f0-9]{64}$/.test(deviceId)) return NextResponse.json({ error: 'Appareil introuvable.' }, { status: 404 });
  const ref  = devicesCol().doc(deviceId);
  const snap = await ref.get();
  if (!snap.exists || (snap.data() as EventDeviceDoc).eventId !== id) return NextResponse.json({ error: 'Appareil introuvable.' }, { status: 404 });
  await ref.update({ revoked: true });
  return NextResponse.json({ ok: true });
}
