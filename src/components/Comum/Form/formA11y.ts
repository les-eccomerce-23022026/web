/** Junta ids para `aria-describedby` (texto de ajuda + mensagem de erro). */
export function mergeDescribedBy(
  existing: string | undefined,
  extraId: string | undefined,
): string | undefined {
  if (!extraId) return existing;
  if (!existing) return extraId;
  return `${existing} ${extraId}`;
}
