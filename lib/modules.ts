import type { ModuleDoc } from '@/lib/types';

// The digital profile is itself a module (modules/{uid}_profile). It has no doc
// until first toggled, and is on by default.
export const PROFILE_MODULE = 'profile';

// Modules with a public page (/m/{username}/{type}) a card tap can open directly
export const TAP_MODULES = new Set([
  'loyalty', 'menu', 'review', 'portfolio', 'event', 'certificate', 'member', 'access', 'medical',
]);

export function isProfileModuleActive(doc: ModuleDoc | undefined): boolean {
  return doc ? doc.isActive : true;
}
