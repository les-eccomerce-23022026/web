export function generateSafeId(): string {
  // eslint-disable-next-line no-restricted-syntax
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    // eslint-disable-next-line no-restricted-syntax
    return crypto.randomUUID();
  }
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}
