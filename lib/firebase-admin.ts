import admin from 'firebase-admin';

if (!admin.apps.length) {
  const projectId   = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey  = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

  if (projectId && clientEmail && privateKey) {
    try {
      admin.initializeApp({
        credential: admin.credential.cert({ projectId, clientEmail, privateKey }),
      });
    } catch (err) {
      console.error('[firebase-admin] initializeApp failed:', err);
    }
  } else {
    console.warn('[firebase-admin] Missing credentials — SDK not initialized');
  }
}

export const adminAuth = admin.apps.length ? admin.auth()      : null as unknown as admin.auth.Auth;
export const adminDb   = admin.apps.length ? admin.firestore() : null as unknown as admin.firestore.Firestore;

export default admin;
