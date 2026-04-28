import { requireAuth } from '@/lib/session';
import { adminDb } from '@/lib/firebase-admin';
import AccessDashboard from './AccessDashboard';
import type { ModuleDoc, AccessZone, AccessLog } from '@/lib/types';

export default async function AccessPage() {
  const user = await requireAuth();

  const snap   = await adminDb.collection('modules').doc(`${user.uid}_access`).get();
  const config = snap.exists ? ((snap.data() as ModuleDoc).config ?? {}) : {};

  const logSnap = await adminDb.collection('accessLogs')
    .where('profileId', '==', user.uid)
    .get();
  const logs: AccessLog[] = logSnap.docs.map(d => d.data() as AccessLog);

  return (
    <AccessDashboard
      initialBadge={{
        title:       String(config.title       ?? ''),
        holderName:  String(config.holderName  ?? ''),
        holderRole:  String(config.holderRole  ?? ''),
        holderPhoto: String(config.holderPhoto ?? ''),
      }}
      initialZones={(config.zones as AccessZone[] | undefined) ?? []}
      initialLogs={logs}
    />
  );
}
