// Carte médicale: which fields any visitor may see, and which stay behind the owner's PIN.
// The public page only ever receives `publicMedicalConfig`; protected fields are released
// by /api/modules/medical/unlock after a server-side PIN check.

/** Vital information for first responders — always visible. */
export const PUBLIC_MEDICAL_FIELDS = [
  'fullName', 'birthDate', 'bloodType', 'allergies',
  'emergencyName', 'emergencyRel', 'emergencyPhone',
  'organDonor', 'dnr', 'weight', 'height',
] as const;

/** Complementary record — protected when a PIN is set. */
export const PROTECTED_MEDICAL_FIELDS = [
  'conditions', 'medications', 'vaccinations', 'doctorName', 'doctorPhone',
  'hospital', 'insuranceNumber', 'emergency2Name', 'emergency2Rel', 'emergency2Phone', 'notes',
] as const;

function pick(config: Record<string, unknown>, keys: readonly string[]): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const k of keys) if (config[k] !== undefined && config[k] !== '') out[k] = config[k];
  return out;
}

/** A PIN is set: salted hash (`pinHash`), or a clear `pin` left by the old version (upgraded on first unlock). */
export function medicalHasPin(config: Record<string, unknown>): boolean {
  return (typeof config.pinHash === 'string' && config.pinHash.length > 0)
      || (typeof config.pin === 'string' && config.pin.length > 0);
}

/** What the owner's settings form receives: every field, never the PIN itself. */
export function ownerMedicalConfig(config: Record<string, unknown>): Record<string, unknown> {
  const { pin: _pin, pinHash: _hash, ...rest } = config;
  void _pin; void _hash;
  return { ...rest, hasPin: medicalHasPin(config) };
}

/** What the public page may receive: never the PIN, and the protected record only if no PIN is set. */
export function publicMedicalConfig(config: Record<string, unknown>): Record<string, unknown> {
  const hasPin = medicalHasPin(config);
  return {
    ...pick(config, PUBLIC_MEDICAL_FIELDS),
    ...(hasPin ? {} : pick(config, PROTECTED_MEDICAL_FIELDS)),
    hasPin,
  };
}

export function protectedMedicalFields(config: Record<string, unknown>): Record<string, unknown> {
  return pick(config, PROTECTED_MEDICAL_FIELDS);
}
