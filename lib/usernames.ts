// Public usernames live at the site root (weconnect.cards/<username>), so they must
// never take the name of a page of the site.

/** Top-level routes and public folders a username must never shadow. */
export const RESERVED_USERNAMES = new Set([
  // pages
  'admin', 'activate', 'annuaire', 'carte-perdue', 'cgu', 'comment-ca-marche', 'contact',
  'dashboard', 'features', 'forgot-password', 'login', 'logout', 'm', 'ma-carte', 'modules',
  'nfc', 'privacy', 'qr', 'register', 'reset-password', 'tarifs',
  // technical routes and public folders
  'api', '_next', 'icon', 'icons', 'favicon', 'fonts', 'robots', 'sitemap', 'manifest',
]);

export const USERNAME_MIN = 3;
export const USERNAME_MAX = 30;

/** Lower-case, accent-free, dash-separated version of what the user typed. */
export function toUsernameSlug(raw: string): string {
  return raw
    .toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

export function isReservedUsername(username: string): boolean {
  return RESERVED_USERNAMES.has(username);
}

/** Error message for a username the user is choosing, or null when it can be used. */
export function usernameProblem(username: string): string | null {
  if (username.length < USERNAME_MIN || username.length > USERNAME_MAX) {
    return `Le nom d'utilisateur doit faire entre ${USERNAME_MIN} et ${USERNAME_MAX} caractères.`;
  }
  if (isReservedUsername(username)) {
    return "Ce nom d'utilisateur est réservé par le site. Choisissez-en un autre.";
  }
  return null;
}
