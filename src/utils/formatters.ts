/**
 * Formata um CNPJ numérico (14 dígitos) no padrão XX.XXX.XXX/XXXX-XX.
 * Se o valor já contiver pontuação ou for inválido, retorna como está.
 */
export function formatarCnpj(cnpj: string): string {
  const apenasNumeros = cnpj.replace(/\D/g, '');
  if (apenasNumeros.length !== 14) return cnpj;
  return apenasNumeros.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
}
