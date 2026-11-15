import { NextRequest, NextResponse } from 'next/server';
import { eventForManager, listPasses } from '@/lib/events-server';
import { SUPPORT_LABELS, formatEventDate } from '@/lib/events';

export const dynamic = 'force-dynamic';

/** Spreadsheet of passes and attendance for the organiser. */
export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const guard = await eventForManager(id);
  if ('error' in guard) return NextResponse.json({ error: guard.error }, { status: guard.status });
  const { event } = guard;
  const passes = await listPasses(id);
  const cat = (cid: string) => event.categories.find((c) => c.id === cid)?.name ?? cid;
  const esc = (v: string | number | null) => `"${String(v ?? '').replace(/"/g, '""')}"`;
  const lines = [
    ['Numéro', 'Catégorie', 'Support', 'Statut', 'Participant', 'Billet', 'Entré', 'Première entrée', 'Dernière entrée', 'Entrées'].join(';'),
    ...passes.map((p) => [
      p.serial, cat(p.categoryId), SUPPORT_LABELS[p.support], p.status === 'active' ? 'actif' : 'désactivé',
      p.holderName, p.ticketRef, p.entered ? 'oui' : 'non', formatEventDate(p.firstEntryAt), formatEventDate(p.lastEntryAt), p.entriesCount,
    ].map(esc).join(';')),
  ];
  const filename = `entrees-${event.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 40)}.csv`;
  return new NextResponse('﻿' + lines.join('\r\n'), {
    headers: { 'Content-Type': 'text/csv; charset=utf-8', 'Content-Disposition': `attachment; filename="${filename}"` },
  });
}
