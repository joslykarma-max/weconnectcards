import { adminDb } from '@/lib/firebase-admin';
import CustomModulesAdminClient from './CustomModulesAdminClient';
import type { CustomModuleRequestDoc } from '@/lib/types';

export default async function CustomModulesAdminPage() {
  const snap = await adminDb
    .collection('customModuleRequests')
    .get();

  const requests = snap.docs
    .map((d) => d.data() as CustomModuleRequestDoc)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return <CustomModulesAdminClient requests={requests} />;
}
