/**
 * Helpers API-driven alinhados a `backend/docs/EXPORT-BDD-7-ENTREGA-API.md`
 * e ao script `backend/testar-cenarios-bdd-7-entrega.sh`.
 */

import { apiHeadersBancoTestes } from './checkoutHelpers';

export const BDD_ENTREGA_7 = {
  docReferencia: 'backend/docs/EXPORT-BDD-7-ENTREGA-API.md',
  fretePadrao: 15,
  tipoFrete: 'PAC',
  enderecoEntrega: 'Endereço de Teste',
  entregador: 'Transportadora Padrão',
  cupomApenas: {
    identificadorIntencao: 'CUPOM-ONLY',
    segredoConfirmacao: 'CUPOM-ONLY',
  },
  erros: {
    dadosInvalidos: 'Dados inválidos',
    prazoTrocaExpirado: 'Prazo de 7 dias para troca expirado',
    custoEntregaInvalido: 'Custo da entrega não confere',
    entregaNaoEncontrada: 'Entrega não encontrada',
  },
} as const;

export interface CupomTrocaBdd {
  uuid: string;
  codigo: string;
  valor: number;
}

export interface LivroCatalogoBdd {
  uuid: string;
  preco: number;
}

export interface PedidoEntregueBdd {
  vendaUuid: string;
  itemUuid: string;
  entregaUuid: string;
  valorFrete: number;
}

export interface VendaCriadaBdd {
  vendaUuid: string;
  itemUuid: string;
  valorTotal: number;
  valorTotalItens: number;
  valorFrete: number;
}

export interface RespostaPagamentoBdd {
  sucesso: boolean;
  status: string;
}

export interface RespostaVendaBdd {
  status: string;
}

export interface RespostaTrocaBdd {
  status: string;
  erro?: string;
}

export interface IntencaoPagamentoBdd {
  identificadorIntencao: string;
  segredoConfirmacao: string;
}

export interface CupomGeradoBdd {
  codigo: string;
  valor: number;
}

export function apiUrlBdd(): string {
  return (Cypress.env('apiUrl') as string) || 'http://localhost:3000/api';
}

export function credenciaisClienteBdd(): { email: string; senha: string } {
  return {
    email: (Cypress.env('clienteEmail') as string) || 'clientetest@email.com',
    senha: (Cypress.env('clienteSenha') as string) || '@asdfJKLÇ123',
  };
}

export function credenciaisAdminBdd(): { email: string; senha: string } {
  return {
    email: (Cypress.env('adminEmail') as string) || 'admintest@email.com',
    senha: (Cypress.env('adminSenha') as string) || '@asdfJKLÇ123',
  };
}

/** Extrai UUID sem `expect` (seguro dentro de `.then()` do Cypress). */
export function extrairUuidVenda(corpo: { id?: string; uuid?: string }): string {
  const uuid = corpo.uuid ?? corpo.id;
  if (!uuid) {
    throw new Error(`UUID da venda ausente na resposta: ${JSON.stringify(corpo)}`);
  }
  return uuid;
}

export function extrairUuidItem(corpo: { id?: string; uuid?: string }): string {
  const uuid = corpo.uuid ?? corpo.id;
  if (!uuid) {
    throw new Error(`UUID do item ausente na resposta: ${JSON.stringify(corpo)}`);
  }
  return uuid;
}

/** Log síncrono — seguro dentro de `.then()` do Cypress (não enfileira `cy.log`). */
export function logEtapaBdd(etapa: string): void {
  Cypress.log({ name: 'BDD', message: etapa, displayName: etapa });
}

export function logRespostaBdd(rotulo: string, response: Cypress.Response<unknown>): void {
  Cypress.log({
    name: 'BDD',
    displayName: `Resposta ${rotulo}`,
    message: JSON.stringify(response.body, null, 2),
  });
}

export function loginClienteBdd(): void {
  const { email, senha } = credenciaisClienteBdd();
  cy.autenticarViaApi(email, senha);
}

export function loginAdminBdd(): void {
  const { email, senha } = credenciaisAdminBdd();
  cy.autenticarViaApi(email, senha);
}

export function obterPrimeiroLivroBdd(): Cypress.Chainable<LivroCatalogoBdd> {
  return cy
    .request({
      method: 'GET',
      url: `${apiUrlBdd()}/livros`,
      headers: apiHeadersBancoTestes(),
      qs: { pagina: 1, itensPorPagina: 1, ordenacao: 'recentes' },
    })
    .then((response) => {
      expect(response.status).to.equal(200);
      const livro = response.body.livros[0];
      expect(livro, 'catálogo com ao menos um livro').to.exist;
      return { uuid: livro.uuid as string, preco: Number(livro.preco) };
    });
}

export function obterPerfilClienteBdd(): Cypress.Chainable<{
  enderecoUuid: string;
  cartaoUuid: string;
}> {
  return cy
    .request({
      method: 'GET',
      url: `${apiUrlBdd()}/clientes/perfil`,
      headers: apiHeadersBancoTestes(),
    })
    .then((response) => {
      expect(response.status).to.equal(200);
      return {
        enderecoUuid: response.body.dados.enderecos[0].uuid as string,
        cartaoUuid: response.body.dados.cartoes[0].uuid as string,
      };
    });
}

/** POST /vendas — payload alinhado ao export BDD. */
export function criarVendaBdd(opts: {
  livroUuid: string;
  precoUnitario: number;
  quantidade?: number;
  valorFrete?: number;
  formaPagamento?: string;
}): Cypress.Chainable<VendaCriadaBdd> {
  const quantidade = opts.quantidade ?? 1;
  const valorFrete = opts.valorFrete ?? BDD_ENTREGA_7.fretePadrao;
  const valorTotalItens = opts.precoUnitario * quantidade;
  const valorTotal = valorTotalItens + valorFrete;

  return obterPerfilClienteBdd().then(({ enderecoUuid, cartaoUuid }) => {
    return cy
      .request({
        method: 'POST',
        url: `${apiUrlBdd()}/vendas`,
        headers: apiHeadersBancoTestes(),
        body: {
          enderecoUuid,
          cartaoUuid,
          formaPagamento: opts.formaPagamento ?? 'cartao',
          valorTotal,
          valorTotalItens,
          valorFrete,
          parcelas: 1,
          itens: [
            {
              livroUuid: opts.livroUuid,
              quantidade,
              precoUnitario: opts.precoUnitario,
            },
          ],
        },
      })
      .then((response) => {
        logRespostaBdd('POST /api/vendas', response);
        expect(response.status).to.equal(201);
        expect(response.body.status).to.equal('EM PROCESSAMENTO');
        return {
          vendaUuid: extrairUuidVenda(response.body),
          itemUuid: extrairUuidItem(response.body.itens[0]),
          valorTotal,
          valorTotalItens,
          valorFrete,
        };
      });
  });
}

export function registrarIntencaoPagamentoBdd(
  valorTotal: number,
): Cypress.Chainable<IntencaoPagamentoBdd> {
  return cy
    .request({
      method: 'POST',
      url: `${apiUrlBdd()}/pagamentos/intencao-pagamento`,
      headers: apiHeadersBancoTestes(),
      body: { valorTotal },
    })
    .then((response) => {
      logRespostaBdd('POST /api/pagamentos/intencao-pagamento', response);
      expect(response.status).to.equal(201);
      return {
        identificadorIntencao: response.body.idIntencao as string,
        segredoConfirmacao: response.body.segredoConfirmacao as string,
      };
    });
}

/** POST /pagamento/processar — contrato atual do checkout (pagamentosCartao + intenção). */
export function processarPagamentoCheckoutBdd(opts: {
  vendaUuid: string;
  valorTotal: number;
  intencao: IntencaoPagamentoBdd;
  pagamentosCartao: Array<{ valor: number; parcelasCartao?: number; magicRecusar?: boolean }>;
  cuponsAplicados?: Array<{ uuid: string; codigo: string; tipo: string; valor: number }>;
}): Cypress.Chainable<Cypress.Response<unknown>> {
  const body: Record<string, unknown> = {
    vendaUuid: opts.vendaUuid,
    valorTotal: opts.valorTotal,
    idIntencao: opts.intencao.identificadorIntencao,
    segredoConfirmacao: opts.intencao.segredoConfirmacao,
    pagamentosCartao: opts.pagamentosCartao,
  };
  if (opts.cuponsAplicados?.length) {
    body.cuponsAplicados = opts.cuponsAplicados;
  }

  return cy
    .request({
      method: 'POST',
      url: `${apiUrlBdd()}/pagamento/processar`,
      headers: apiHeadersBancoTestes(),
      body,
    })
    .then((response) => {
      logRespostaBdd('POST /api/pagamento/processar', response);
      return response;
    });
}

export function finalizarPagamentoCheckoutBdd(
  vendaUuid: string,
  valorTotal: number,
): Cypress.Chainable<Cypress.Response<RespostaPagamentoBdd>> {
  return registrarIntencaoPagamentoBdd(valorTotal).then((intencao) =>
    processarPagamentoCheckoutBdd({
      vendaUuid,
      valorTotal,
      intencao,
      pagamentosCartao: [{ valor: valorTotal, parcelasCartao: 1 }],
    }).then((response) => {
      const body = response.body as RespostaPagamentoBdd;
      if (response.status !== 200 || body.sucesso !== true || body.status !== 'APROVADA') {
        throw new Error(`Pagamento não aprovado: ${JSON.stringify(response.body)}`);
      }
      return response as Cypress.Response<RespostaPagamentoBdd>;
    }),
  );
}

export function consultarVendaBdd(vendaUuid: string): Cypress.Chainable<Cypress.Response<RespostaVendaBdd>> {
  return cy.request({
    method: 'GET',
    url: `${apiUrlBdd()}/vendas/${vendaUuid}`,
    headers: apiHeadersBancoTestes(),
  }) as Cypress.Chainable<Cypress.Response<RespostaVendaBdd>>;
}

/** Requer sessão admin ativa (chamar `loginAdminBdd()` antes, fora de `.then()`). */
export function agendarEntregaBdd(
  vendaUuid: string,
  custoFrete: number = BDD_ENTREGA_7.fretePadrao,
): Cypress.Chainable<string> {
  return cy
    .request({
      method: 'POST',
      url: `${apiUrlBdd()}/entregas`,
      headers: apiHeadersBancoTestes(),
      body: {
        vendaUuid,
        tipoFrete: BDD_ENTREGA_7.tipoFrete,
        endereco: BDD_ENTREGA_7.enderecoEntrega,
        custo: custoFrete,
        entregador: BDD_ENTREGA_7.entregador,
      },
    })
    .then((response) => {
      logRespostaBdd('POST /api/entregas', response);
      expect(response.status).to.equal(201);
      expect(response.body.uuid).to.exist;
      return response.body.uuid as string;
    });
}

export function confirmarEntregaBdd(entregaUuid: string): Cypress.Chainable<Cypress.Response<void>> {
  return cy
    .request({
      method: 'PATCH',
      url: `${apiUrlBdd()}/entregas/${entregaUuid}/confirmar`,
      headers: apiHeadersBancoTestes(),
    })
    .then((response) => {
      expect(response.status).to.equal(204);
      return response as Cypress.Response<void>;
    });
}

export function criarEntregaEConfirmarBdd(
  vendaUuid: string,
  custoFrete: number = BDD_ENTREGA_7.fretePadrao,
): Cypress.Chainable<string> {
  return agendarEntregaBdd(vendaUuid, custoFrete).then((entregaUuid) =>
    confirmarEntregaBdd(entregaUuid).then(() => entregaUuid),
  );
}

export function registrarFalhaEntregaBdd(entregaUuid: string): Cypress.Chainable<Cypress.Response<void>> {
  return cy
    .request({
      method: 'PATCH',
      url: `${apiUrlBdd()}/entregas/${entregaUuid}/falha`,
      headers: apiHeadersBancoTestes(),
    })
    .then((response) => {
      logRespostaBdd('PATCH /api/entregas/:uuid/falha', response);
      expect(response.status).to.equal(204);
      return response as Cypress.Response<void>;
    });
}

/**
 * Cliente cria venda → admin agenda e confirma entrega.
 * Ordem de comandos Cypress no topo do fluxo (sem `cy.*` dentro de `.then()`).
 */
export function criarPedidoEntregueBdd(opts: {
  livroUuid: string;
  precoUnitario: number;
  quantidade?: number;
  valorFrete?: number;
}): Cypress.Chainable<PedidoEntregueBdd> {
  loginClienteBdd();
  criarVendaBdd(opts).as('bddVendaTmp');
  loginAdminBdd();

  return cy.get<VendaCriadaBdd>('@bddVendaTmp').then((venda) =>
    criarEntregaEConfirmarBdd(venda.vendaUuid, venda.valorFrete).then((entregaUuid) =>
      consultarVendaBdd(venda.vendaUuid).then((consulta) => {
        const body = consulta.body as RespostaVendaBdd;
        if (body.status !== 'ENTREGUE') {
          throw new Error(`Status esperado ENTREGUE, recebido: ${body.status}`);
        }
        return {
          vendaUuid: venda.vendaUuid,
          itemUuid: venda.itemUuid,
          entregaUuid,
          valorFrete: venda.valorFrete,
        };
      }),
    ),
  );
}

/** Requer sessão cliente ativa. */
export function solicitarTrocaBdd(
  vendaUuid: string,
  itemUuid: string,
  motivo: string,
  failOnStatusCode = true,
): Cypress.Chainable<Cypress.Response<unknown>> {
  return cy
    .request({
      method: 'POST',
      url: `${apiUrlBdd()}/vendas/${vendaUuid}/troca`,
      headers: apiHeadersBancoTestes(),
      body: { motivo, itensUuids: [itemUuid] },
      failOnStatusCode,
    })
    .then((response) => {
      logRespostaBdd('POST /api/vendas/:uuid/troca', response);
      return response;
    });
}

/** Requer sessão admin ativa. */
export function autorizarTrocaAdminBdd(vendaUuid: string): Cypress.Chainable<Cypress.Response<RespostaVendaBdd>> {
  return cy
    .request({
      method: 'PATCH',
      url: `${apiUrlBdd()}/admin/pedidos/${vendaUuid}/autorizar-troca`,
      headers: apiHeadersBancoTestes(),
    })
    .then((response) => {
      logRespostaBdd('PATCH /api/admin/pedidos/:uuid/autorizar-troca', response);
      const body = response.body as RespostaVendaBdd;
      if (response.status !== 200 || body.status !== 'TROCA AUTORIZADA') {
        throw new Error(`Autorização de troca falhou: ${JSON.stringify(response.body)}`);
      }
      return response as Cypress.Response<RespostaVendaBdd>;
    });
}

export function rejeitarTrocaAdminBdd(
  vendaUuid: string,
  motivo: string,
): Cypress.Chainable<Cypress.Response<unknown>> {
  return cy
    .request({
      method: 'PATCH',
      url: `${apiUrlBdd()}/admin/pedidos/${vendaUuid}/rejeitar-troca`,
      headers: apiHeadersBancoTestes(),
      body: { motivo },
    })
    .then((response) => {
      logRespostaBdd('PATCH /api/admin/pedidos/:uuid/rejeitar-troca', response);
      expect(response.status).to.equal(200);
      return response;
    });
}

export function confirmarRecebimentoTrocaAdminBdd(
  vendaUuid: string,
  retornarEstoque = true,
): Cypress.Chainable<CupomGeradoBdd> {
  return cy
    .request({
      method: 'PATCH',
      url: `${apiUrlBdd()}/admin/pedidos/${vendaUuid}/confirmar-recebimento`,
      headers: apiHeadersBancoTestes(),
      body: { retornarEstoque },
    })
    .then((response) => {
      logRespostaBdd('PATCH /api/admin/pedidos/:uuid/confirmar-recebimento', response);
      expect(response.status).to.equal(200);
      expect(response.body.cupomGerado).to.exist;
      return {
        codigo: response.body.cupomGerado.codigo as string,
        valor: Number(response.body.cupomGerado.valor),
      };
    });
}

export function listarEntregasPorVendaBdd(vendaUuid: string): Cypress.Chainable<Cypress.Response<unknown>> {
  return cy
    .request({
      method: 'GET',
      url: `${apiUrlBdd()}/entregas`,
      headers: apiHeadersBancoTestes(),
      qs: { vendaUuid },
    })
    .then((response) => {
      logRespostaBdd('GET /api/entregas?vendaUuid=', response);
      expect(response.status).to.equal(200);
      return response;
    });
}

/** Fluxo completo até troca solicitada (cenários 5–6). */
export function criarPedidoComTrocaSolicitadaBdd(opts: {
  livroUuid: string;
  precoUnitario: number;
  motivoTroca?: string;
}): Cypress.Chainable<PedidoEntregueBdd & { motivoTroca: string }> {
  const motivo = opts.motivoTroca ?? 'Produto não atendeu expectativas';
  criarPedidoEntregueBdd(opts).as('bddPedidoTrocaTmp');
  loginClienteBdd();
  return cy.get<PedidoEntregueBdd>('@bddPedidoTrocaTmp').then((pedido) =>
    solicitarTrocaBdd(pedido.vendaUuid, pedido.itemUuid, motivo).then((troca) => {
      const body = troca.body as RespostaTrocaBdd;
      if (troca.status !== 200 || body.status !== 'EM TROCA') {
        throw new Error(`Falha ao solicitar troca: ${JSON.stringify(troca.body)}`);
      }
      return { ...pedido, motivoTroca: motivo };
    }),
  );
}

// --- Cenários BDD numerados (export) ---

export function executarCenarioFalhaPagamentoDadosInvalidos(): void {
  logEtapaBdd('BDD Cenário 2 — Falha no pagamento (dados inválidos)');
  loginClienteBdd();
  cy.request({
    method: 'POST',
    url: `${apiUrlBdd()}/pagamento/processar`,
    headers: apiHeadersBancoTestes(),
    body: {},
    failOnStatusCode: false,
  }).then((response) => {
    logRespostaBdd('POST /api/pagamento/processar', response);
    expect(response.status).to.equal(400);
    expect(response.body.erro).to.equal(BDD_ENTREGA_7.erros.dadosInvalidos);
  });
}

export function obterPrimeiroCupomTrocaBdd(): Cypress.Chainable<CupomTrocaBdd> {
  return cy
    .request({
      method: 'GET',
      url: `${apiUrlBdd()}/cupom/disponiveis`,
      headers: apiHeadersBancoTestes(),
    })
    .then((response) => {
      logRespostaBdd('GET /api/cupom/disponiveis', response);
      expect(response.status).to.equal(200);
      const cupons = response.body.dados as Array<{
        uuid: string;
        codigo: string;
        tipo: string;
        valorDesconto?: number;
        valor?: number;
      }>;
      const cupomTroca = cupons.find((c) => c.tipo === 'troca');
      expect(cupomTroca, 'cupom de troca no seed BDD').to.exist;
      return {
        uuid: cupomTroca!.uuid,
        codigo: cupomTroca!.codigo,
        valor: Number(cupomTroca!.valorDesconto ?? cupomTroca!.valor ?? 0),
      };
    });
}

export function executarCenarioPagamentoIntegralCupomTroca(livroUuid: string): void {
  logEtapaBdd('BDD Cenário 3 — Pagamento integral com cupom de troca');
  loginClienteBdd();

  obterPrimeiroCupomTrocaBdd().then((cupom) => {
    criarVendaBdd({
      livroUuid,
      precoUnitario: cupom.valor,
      quantidade: 1,
      valorFrete: 0,
      formaPagamento: 'cupom',
    }).then((venda) => {
      cy.request({
        method: 'POST',
        url: `${apiUrlBdd()}/pagamento/processar`,
        headers: apiHeadersBancoTestes(),
        body: {
          vendaUuid: venda.vendaUuid,
          valorTotal: 0,
          idIntencao: BDD_ENTREGA_7.cupomApenas.identificadorIntencao,
          segredoConfirmacao: BDD_ENTREGA_7.cupomApenas.segredoConfirmacao,
          pagamentosCartao: [],
          cuponsAplicados: [
            { uuid: cupom.uuid, codigo: cupom.codigo, tipo: 'troca', valor: cupom.valor },
          ],
        },
      }).then((pagamento) => {
        logRespostaBdd('POST /api/pagamento/processar', pagamento);
        expect(pagamento.status).to.equal(200);
        expect(pagamento.body.sucesso).to.equal(true);
        consultarVendaBdd(venda.vendaUuid).then((consulta) => {
          expect(consulta.body.status).to.equal('APROVADA');
        });
      });
    });
  });
}

export function executarCenarioPrazoTrocaExpirado(livroUuid: string, precoUnitario: number): void {
  logEtapaBdd('BDD Cenário 7 — Prazo de 7 dias expirado');
  criarPedidoEntregueBdd({ livroUuid, precoUnitario, quantidade: 1 }).as('bddPedidoC7');
  cy.get<PedidoEntregueBdd>('@bddPedidoC7').then((pedido) => {
    cy.task<boolean>('bddRetrocederDataEntrega', { vendaUuid: pedido.vendaUuid }).then((ok) => {
      if (!ok) {
        throw new Error(
          'Container Docker ecm_postgres necessário para retroceder ven_data_hora_entrega (cenário 7 / RN0043)',
        );
      }
      loginClienteBdd();
      solicitarTrocaBdd(pedido.vendaUuid, pedido.itemUuid, 'Teste prazo expirado', false).then((troca) => {
        if (troca.status !== 400) {
          throw new Error(`Status esperado 400, recebido ${troca.status}`);
        }
        const body = troca.body as RespostaTrocaBdd;
        if (body.erro !== BDD_ENTREGA_7.erros.prazoTrocaExpirado) {
          throw new Error(`Erro inesperado: ${body.erro}`);
        }
      });
    });
  });
}
