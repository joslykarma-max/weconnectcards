import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase-admin';
import { rateLimit, getClientIp } from '@/lib/rate-limit';

// Card type → account plan mapping (Pro/Prestige cards auto-grant Pro account)
const CARD_TO_ACCOUNT_PLAN: Record<string, 'essentiel' | 'pro'> = {
  standard: 'essentiel',
  pro:      'pro',
  prestige: 'pro',
};

function toSlug(raw: string): string {
  return raw.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '').replace(/-+/g, '-').replace(/^-|-$/g, '');
}

export async function POST(req: NextRequest) {
  if (!rateLimit(getClientIp(req), 5, 60_000)) {
    return NextResponse.json({ error: 'Trop de tentatives. Réessaie dans une minute.' }, { status: 429 });
  }

  let body: unknown;
  try { body = await req.json(); } catch { return NextResponse.json({ error: 'Corps de requête invalide' }, { status: 400 }); }

  const { name, email, password, username: rawUsername, plan = 'standard' } = body as {
    name: string;
    email: string;
    password: string;
    username: string;
    plan?: string;
  };

  if (!name || !email || !password || !rawUsername) {
    return NextResponse.json({ error: 'Tous les champs sont requis.' }, { status: 400 });
  }
  if (password.length < 8) {
    return NextResponse.json({ error: 'Le mot de passe doit faire au moins 8 caractères.' }, { status: 400 });
  }

  // Sanitize and validate username server-side
  const username = toSlug(rawUsername);
  if (username.length < 3 || username.length > 30) {
    return NextResponse.json({ error: "Le nom d'utilisateur doit faire entre 3 et 30 caractères." }, { status: 400 });
  }

  // Reserve username atomically — use a transaction to prevent race conditions
  try {
    await adminDb.runTransaction(async (tx) => {
      const snap = await tx.get(adminDb.collection('usernames').doc(username));
      if (snap.exists) throw new Error('USERNAME_TAKEN');
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
    cardType:          plan,
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
