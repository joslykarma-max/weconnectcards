import { NextRequest, NextResponse } from 'next/server';
import { FieldValue, type DocumentReference, type WriteBatch } from 'firebase-admin/firestore';
import { requireAdmin } from '@/lib/admin-auth';
import { adminDb } from '@/lib/firebase-admin';
import type { UsernameDoc } from '@/lib/profiles';
import { getStandaloneCard } from '@/lib/standalone-server';
import { resolveDisplayMode } from '@/lib/display-mode';
import {
  RESERVED_USERNAMES, defaultLinkLabel, isDisplayMode, isSafeUrl, isStandaloneEdition, isStandaloneLinkType,
  linkUrlFromValue, normalizeRedirectUrl, slugify, standaloneUid,
  type StandaloneEdition, type StandalonePayload,
} from '@/lib/standalone';
import type { CardDoc, LinkDoc, ProfileDoc } from '@/lib/types';

// "Cartes sans compte" — admin-managed cards that are never linked to a user account.

const bad = (error: string, status = 400) => NextResponse.json({ error }, { status });

const cardsCol     = () => adminDb.collection('cards');
const profilesCol  = () => adminDb.collection('profiles');
const usernamesCol = () => adminDb.collection('usernames');

const text = (v: unknown, max: number) => (typeof v === 'string' ? v.trim().slice(0, max) : '');

const CODE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // same alphabet as the stock generator
function randomCode(): string {
  let code = 'WC-';
  for (let i = 0; i < 6; i++) code += CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)];
  return code;
}

async function findCardByCode(code: string) {
  const snap = await cardsCol().where('nfcId', '==', code).limit(1).get();
  return snap.empty ? null : snap.docs[0];
}

async function generateCode(): Promise<string> {
  for (let i = 0; i < 10; i++) {
    const code = randomCode();
    if (!(await findCardByCode(code))) return code;
  }
  throw new Error('NFC code generation failed');
}

async function usernameFree(username: string, profileId?: string): Promise<boolean> {
  if (username.length < 2 || RESERVED_USERNAMES.has(username)) return false;
  const snap = await usernamesCol().doc(username).get();
  if (!snap.exists) return true;
  const owner = snap.data() as UsernameDoc;
  return !!profileId && (owner.profileId ?? owner.uid) === profileId;
}

async function autoUsername(name: string): Promise<string> {
  const root = slugify(name).length >= 2 ? slugify(name) : 'carte';
  for (let i = 1; i <= 8; i++) {
    const candidate = i === 1 ? root : `${root}-${i}`;
    if (await usernameFree(candidate)) return candidate;
  }
  return `${root}-${randomCode().slice(3).toLowerCase()}`;
}

function parseRedirect(raw: unknown): string | null {
  const url = normalizeRedirectUrl(text(raw, 1000));
  if (!url || !isSafeUrl(url)) return null;
  if (/^https?:/i.test(url)) {
    try { new URL(url); } catch { return null; }
  }
  return url;
}

type ParsedLink = Pick<LinkDoc, 'type' | 'label' | 'url'>;

function parseLinks(input: unknown): { links: ParsedLink[] } | { error: string } {
  if (!Array.isArray(input)) return { links: [] };
  const links: ParsedLink[] = [];
  for (const raw of input as Array<Record<string, unknown>>) {
    const type  = typeof raw?.type === 'string' ? raw.type : '';
    const value = text(raw?.value, 500);
    if (!value) continue; // empty rows are ignored
    if (!isStandaloneLinkType(type)) return { error: 'Type de lien inconnu.' };
    const url = linkUrlFromValue(type, value);
    if (!isSafeUrl(url) || url === 'https://wa.me/') return { error: `Lien invalide : ${value}` };
    links.push({ type, label: text(raw.label, 60) || defaultLinkLabel(type), url });
  }
  if (links.length > 20) return { error: '20 liens maximum.' };
  return { links };
}

const isStorageUrl = (url: string) =>
  /^https:\/\/(storage\.googleapis\.com|firebasestorage\.googleapis\.com)\//.test(url);

/**
 * Creates or updates the public profile of a card without account, inside `batch`.
 * Returns the profile id, or an error message for the admin.
 */
async function upsertProfile(
  batch: WriteBatch,
  { cardId, edition, payload, existing }: {
    cardId:   string;
    edition:  StandaloneEdition;
    payload:  StandalonePayload;
    existing: { ref: DocumentReference; data: ProfileDoc } | null;
  },
): Promise<{ profileId: string } | { error: string; status?: number }> {
  const p           = payload.profile ?? ({} as StandalonePayload['profile']);
  const displayName = text(p.displayName, 80);
  if (!displayName) return { error: 'Le nom affiché est requis.' };

  const avatar = text(p.avatar, 500);
  if (avatar && !isStorageUrl(avatar)) return { error: 'Photo invalide — téléverse-la depuis le formulaire.' };

  const parsed = parseLinks(payload.links);
  if ('error' in parsed) return { error: parsed.error };

  const uid        = standaloneUid(cardId);
  const profileRef = existing?.ref ?? profilesCol().doc();
  const wanted     = slugify(text(p.username, 60));
  const now        = new Date().toISOString();

  // Public username (weconnect.cards/<username>)
  let username = existing?.data.username ?? '';
  if (wanted && wanted !== username) {
    if (!(await usernameFree(wanted, profileRef.id))) {
      return { error: `L'adresse weconnect.cards/${wanted} est déjà prise.`, status: 409 };
    }
    if (username) batch.delete(usernamesCol().doc(username));
    username = wanted;
    batch.create(usernamesCol().doc(username), { uid, profileId: profileRef.id });
  } else if (!username) {
    username = await autoUsername(displayName);
    batch.create(usernamesCol().doc(username), { uid, profileId: profileRef.id });
  }

  const optional = (v: string) => v || (existing ? FieldValue.delete() : undefined);
  const fields: Record<string, unknown> = {
    uid,
    username,
    displayName,
    title:       optional(text(p.title, 100)),
    company:     optional(text(p.company, 100)),
    bio:         optional(text(p.bio, 500)),
    tagline:     optional(text(p.tagline, 120)),
    avatar:      optional(avatar),
    theme:       edition,
    displayMode: isDisplayMode(p.displayMode) ? p.displayMode : resolveDisplayMode(existing?.data.displayMode),
    isPublic:    true,
    standalone:  true,
    cardId,
    updatedAt:   now,
    ...(existing ? {} : { inDirectory: false }),
  };
  Object.keys(fields).forEach((k) => fields[k] === undefined && delete fields[k]);
  batch.set(profileRef, fields, { merge: true });

  // Links are replaced as a whole by what the form sends
  if (existing) {
    const current = await profileRef.collection('links').get();
    current.docs.forEach((d) => batch.delete(d.ref));
  }
  parsed.links.forEach((l, i) => {
    const ref  = profileRef.collection('links').doc();
    const link: LinkDoc = { id: ref.id, ...l, order: i, isActive: true };
    batch.set(ref, link);
  });

  return { profileId: profileRef.id };
}

async function commit(batch: WriteBatch): Promise<NextResponse | null> {
  try {
    await batch.commit();
    return null;
  } catch (err) {
    // batch.create on usernames/{u} → someone took the address in the meantime
    if ((err as { code?: number }).code === 6) return bad('Cette adresse de profil vient d\'être prise. Réessaie.', 409);
    throw err;
  }
}

// POST — create a card without account
export async function POST(req: NextRequest) {
  await requireAdmin();
  const payload = await req.json() as StandalonePayload;

  const mode    = payload.mode === 'redirect' ? 'redirect' : 'profile';
  const edition = isStandaloneEdition(payload.edition) ? payload.edition : 'midnight';
  const label   = text(payload.label, 60);

  let redirectUrl: string | null = null;
  if (mode === 'redirect') {
    redirectUrl = parseRedirect(payload.redirectUrl);
    if (!redirectUrl) return bad('Lien de redirection invalide.');
  }

  // NFC code: typed (new or taken from the stock) or generated
  let code = text(payload.nfcId, 40).toUpperCase();
  let cardRef: DocumentReference | null = null;
  if (code) {
    if (!/^[A-Z0-9-]{4,40}$/.test(code)) return bad('Code NFC invalide (lettres, chiffres et tirets, 4 caractères minimum).');
    const existing = await findCardByCode(code);
    if (existing) {
      const data = existing.data() as CardDoc;
      if (data.status !== 'in_stock' || data.userId || data.standalone) {
        return bad('Ce code NFC est déjà utilisé par une autre carte.', 409);
      }
      cardRef = existing.ref; // an unclaimed stock card becomes a card without account
    }
  } else {
    code = await generateCode();
  }
  cardRef ??= cardsCol().doc();

  const batch = adminDb.batch();
  let profileId: string | null = null;

  if (mode === 'profile') {
    const res = await upsertProfile(batch, { cardId: cardRef.id, edition, payload, existing: null });
    if ('error' in res) return bad(res.error, res.status);
    profileId = res.profileId;
  }

  const now = new Date().toISOString();
  batch.set(cardRef, {
    nfcId:       code,
    edition,
    status:      'active',
    standalone:  true,
    activatedAt: now,
    createdAt:   now,
    ...(label       ? { label }       : {}),
    ...(redirectUrl ? { redirectUrl } : {}),
    ...(profileId   ? { profileId }   : {}),
  }, { merge: true }); // merge keeps stockedAt when the card comes from the stock

  const failed = await commit(batch);
  if (failed) return failed;

  return NextResponse.json({ card: await getStandaloneCard(cardRef.id) }, { status: 201 });
}

// PATCH — update a card without account (full form payload)
export async function PATCH(req: NextRequest) {
  await requireAdmin();
  const payload = await req.json() as StandalonePayload;
  if (!payload.cardId) return bad('cardId requis.');

  const cardRef  = cardsCol().doc(payload.cardId);
  const cardSnap = await cardRef.get();
  const card     = cardSnap.exists ? (cardSnap.data() as CardDoc) : null;
  if (!card?.standalone) return bad('Carte introuvable.', 404);

  const mode    = payload.mode === 'redirect' ? 'redirect' : 'profile';
  const edition = isStandaloneEdition(payload.edition) ? payload.edition : 'midnight';
  const label   = text(payload.label, 60);
  const batch   = adminDb.batch();

  const cardUpdate: Record<string, unknown> = {
    label:   label || FieldValue.delete(),
    edition,
    ...(typeof payload.active === 'boolean' ? { status: payload.active ? 'active' : 'inactive' } : {}),
  };

  if (mode === 'redirect') {
    const redirectUrl = parseRedirect(payload.redirectUrl);
    if (!redirectUrl) return bad('Lien de redirection invalide.');
    cardUpdate.redirectUrl = redirectUrl;
    // The profile (if any) is kept untouched for a later switch back
  } else {
    cardUpdate.redirectUrl = FieldValue.delete();

    const profileRef  = card.profileId ? profilesCol().doc(card.profileId) : null;
    const profileSnap = profileRef ? await profileRef.get() : null;
    const existing    = profileRef && profileSnap?.exists
      ? { ref: profileRef, data: profileSnap.data() as ProfileDoc }
      : null;

    const res = await upsertProfile(batch, { cardId: cardSnap.id, edition, payload, existing });
    if ('error' in res) return bad(res.error, res.status);
    cardUpdate.profileId = res.profileId;
  }

  batch.update(cardRef, cardUpdate);
  const failed = await commit(batch);
  if (failed) return failed;

  return NextResponse.json({ card: await getStandaloneCard(cardSnap.id) });
}

// DELETE — remove the card's profile and put the card back in stock
export async function DELETE(req: NextRequest) {
  await requireAdmin();
  const cardId = new URL(req.url).searchParams.get('cardId');
  if (!cardId) return bad('cardId requis.');

  const cardRef  = cardsCol().doc(cardId);
  const cardSnap = await cardRef.get();
  const card     = cardSnap.exists ? (cardSnap.data() as CardDoc) : null;
  if (!card?.standalone) return bad('Carte introuvable.', 404);

  const batch = adminDb.batch();

  if (card.profileId) {
    const profileRef  = profilesCol().doc(card.profileId);
    const [profileSnap, linksSnap] = await Promise.all([profileRef.get(), profileRef.collection('links').get()]);
    linksSnap.docs.forEach((d) => batch.delete(d.ref));
    const username = profileSnap.exists ? (profileSnap.data() as ProfileDoc).username : null;
    if (username) batch.delete(usernamesCol().doc(username));
    batch.delete(profileRef);
  }

  const del = FieldValue.delete();
  batch.update(cardRef, {
    status:      'in_stock',
    stockedAt:   new Date().toISOString(),
    standalone:  del,
    label:       del,
    redirectUrl: del,
    profileId:   del,
    activatedAt: del,
    createdAt:   del,
  });

  await batch.commit();
  return NextResponse.json({ ok: true });
}
