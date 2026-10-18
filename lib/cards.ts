import type { DeactivationReason } from '@/lib/types';

// Reasons offered by "Changer ma carte" when the owner switches a card off
export const DEACTIVATION_REASONS: Record<DeactivationReason, string> = {
  lost:    'Perdue',
  stolen:  'Volée',
  damaged: 'Endommagée',
  other:   'Autre',
};
