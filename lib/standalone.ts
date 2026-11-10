// "Cartes sans compte" — cards created and managed from the admin panel,
// never linked to a user account. Client-safe helpers (no server imports).

/** Pseudo owner id of a card without account: used as profile.uid and scans.userId. */
export function standaloneUid(cardId: string): string {
  return `standalone_${cardId}`;
}

export const STANDALONE_EDITIONS = ['midnight', 'electric', 'glass', 'metal'] as const;
export type StandaloneEdition = typeof STANDALONE_EDITIONS[number];

export function isStandaloneEdition(v: unknown): v is StandaloneEdition {
  return typeof v === 'string' && (STANDALONE_EDITIONS as readonly string[]).includes(v);
}

export interface StandaloneLinkInput {
  type:  string;
  label: string;
  value: string; // what the admin typed (number, handle, URL…)
}

export interface StandaloneProfileInput {
  displayName: string;
  title:       string;
  company:     string;
  bio:         string;
  avatar:      string;
  username:    string; // empty → generated from the name
}

/** Admin form payload, sent in full on create (POST) and on save (PATCH). */
export interface StandalonePayload {
  cardId?:     string; // PATCH only
  nfcId?:      string; // POST only — empty → generated
  label:       string;
  edition:     StandaloneEdition;
  mode:        'profile' | 'redirect';
  redirectUrl: string;
  active?:     boolean; // PATCH only
  profile:     StandaloneProfileInput;
  links:       StandaloneLinkInput[];
}

/** A card without account as shown in the admin panel. */
export interface StandaloneCardView {
  id:          string;
  nfcId:       string;
  label:       string | null;
  edition:     StandaloneEdition;
  active:      boolean;
  redirectUrl: string | null;
  createdAt:   string | null;
  views:       number;
  profile: {
    id:          string;
    username:    string;
    displayName: string;
    title:       string;
    company:     string;
    bio:         string;
    avatar:      string;
    links:       StandaloneLinkInput[];
  } | null;
}

export const STANDALONE_LINK_TYPES: Array<{ value: string; label: string; placeholder: string }> = [
  { value: 'phone',     label: 'Téléphone',    placeholder: '+229 97 00 00 00' },
  { value: 'whatsapp',  label: 'WhatsApp',     placeholder: '+229 97 00 00 00' },
  { value: 'email',     label: 'Email',        placeholder: 'contact@exemple.com' },
  { value: 'website',   label: 'Site web',     placeholder: 'https://monsite.com' },
  { value: 'linkedin',  label: 'LinkedIn',     placeholder: 'https://linkedin.com/in/profil' },
  { value: 'instagram', label: 'Instagram',    placeholder: '@compte' },
  { value: 'location',  label: 'Localisation', placeholder: 'Cotonou, Bénin ou lien Google Maps' },
  { value: 'calendly',  label: 'Calendly',     placeholder: 'https://calendly.com/nom' },
  { value: 'custom',    label: 'Autre lien',   placeholder: 'https://...' },
];

const LINK_TYPE_SET = new Set(STANDALONE_LINK_TYPES.map((t) => t.value));

export function isStandaloneLinkType(type: string): boolean {
  return LINK_TYPE_SET.has(type);
}

export function defaultLinkLabel(type: string): string {
  return STANDALONE_LINK_TYPES.find((t) => t.value === type)?.label ?? 'Lien';
}

const hasScheme = (s: string) => /^[a-zA-Z][a-zA-Z0-9+\-.]*:/.test(s);

/** What the admin types (number, handle, address…) → the URL stored on the link. */
export function linkUrlFromValue(type: string, raw: string): string {
  const v = raw.trim();
  if (!v) return '';
  switch (type) {
    case 'phone':     return hasScheme(v) ? v : `tel:${v}`;
    case 'email':     return hasScheme(v) ? v : `mailto:${v}`;
    case 'whatsapp':  return /^https?:/i.test(v) ? v : `https://wa.me/${v.replace(/[^0-9]/g, '')}`;
    case 'instagram': return /^https?:/i.test(v) ? v : `https://instagram.com/${v.replace(/^@/, '')}`;
    case 'linkedin':  return /^https?:/i.test(v) ? v : `https://linkedin.com/in/${v.replace(/^\//, '')}`;
    case 'calendly':  return /^https?:/i.test(v) ? v : `https://calendly.com/${v.replace(/^\//, '')}`;
    case 'location':  return /^https?:/i.test(v) ? v : `https://maps.google.com/?q=${encodeURIComponent(v)}`;
    default:          return hasScheme(v) ? v : `https://${v}`;
  }
}

/** Stored URL → the value shown back in the admin form. */
export function linkValueFromUrl(type: string, url: string): string {
  switch (type) {
    case 'phone':     return url.replace(/^tel:/, '');
    case 'email':     return url.replace(/^mailto:/, '');
    case 'whatsapp': {
      const m = url.match(/^https:\/\/wa\.me\/(\d+)/);
      return m ? `+${m[1]}` : url;
    }
    case 'location': {
      const m = url.match(/^https:\/\/maps\.google\.com\/\?q=(.+)$/);
      return m ? decodeURIComponent(m[1]) : url;
    }
    default: return url;
  }
}

/** Only these schemes may be stored as a link or a redirect target. */
export function isSafeUrl(url: string): boolean {
  return /^(https?:\/\/|tel:|mailto:|sms:)/i.test(url);
}

/** Redirect target typed by the admin → absolute URL. */
export function normalizeRedirectUrl(raw: string): string {
  const v = raw.trim();
  if (!v) return '';
  return hasScheme(v) ? v : `https://${v}`;
}

export function slugify(raw: string): string {
  return raw
    .toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 40)
    .replace(/-$/, '');
}

// Top-level routes a public username must never shadow
export const RESERVED_USERNAMES = new Set([
  'admin', 'api', 'activate', 'annuaire', 'carte-perdue', 'comment-ca-marche', 'contact',
  'dashboard', 'features', 'forgot-password', 'login', 'm', 'modules', 'nfc', 'qr',
  'register', 'tarifs', 'icon', 'favicon', 'robots', 'sitemap',
]);
