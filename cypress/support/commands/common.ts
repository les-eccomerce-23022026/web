// Comandos comuns Cypress

import { gerarCpfValido } from './utils';

declare global {
  namespace Cypress {
    interface Chainable {
      getDataCy(value: string): Chainable<JQuery<HTMLElement>>;
      getNewUser(): Chainable<{ nome: string, cpf: string, email: string, senha: string }>;
    }
  }
}

Cypress.Commands.add('getNewUser', () => {
  const timestamp = Date.now();
  // Gerar CPF único baseado em timestamp para evitar conflitos no banco de testes
  // Usar últimos 9 dígitos do timestamp + dígito verificador
  const baseCpf = String(timestamp).slice(-9);
  const cpf = gerarCpfValido(baseCpf);
  return cy.wrap({
    nome: 'João Silva Teste',
    cpf,
    email: `teste.${timestamp}.${Math.floor(Math.random() * 1000)}@email.com`,
    senha: 'StrongPass@2026',
  });
});

Cypress.Commands.add('getDataCy', (value) => {
  return cy.get(`[data-cy="${value}"]`);
});
