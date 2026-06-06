// Comandos customizados Cypress para testes E2E do e-commerce de livros
// Refatorado em módulos por responsabilidade para melhor manutenibilidade
// 
// Estrutura de módulos:
// - commands/utils.ts: Funções utilitárias e validação de variáveis de ambiente
// - commands/common.ts: Comandos comuns (getDataCy, getNewUser)
// - commands/auth.ts: Comandos de autenticação (login, autenticarViaApi, etc.)
// - commands/carrinho.ts: Comandos de carrinho (criarCarrinhoViaApi, adicionarAoCarrinhoViaApi, etc.)
// - commands/checkout.ts: Comandos de checkout (garantirEnderecoViaApi, checkoutIrFinalizarCompra, etc.)
// - commands/vendas.ts: Comandos de vendas/trocas/entregas (despacharPedidoViaApi, solicitarTrocaViaApi, etc.)
// - commands/multiTenancy.ts: Comandos de multi-tenancy (autenticarAdminLojaA, criarVendaLojaA, etc.)

// Importar módulos de comandos organizados
import './commands/utils';
import './commands/common';
import './commands/auth';
import './commands/carrinho';
import './commands/checkout';
import './commands/vendas';
import './commands/multiTenancy';

// Importar helpers e intercepts existentes (mantidos para compatibilidade)
import {
  apiHeadersBancoTestes,
  apiHeadersBancoTestesComLoja,
  aplicarCookieAuthNoBrowser,
  aplicarSessaoAuthCompletaNoBrowser,
  armazenarTokenAuth,
  extrairTokenJwtLoginResponse,
  extrairTotalAposCuponsDoRestante,
  limparSessaoAuthBrowser,
  parseMoedaBrParaNumero,
  resolverUuidLojaPadraoNasLojas,
} from './helpers/checkoutHelpers';
import { registerCheckoutApiAliases } from './intercepts/checkoutApi';

// Exportar helpers para uso em testes que ainda dependem deles
export {
  apiHeadersBancoTestes,
  apiHeadersBancoTestesComLoja,
  aplicarCookieAuthNoBrowser,
  aplicarSessaoAuthCompletaNoBrowser,
  armazenarTokenAuth,
  extrairTokenJwtLoginResponse,
  extrairTotalAposCuponsDoRestante,
  limparSessaoAuthBrowser,
  parseMoedaBrParaNumero,
  resolverUuidLojaPadraoNasLojas,
  registerCheckoutApiAliases,
};
