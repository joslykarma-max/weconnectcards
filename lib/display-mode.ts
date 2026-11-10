// Public profile display modes. Client-safe (no server imports).

export const DISPLAY_MODES = [
  { value: 'light',   label: 'Clair' },
  { value: 'classic', label: 'Classique' },
  { value: 'grid',    label: 'Grille' },
  { value: 'card',    label: 'Carte Pro' },
] as const;
export type DisplayMode = typeof DISPLAY_MODES[number]['value'];

/** Used by every profile that has not picked a mode (new accounts, new card profiles). */
export const DEFAULT_DISPLAY_MODE: DisplayMode = 'light';

export function isDisplayMode(v: unknown): v is DisplayMode {
  return DISPLAY_MODES.some((m) => m.value === v);
}

/** Stored mode when valid, otherwise the platform default. */
export function resolveDisplayMode(v: unknown): DisplayMode {
  return isDisplayMode(v) ? v : DEFAULT_DISPLAY_MODE;
}
