import { requireAuth } from '@/lib/session';
import { adminDb } from '@/lib/firebase-admin';
import { ownerMedicalConfig } from '@/lib/medical';
import type { ModuleDoc } from '@/lib/types';
import MedicalForm from './MedicalForm';

/** Medical card settings — loads what is saved (the PIN itself never leaves the server). */
export default async function MedicalPage() {
  const user = await requireAuth();
  const snap = await adminDb.collection('modules').doc(`${user.uid}_medical`).get();
  const config = snap.exists ? ((snap.data() as ModuleDoc).config ?? {}) as Record<string, unknown> : {};
  return <MedicalForm initial={ownerMedicalConfig(config)} />;
}
