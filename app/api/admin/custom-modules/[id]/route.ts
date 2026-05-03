import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { adminDb } from '@/lib/firebase-admin';
import type { CustomModuleRequestDoc } from '@/lib/types';

async function checkAdmin(uid: string): Promise<boolean> {
  const envAdmins = (process.env.ADMIN_UIDS ?? '').split(',').map(s => s.trim()).filter(Boolean);
  if (envAdmins.includes(uid)) return true;
  const snap = await adminDb.collection('admins').doc(uid).get();
  return snap.exists;
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Non authentifié.' }, { status: 401 });
  if (!await checkAdmin(session.uid)) return NextResponse.json({ error: 'Non autorisé.' }, { status: 403 });

  const { id } = await params;
  const patch   = await req.json() as { status?: CustomModuleRequestDoc['status']; adminNote?: string };

  const allowed: Partial<CustomModuleRequestDoc> = { updatedAt: new Date().toISOString() };
  if (patch.status    !== undefined) allowed.status    = patch.status;
  if (patch.adminNote !== undefined) allowed.adminNote = patch.adminNote;

  await adminDb.collection('customModuleRequests').doc(id).update(allowed);
  return NextResponse.json({ success: true });
}
