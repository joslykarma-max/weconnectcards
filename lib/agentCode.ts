// Generates a unique-ish agent code from phone digits (or random) — used when no MIT is supplied.
export function generateAgentCode(phone?: string): string {
  const fromPhone = (phone ?? '').replace(/\D/g, '').slice(-6);
  const suffix    = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `${fromPhone || 'AG'}${suffix}`;
}
