import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import '@/lib/firebase-admin';

export async function GET(req: NextRequest) {
  const profileId = req.nextUrl.searchParams.get('profileId');
  if (!profileId) return NextResponse.json({ error: 'profileId requis' }, { status: 400 });

  const snap = await adminDb.collection('eventRegistrations')
    .where('profileId', '==', profileId)
    .get();

  const counts: Record<string, number> = {};
  snap.forEach(doc => {
    const { ticketTypeId } = doc.data() as { ticketTypeId: string };
    counts[ticketTypeId] = (counts[ticketTypeId] || 0) + 1;
  });

  return NextResponse.json({ counts, total: snap.size });
}
