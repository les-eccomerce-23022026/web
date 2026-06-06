// Funções de utilidade para comandos Cypress
import { ENDPOINTS } from '../constants';

/**
 * Valida que uma variável de ambiente obrigatória está configurada.
 * Lança erro descritivo se não estiver configurada.
 */
export function requireEnv(varName: string, value?: string): string {
  if (!value) {
    throw new Error(
      `CYPRESS_ENV ${varName} não configurado. Configure em cypress.config.cjs ou via variável de ambiente.\n` +
      `Exemplo: CYPRESS_${varName.toUpperCase()}=valor npx cypress run`
    );
  }
  return value;
}

/**
 * Obtém a URL da API validando que está configurada.
 */
export function getApiUrl(): string {
  return requireEnv('apiUrl', Cypress.env('apiUrl') as string);
}

/**
 * Obtém credenciais de cliente validando que estão configuradas.
 */
export function getClienteCredentials(): { email: string; senha: string } {
  const cliente = Cypress.env('cliente') as { email: string; senha: string } | undefined;
  if (!cliente) {
    throw new Error(
      'CYPRESS_ENV cliente não configurado. Configure em cypress.env.json ou via variável de ambiente.\n' +
      'Exemplo: CYPRESS_cliente={"email":"...","senha":"..."} npx cypress run'
    );
  }
  if (!cliente.email || !cliente.senha) {
    throw new Error(
      'CYPRESS_ENV cliente está configurado mas não contém email e senha.\n' +
      'Formato esperado: { email: string, senha: string }'
    );
  }
  return cliente;
}

/**
 * Obtém credenciais de admin validando que estão configuradas.
 */
export function getAdminCredentials(): { email: string; senha: string } {
  const admin = Cypress.env('admin') as { email: string; senha: string } | undefined;
  if (!admin) {
    throw new Error(
      'CYPRESS_ENV admin não configurado. Configure em cypress.env.json ou via variável de ambiente.\n' +
      'Exemplo: CYPRESS_admin={"email":"...","senha":"..."} npx cypress run'
    );
  }
  if (!admin.email || !admin.senha) {
    throw new Error(
      'CYPRESS_ENV admin está configurado mas não contém email e senha.\n' +
      'Formato esperado: { email: string, senha: string }'
    );
  }
  return admin;
}

/**
 * Obtém credenciais de admin da Loja A para testes de multi-tenancy.
 */
export function getAdminLojaACredentials(): { email: string; senha: string } {
  const adminLojaA = Cypress.env('adminLojaA') as { email: string; senha: string } | undefined;
  if (!adminLojaA) {
    throw new Error(
      'CYPRESS_ENV adminLojaA não configurado. Configure em cypress.env.json ou via variável de ambiente.'
    );
  }
  if (!adminLojaA.email || !adminLojaA.senha) {
    throw new Error(
      'CYPRESS_ENV adminLojaA está configurado mas não contém email e senha.\n' +
      'Formato esperado: { email: string, senha: string }'
    );
  }
  return adminLojaA;
}

/**
 * Obtém credenciais de admin da Loja B para testes de multi-tenancy.
 */
export function getAdminLojaBCredentials(): { email: string; senha: string } {
  const adminLojaB = Cypress.env('adminLojaB') as { email: string; senha: string } | undefined;
  if (!adminLojaB) {
    throw new Error(
      'CYPRESS_ENV adminLojaB não configurado. Configure em cypress.env.json ou via variável de ambiente.'
    );
  }
  if (!adminLojaB.email || !adminLojaB.senha) {
    throw new Error(
      'CYPRESS_ENV adminLojaB está configurado mas não contém email e senha.\n' +
      'Formato esperado: { email: string, senha: string }'
    );
  }
  return adminLojaB;
}

export const USE_TEST_DB = Cypress.env('injectTestDbHeader') === true;

export const getHeaders = (extraHeaders: Record<string, string> = {}): Record<string, string> => ({
  'Content-Type': 'application/json; charset=utf-8',
  ...extraHeaders,
});

export const getTestDbHeaders = (): Record<string, string> => ({
  'Content-Type': 'application/json; charset=utf-8',
  ...(USE_TEST_DB ? { 'x-use-test-db': 'true' } : {}),
});

export const CPFS_CADASTRO_VALIDOS = [
  '245.699.622-46',
  '019.364.721-47',
  '747.200.643-29',
  '371.568.753-37',
  '497.592.260-65',
  '283.323.987-46',
  '206.903.522-04',
  '824.477.504-12',
  '989.888.819-90',
  '267.905.031-29',
  '684.262.887-31',
  '802.563.243-10',
  '087.098.018-12',
  '707.848.056-28',
  '952.426.835-38',
];

/**
 * Função auxiliar para gerar CPF válido a partir de 9 dígitos base
 */
export function gerarCpfValido(base: string): string {
  // Garantir que temos exatamente 9 dígitos
  const cpfBase = base.padStart(9, '0').slice(0, 9);
  
  // Calcular primeiro dígito verificador
  let soma = 0;
  for (let i = 0; i < 9; i++) {
    soma += parseInt(cpfBase[i]) * (10 - i);
  }
  const resto1 = soma % 11;
  const digito1 = resto1 < 2 ? 0 : 11 - resto1;
  
  // Calcular segundo dígito verificador
  soma = 0;
  for (let i = 0; i < 9; i++) {
    soma += parseInt(cpfBase[i]) * (11 - i);
  }
  soma += digito1 * 2;
  const resto2 = soma % 11;
  const digito2 = resto2 < 2 ? 0 : 11 - resto2;
  
  // Formatar CPF
  const cpfCompleto = cpfBase + digito1 + digito2;
  return `${cpfCompleto.slice(0, 3)}.${cpfCompleto.slice(3, 6)}.${cpfCompleto.slice(6, 9)}-${cpfCompleto.slice(9)}`;
}
