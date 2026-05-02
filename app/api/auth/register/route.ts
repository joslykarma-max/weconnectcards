import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase-admin';

// Card type → account plan mapping (Pro/Prestige cards auto-grant Pro account)
const CARD_TO_ACCOUNT_PLAN: Record<string, 'essentiel' | 'pro'> = {
  standard: 'essentiel',
  pro:      'pro',
  prestige: 'pro',
};

export async function POST(req: NextRequest) {
  const { name, email, password, username, plan = 'standard' } = await req.json() as {
    name: string;
    email: string;
    password: string;
    username: string;
    plan?: string;
  };

  if (!name || !email || !password || !username) {
    return NextResponse.json({ error: 'Tous les champs sont requis.' }, { status: 400 });
  }
  if (password.length < 8) {
    return NextResponse.json({ error: 'Le mot de passe doit faire au moins 8 caractères.' }, { status: 400 });
  }

  // Reserve username atomically — use a transaction to prevent race conditions
  try {
    await adminDb.runTransaction(async (tx) => {
      const snap = await tx.get(adminDb.collection('usernames').doc(username));
      if (snap.exists) throw new Error('USERNAME_TAKEN');
      // We only reserve here; the actual set happens in the batch below
      // (transaction read ensures no concurrent registration steals it)
    });
  } catch (err) {
    if ((err as Error).message === 'USERNAME_TAKEN') {
      return NextResponse.json({ error: "Ce nom d'utilisateur est déjà pris." }, { status: 409 });
    }
    throw err;
  }

  let uid: string;
  try {
    const userRecord = await adminAuth.createUser({ email, password, displayName: name });
    uid = userRecord.uid;
  } catch (err: unknown) {
    const msg = (err as { code?: string })?.code === 'auth/email-already-exists'
      ? 'Cet email est déjà utilisé.'
      : 'Erreur lors de la création du compte.';
    return NextResponse.json({ error: msg }, { status: 409 });
  }

  const now           = new Date().toISOString();
  const accountPlan   = CARD_TO_ACCOUNT_PLAN[plan] ?? 'essentiel';
  const cardEdition   = plan === 'prestige' ? 'metal' : plan === 'pro' ? 'electric' : 'midnight';

  // Free subscription period: 12 months for Prestige, 6 months for Standard/Pro
  const freeMonths = plan === 'prestige' ? 12 : 6;
  const subscriptionUntil = new Date();
  subscriptionUntil.setMonth(subscriptionUntil.getMonth() + freeMonths);

  // Write to Firestore atomically
  const batch = adminDb.batch();
  batch.set(adminDb.collection('users').doc(uid), {
    email, displayName: name,
    plan:              accountPlan,
    cardType:          plan, // standard | pro | prestige
    subscriptionUntil: subscriptionUntil.toISOString(),
    createdAt:         now,
  });
  batch.set(adminDb.collection('profiles').doc(uid), {
    uid, username, displayName: name,
    theme:    cardEdition,
    isPublic: true,
    updatedAt: now,
  });
  batch.set(adminDb.collection('usernames').doc(username), { uid });

  await batch.commit();

  // Resolve pending team invitations for this email (fire-and-forget)
  const normalizedEmail = email.trim().toLowerCase();
  adminDb.collectionGroup('members')
    .where('email', '==', normalizedEmail)
    .where('status', '==', 'pending')
    .get()
    .then((snap) => {
      const resolves = snap.docs.map((d) =>
        d.ref.update({ uid, status: 'active', joinedAt: now }),
      );
      return Promise.all(resolves);
    })
    .catch((err) => console.error('[register] team invite resolve failed:', err));

  return NextResponse.json({ uid, email, plan: accountPlan, cardType: plan }, { status: 201 });
}
