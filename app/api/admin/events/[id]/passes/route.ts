import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin-auth';
import { createPasses, listPasses, loadEvent, passUrl } from '@/lib/events-server';
import { SUPPORT_LABELS, type SupportType } from '@/lib/events';
import { cleanPrefix } from '@/lib/events-validate';

const bad = (error: string, status = 400) => NextResponse.json({ error }, { status });
const SUPPORTS: SupportType[] = ['carte', 'bracelet', 'badge'];

/** Creates a batch of passes (one per physical support to encode). */
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const event = await loadEvent(id);
  if (!event) return bad('Événement introuvable.', 404);

  const body = await req.json().catch(() => ({})) as { categoryId?: string; quantity?: number; support?: string; prefix?: string };
  const quantity = Math.floor(Number(body.quantity));
  const category = event.categories.find((c) => c.id === body.categoryId);
  const prefix   = cleanPrefix(body.prefix) || cleanPrefix(category?.name) || 'PASS';
  if (!category) return bad('Choisissez une catégorie.');
  if (!(quantity >= 1 && quantity <= 5000)) return bad('Quantité entre 1 et 5 000.');
  if (!SUPPORTS.includes(body.support as SupportType)) return bad('Type de support invalide.');

  const batch = await createPasses(id, { categoryId: category.id, quantity, support: body.support as SupportType, prefix });
  return NextResponse.json(batch);
}

/** CSV for the encoding workshop: one line per support, with the URL to write on the chip. */
export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const event = await loadEvent(id);
  if (!event) return bad('Événement introuvable.', 404);

  const passes = await listPasses(id);
  const cat = (cid: string) => event.categories.find((c) => c.id === cid)?.name ?? cid;
  const esc = (v: string) => `"${v.replace(/"/g, '""')}"`;
  const lines = [
    ['Numéro', 'Catégorie', 'Support', 'URL à encoder', 'Lot', 'Statut'].join(';'),
    ...passes.map((p) => [p.serial, cat(p.categoryId), SUPPORT_LABELS[p.support], passUrl(p.code), p.batchId, p.status === 'active' ? 'actif' : 'désactivé'].map(esc).join(';')),
  ];
  const filename = `encodage-${event.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 40)}.csv`;
  return new NextResponse('﻿' + lines.join('\r\n'), {
    headers: { 'Content-Type': 'text/csv; charset=utf-8', 'Content-Disposition': `attachment; filename="${filename}"` },
  });
}
