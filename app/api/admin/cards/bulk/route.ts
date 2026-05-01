import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin-auth';
import { adminDb } from '@/lib/firebase-admin';

// POST — bulk create in-stock cards (not yet assigned to any user)
export async function POST(req: NextRequest) {
  await requireAdmin();

  const { codes, edition } = await req.json() as { codes: string[]; edition?: string };

  if (!Array.isArray(codes) || codes.length === 0) {
    return NextResponse.json({ error: 'Aucun code fourni.' }, { status: 400 });
  }

  const cleanCodes = codes
    .map((c) => c.trim().toUpperCase())
    .filter((c) => c.length >= 4)
    .filter((c, i, arr) => arr.indexOf(c) === i);

  if (cleanCodes.length === 0) {
    return NextResponse.json({ error: 'Aucun code valide.' }, { status: 400 });
  }

  // Check which already exist
  const checks = await Promise.all(
    cleanCodes.map((c) => adminDb.collection('cards').where('nfcId', '==', c).limit(1).get()),
  );

  const created: string[] = [];
  const skipped: string[] = [];
  const now      = new Date().toISOString();
  const editionKey = edition || 'midnight';

  // Firestore batches max 500 ops — chunk just in case
  const batches: FirebaseFirestore.WriteBatch[] = [adminDb.batch()];
  let opsInCurrent = 0;

  cleanCodes.forEach((code, i) => {
    if (!checks[i].empty) { skipped.push(code); return; }
    if (opsInCurrent >= 450) { batches.push(adminDb.batch()); opsInCurrent = 0; }
    const ref = adminDb.collection('cards').doc();
    batches[batches.length - 1].set(ref, {
      nfcId:     code,
      edition:   editionKey,
      status:    'in_stock',
      stockedAt: now,
    });
    opsInCurrent++;
    created.push(code);
  });

  await Promise.all(batches.map((b) => b.commit()));

  return NextResponse.json({ created, skipped, total: cleanCodes.length });
}
