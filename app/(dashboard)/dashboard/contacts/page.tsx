import { requireAuth } from '@/lib/session';
import { adminDb } from '@/lib/firebase-admin';
import type { SavedContactDoc } from '@/lib/types';
import ContactsClient from './ContactsClient';

export default async function ContactsPage() {
  const user = await requireAuth();

  const snap = await adminDb
    .collection('savedContacts')
    .where('profileId', '==', user.uid)
    .get();

  const contacts = snap.docs
    .map((d) => ({ id: d.id, ...(d.data() as SavedContactDoc) }))
    .sort((a, b) => b.savedAt.localeCompare(a.savedAt));

  return <ContactsClient contacts={contacts} />;
}
