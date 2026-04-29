// One-time script: creates an admin Firebase Auth account and grants admin access.
// Usage: node scripts/create-admin.mjs
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// ── Parse .env.local ────────────────────────────────────────────────────────
const envFile = join(__dirname, '..', '.env.local');
const lines = readFileSync(envFile, 'utf8').split('\n');
for (const line of lines) {
  const match = line.match(/^([A-Z0-9_]+)="?([\s\S]*?)"?\s*$/);
  if (match) process.env[match[1]] = match[2];
}

// ── Firebase Admin init ──────────────────────────────────────────────────────
const { default: admin } = await import('firebase-admin');

admin.initializeApp({
  credential: admin.credential.cert({
    projectId:   process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey:  process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
  }),
});

const auth = admin.auth();
const db   = admin.firestore();

// ── Config ───────────────────────────────────────────────────────────────────
const ADMIN_EMAIL       = 'weconnectcards@gmail.com';
const ADMIN_DISPLAY     = 'Admin We Connect';

function randomPassword() {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#';
  return Array.from({ length: 16 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

// ── Main ─────────────────────────────────────────────────────────────────────
let uid;
let password;

try {
  // Check if user already exists
  const existing = await auth.getUserByEmail(ADMIN_EMAIL).catch(() => null);

  if (existing) {
    console.log('ℹ️  Un compte existe déjà pour', ADMIN_EMAIL);
    uid = existing.uid;
    password = '(mot de passe existant inchangé)';
  } else {
    password = randomPassword();
    const record = await auth.createUser({
      email:          ADMIN_EMAIL,
      password,
      displayName:    ADMIN_DISPLAY,
      emailVerified:  true,
    });
    uid = record.uid;
    console.log('✅ Compte Firebase Auth créé');
  }

  const now = new Date().toISOString();

  await Promise.all([
    // User doc (gives access to the dashboard)
    db.collection('users').doc(uid).set({
      email:       ADMIN_EMAIL,
      displayName: ADMIN_DISPLAY,
      plan:        'equipe',
      createdAt:   now,
    }, { merge: true }),

    // Admins doc (grants access to /admin panel)
    db.collection('admins').doc(uid).set({
      email:     ADMIN_EMAIL,
      createdAt: now,
    }, { merge: true }),
  ]);

  console.log('\n──────────────────────────────────────────');
  console.log('✅  Accès admin configuré avec succès');
  console.log('──────────────────────────────────────────');
  console.log('Email    :', ADMIN_EMAIL);
  if (password !== '(mot de passe existant inchangé)') {
    console.log('Mot de passe :', password);
    console.log('\n⚠️  Sauvegarde ce mot de passe — il ne sera plus affiché.');
  }
  console.log('UID      :', uid);
  console.log('Panel    : https://weconnect.io/admin');
  console.log('──────────────────────────────────────────\n');

} catch (err) {
  console.error('❌ Erreur :', err.message);
  process.exit(1);
}

process.exit(0);
