/**
 * Helper para testes de Falhas Consecutivas de Entrega
 * Centraliza funções compartilhadas entre os diferentes arquivos de teste
 * RN00XX — Regra de Negócio: 3 falhas de entrega consecutivas → cancelamento automático
 */

import { apiHeadersBancoTestes } from './checkoutHelpers';
import { TIMEOUT } from '../constants';

/**
 * Dados padrão para endereço de teste em falhas de entrega
 */
export const ENDERECO_TESTE_FALHA = {
  logradouro: 'Rua Atualizada 1',
  numero: '111',
  complemento: '',
  bairro: 'Centro',
  cidade: 'São Paulo',
  estado: 'SP',
  cep: '01200-000',
  tipo: 'entrega',
  principal: false,
  apelido: 'Endereço 1',
} as const;

/**
 * Motivos de falha padrão para testes
 */
export const MOTIVOS_FALHA = {
  PRIMEIRA: 'Endereço não encontrado',
  SEGUNDA: 'Endereço ainda incorreto',
  TERCEIRA: 'Endereço inexistente - cliente não localizado',
} as const;

/**
 * Cria um novo endereço para o cliente via API
 * @param dadosEndereco - Dados do endereço (opcional, usa padrão se não informado)
 * @returns Promise com UUID do endereço criado
 */
export function criarEnderecoCliente(dadosEndereco: Partial<typeof ENDERECO_TESTE_FALHA> = {}): Cypress.Chainable<string> {
  const enderecoCompleto = { ...ENDERECO_TESTE_FALHA, ...dadosEndereco };
  
  return cy.request({
    method: 'POST',
    url: `${Cypress.env('apiUrl') || 'http://localhost:5173/api'}/clientes/perfil/enderecos`,
    headers: apiHeadersBancoTestes(),
    body: enderecoCompleto,
    timeout: TIMEOUT.REDE,
  }).then((res) => {
    expect(res.status).to.equal(201);
    expect(res.body).to.have.property('uuid');
    return res.body.uuid;
  });
}

/**
 * Atualiza o endereço de entrega de uma venda
 * @param vendaUuid - UUID da venda
 * @param enderecoUuid - UUID do novo endereço
 */
export function atualizarEnderecoEntrega(vendaUuid: string, enderecoUuid: string): Cypress.Chainable {
  return cy.request({
    method: 'PUT',
    url: `${Cypress.env('apiUrl') || 'http://localhost:5173/api'}/vendas/${vendaUuid}/endereco-entrega`,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      ...apiHeadersBancoTestes(),
    },
    body: {
      enderecoUuid,
    },
    timeout: TIMEOUT.REDE,
  });
}

/**
 * Solicita reconfirmação de endereço ao cliente
 * @param vendaUuid - UUID da venda
 */
export function solicitarReconfirmacaoEndereco(vendaUuid: string): Cypress.Chainable {
  return cy.request({
    method: 'POST',
    url: `${Cypress.env('apiUrl') || 'http://localhost:5173/api'}/admin/pedidos/${vendaUuid}/solicitar-reconfirmacao-endereco`,
    headers: apiHeadersBancoTestes(),
    timeout: TIMEOUT.REDE,
  });
}

/**
 * Redespacha um pedido via API
 * @param vendaUuid - UUID da venda
 */
export function redespacharPedido(vendaUuid: string): Cypress.Chainable {
  return cy.request({
    method: 'PUT',
    url: `${Cypress.env('apiUrl') || 'http://localhost:5173/api'}/admin/pedidos/${vendaUuid}/redespachar`,
    headers: apiHeadersBancoTestes(),
    timeout: TIMEOUT.REDE,
  });
}

/**
 * Verifica o status atual de uma venda
 * @param vendaUuid - UUID da venda
 * @param statusEsperado - Status esperado
 */
export function verificarStatusVenda(vendaUuid: string, statusEsperado: string): Cypress.Chainable {
  return cy.request({
    method: 'GET',
    url: `${Cypress.env('apiUrl') || 'http://localhost:5173/api'}/vendas/${vendaUuid}`,
    headers: apiHeadersBancoTestes(),
    timeout: TIMEOUT.REDE,
  }).then((res) => {
    expect(res.body).to.have.property('status', statusEsperado);
    return res.body;
  });
}

/**
 * Fluxo completo de primeira falha e redespacho
 * @param vendaUuid - UUID da venda
 * @param motivoFalha - Motivo da falha (padrão: MOTIVOS_FALHA.PRIMEIRA)
 */
export function executarFluxoPrimeiraFalha(vendaUuid: string, motivoFalha: string = MOTIVOS_FALHA.PRIMEIRA): Cypress.Chainable {
  // Marcar primeira falha
  cy.marcarFalhaEntregaViaApi(vendaUuid, motivoFalha);
  
  // Solicitar reconfirmação de endereço
  solicitarReconfirmacaoEndereco(vendaUuid);
  
  // Criar novo endereço
  return criarEnderecoCliente().then((novoEnderecoUuid) => {
    // Atualizar endereço da venda
    atualizarEnderecoEntrega(vendaUuid, novoEnderecoUuid);
    
    // Redespachar
    redespacharPedido(vendaUuid);
    
    // Verificar status
    verificarStatusVenda(vendaUuid, 'Em Trânsito');
    
    return novoEnderecoUuid;
  });
}

/**
 * Fluxo completo de segunda falha e redespacho
 * @param vendaUuid - UUID da venda
 * @param motivoFalha - Motivo da falha (padrão: MOTIVOS_FALHA.SEGUNDA)
 */
export function executarFluxoSegundaFalha(vendaUuid: string, motivoFalha: string = MOTIVOS_FALHA.SEGUNDA): Cypress.Chainable {
  // Executar primeira falha e redespacho
  executarFluxoPrimeiraFalha(vendaUuid);
  
  // Marcar segunda falha
  cy.marcarFalhaEntregaViaApi(vendaUuid, motivoFalha);
  
  // Solicitar nova reconfirmação
  solicitarReconfirmacaoEndereco(vendaUuid);
  
  // Criar outro endereço
  return criarEnderecoCliente({
    logradouro: 'Rua Atualizada 2',
    numero: '222',
    apelido: 'Endereço 2',
  }).then((novoEnderecoUuid) => {
    // Atualizar endereço
    atualizarEnderecoEntrega(vendaUuid, novoEnderecoUuid);
    
    // Redespachar novamente
    redespacharPedido(vendaUuid);
    
    // Verificar status
    verificarStatusVenda(vendaUuid, 'Em Trânsito');
    
    return novoEnderecoUuid;
  });
}

/**
 * Fluxo completo de terceira falha e cancelamento automático
 * @param vendaUuid - UUID da venda
 * @param motivoFalha - Motivo da falha (padrão: MOTIVOS_FALHA.TERCEIRA)
 */
export function executarFluxoTerceiraFalha(vendaUuid: string, motivoFalha: string = MOTIVOS_FALHA.TERCEIRA): Cypress.Chainable {
  // Executar segunda falha e redespacho
  executarFluxoSegundaFalha(vendaUuid);
  
  // Marcar terceira falha (deve cancelar automaticamente)
  cy.marcarFalhaEntregaViaApi(vendaUuid, motivoFalha);
  
  // Verificar cancelamento automático
  return verificarStatusVenda(vendaUuid, 'Cancelado');
}

/**
 * Verifica se o pedido aparece na lista de pedidos com o status correto
 * @param vendaUuid - UUID da venda
 * @param statusEsperado - Status esperado
 */
export function verificarPedidoNaLista(vendaUuid: string, statusEsperado: string): void {
  cy.visit('/admin/pedidos');
  cy.get('[data-cy="loading"]', { timeout: TIMEOUT.RENDER }).should('not.exist');
  
  cy.contains(vendaUuid.split('-')[1].toUpperCase())
    .parents('tr')
    .find('[data-cy="status-badge"]')
    .should('contain', statusEsperado);
}

/**
 * Verifica se exibe aviso de múltiplas falhas na UI
 * @param vendaUuid - UUID da venda
 */
export function verificarAvisoMultiplasFalhas(vendaUuid: string): void {
  cy.autenticarAdministradorViaApi();
  cy.visit('/admin/pedidos');
  cy.get('[data-cy="loading"]', { timeout: TIMEOUT.RENDER }).should('not.exist');
  
  // Encontrar o pedido e verificar aviso
  cy.contains(vendaUuid.split('-')[1].toUpperCase())
    .parents('tr')
    .find('[data-cy="aviso-multiplas-falhas"]')
    .should('be.visible')
    .and('contain.text', 'Atenção: 2ª falha consecutiva');
}

/**
 * Verifica se exibe aviso de cancelamento automático na UI
 * @param vendaUuid - UUID da venda
 */
export function verificarAvisoCancelamentoAutomatico(vendaUuid: string): void {
  cy.autenticarAdministradorViaApi();
  cy.visit('/admin/pedidos');
  cy.get('[data-cy="loading"]', { timeout: TIMEOUT.RENDER }).should('not.exist');
  
  // Encontrar o pedido e verificar aviso de cancelamento
  cy.contains(vendaUuid.split('-')[1].toUpperCase())
    .parents('tr')
    .find('[data-cy="aviso-cancelamento-automatico"]')
    .should('be.visible')
    .and('contain.text', 'Cancelado automaticamente após 3 falhas');
}

/**
 * Configuração inicial para testes de falhas
 * Garante que o ambiente esteja pronto para os testes
 */
export function setupInicialFalhas(): void {
  Cypress.env('injectTestDbHeader', true);
}