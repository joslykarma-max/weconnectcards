import { cache } from 'react';
import { adminDb } from './firebase-admin';

/** users/{uid}, read once per request and shared by the dashboard layout and its pages. */
export const getUserSnap = cache((uid: string) => adminDb.collection('users').doc(uid).get());
