// Module settings sent by the owner, cleaned before they are stored in modules/{uid}_{type}.
import { FieldValue } from 'firebase-admin/firestore';
import { hashPin } from './pin';

export class ConfigError extends Error {}

/**
 * Secrets never stored in clear: the medical PIN typed by the owner becomes a salted hash;
 * `removePin` clears it; an empty / absent PIN keeps the current one (the form never receives it).
 */
export function prepareConfig(type: string, config: Record<string, unknown>): Record<string, unknown> {
  if (type !== 'medical') return config;
  const { pin, removePin, pinHash: _ignored, hasPin: _flag, ...rest } = config;
  void _ignored; void _flag;
  const out: Record<string, unknown> = { ...rest };
  if (removePin === true) {
    out.pinHash = FieldValue.delete();
    out.pin     = FieldValue.delete();
  } else if (typeof pin === 'string' && pin.trim()) {
    const p = pin.trim();
    if (!/^\d{4,8}$/.test(p)) throw new ConfigError('Le code PIN doit contenir 4 à 8 chiffres.');
    out.pinHash = hashPin(p);
    out.pin     = FieldValue.delete();
  }
  return out;
}
