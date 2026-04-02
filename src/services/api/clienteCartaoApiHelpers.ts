/** UUIDs de bandeira na API (mesmo mapa para adicionar/editar cartão). */
export const BANDEIRA_UUID_POR_NOME: Record<string, string> = {
  visa: 'd30d587f-8140-469d-a5fc-8e0c998c72f4',
  mastercard: 'd6eac520-7651-4ae9-84d5-b0bbf269be2e',
  elo: '21317eba-311d-4bb8-9054-6debff64f2da',
  'american express': '01fd90d0-0c72-4787-8667-965b2c39f75f',
  hipercard: '02cacd79-1ec5-44c5-9142-486cb4bc82f1',
};

export function uuidBandeiraParaNome(bandeira: string): string {
  return BANDEIRA_UUID_POR_NOME[bandeira.toLowerCase()] ?? BANDEIRA_UUID_POR_NOME.visa;
}

/** Converte MM/AAAA ou MM/AA para ISO YYYY-MM-DD (dia 01). */
export function validadeMmAaParaIso(validade: string | undefined): string | undefined {
  if (!validade || !validade.includes('/')) return validade;
  const [mes, ano] = validade.split('/');
  const anoCompleto = ano.length === 2 ? `20${ano}` : ano;
  return `${anoCompleto}-${mes.padStart(2, '0')}-01`;
}
