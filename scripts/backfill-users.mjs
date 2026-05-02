/**
 * scripts/backfill-users.mjs
 *
 * One-shot script to backfill new fields for existing users/cards.
 * Run ONCE from the project root:
 *
 *   FIREBASE_PROJECT_ID=xxx FIREBASE_CLIENT_EMAIL=xxx FIREBASE_PRIVATE_KEY="xxx" \
 *   node scripts/backfill-users.mjs
 *
 * Safe to re-run (skips records that already have the field).
 */

import admin from 'firebase-admin';

const { FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY } = process.env;

if (!FIREBASE_PROJECT_ID || !FIREBASE_CLIENT_EMAIL || !FIREBASE_PRIVATE_KEY) {
  console.error('Missing Firebase env vars. Set FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY.');
  process.exit(1);
}

admin.initializeApp({
  credential: admin.credential.cert({
    projectId:   FIREBASE_PROJECT_ID,
    clientEmail: FIREBASE_CLIENT_EMAIL,
    privateKey:  FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
  }),
});

const db = admin.firestore();

async function backfillUsers() {
  console.log('→ Backfilling users collection…');
  const snap = await db.collection('users').get();
  let updated = 0;

  for (const doc of snap.docs) {
    const data = doc.data();
    const patch = {};

    // cardType: derive from plan if missing
    if (!data.cardType) {
      patch.cardType = data.plan === 'pro' || data.plan === 'equipe' ? 'pro' : 'standard';
    }

    // subscriptionUntil: set 12 months from createdAt if missing
    if (!data.subscriptionUntil && data.createdAt) {
      const base = new Date(data.createdAt);
      base.setMonth(base.getMonth() + 12);
      patch.subscriptionUntil = base.toISOString();
    }

    if (Object.keys(patch).length > 0) {
      await doc.ref.set(patch, { merge: true });
      updated++;
      console.log(`  ✓ ${doc.id} (${data.email}) →`, patch);
    }
  }

  console.log(`  Done. ${updated}/${snap.size} users updated.\n`);
}

async function backfillCards() {
  console.log('→ Backfilling cards collection…');
  const snap = await db.collection('cards').get();
  let updated = 0;

  for (const doc of snap.docs) {
    const data = doc.data();
    const patch = {};

    if (data.metallic === undefined) patch.metallic = false;
    if (data.pvcColor === undefined && data.metallic !== true) patch.pvcColor = 'black';
    if (data.cardType === undefined && data.userId) {
      // Try to derive from user
      try {
        const userSnap = await db.collection('users').doc(data.userId).get();
        patch.cardType = userSnap.data()?.cardType ?? 'standard';
      } catch { patch.cardType = 'standard'; }
    }

    if (Object.keys(patch).length > 0) {
      await doc.ref.set(patch, { merge: true });
      updated++;
    }
  }

  console.log(`  Done. ${updated}/${snap.size} cards updated.\n`);
}

(async () => {
  try {
    await backfillUsers();
    await backfillCards();
    console.log('✅ Backfill complete.');
    process.exit(0);
  } catch (err) {
    console.error('❌ Backfill failed:', err);
    process.exit(1);
  }
})();
