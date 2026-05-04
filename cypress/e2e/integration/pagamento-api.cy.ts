/**
 * Testes de Integração API-first para Pagamento
 *
 * Estes testes validam a lógica de negócio de cupom e split de pagamento
 * diretamente via API, reduzindo a dependência de seletores UI e
 * problemas de timing.
 *
 * Benefícios:
 * - Testes mais rápidos (sem renderização de UI)
 * - Menos flaky (sem problemas de timing/scroll/click)
 * - Foco na lógica de negócio, não na UI
 * - Executáveis mesmo quando a UI mudar
 */

const apiUrlDefault = 'http://localhost:5173/api';

/** cy.request não passa pelo cy.intercept de e2e.ts — precisa do mesmo header que loginApi. */
function headersTestDb(extra?: Record<string, string>) {
  return {
    ...(Cypress.env('injectTestDbHeader') === true ? { 'x-use-test-db': 'true' } : {}),
    ...extra,
  };
}

/** Payload mínimo de pedido alinhado a `backend/src/tests/helpers/pedido-venda.helper.ts`. */
function payloadPedidoDesdeLivro(
  livro: { uuid: string; preco: number },
  opts?: { valorFrete?: number; quantidade?: number; extras?: Record<string, unknown> },
) {
  const qtd = opts?.quantidade ?? 1;
  const frete = opts?.valorFrete ?? 10;
  const preco = livro.preco;
  const valorTotalItens = preco * qtd;
  const valorTotal = valorTotalItens + frete;
  return {
    itens: [{ livroUuid: livro.uuid, quantidade: qtd, precoUnitario: preco }],
    valorTotalItens,
    valorFrete: frete,
    valorTotal,
    ...opts?.extras,
  };
}

describe('Integração API - Cupons', () => {
  const apiUrl = Cypress.env('apiUrl') || apiUrlDefault;
  const email = 'clientetest@email.com';
  const senha = '@asdfJKLÇ123';

  beforeEach(() => {
    cy.loginApi(email, senha);
  });

  it('deve aplicar cupom promocional via API e validar desconto', () => {
    cy.request({
      method: 'POST',
      url: `${apiUrl}/cupom/aplicar`,
      headers: headersTestDb({ 'Content-Type': 'application/json; charset=utf-8' }),
      body: { codigo: 'DESCONTO10' },
    }).then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body.ok).to.be.true;
      expect(response.body.dados.codigo).to.eq('DESCONTO10');
      expect(response.body.dados.tipo).to.eq('promocional');
      expect(response.body.dados.valorDesconto).to.eq(10.00);
    });
  });

  it('deve validar cupom inválido via API', () => {
    cy.request({
      method: 'POST',
      url: `${apiUrl}/cupom/aplicar`,
      headers: headersTestDb({ 'Content-Type': 'application/json; charset=utf-8' }),
      body: { codigo: 'CUPOM_INVALIDO' },
      failOnStatusCode: false,
    }).then((response) => {
      expect(response.status).to.eq(400);
      expect(response.body.ok).to.be.false;
      expect(response.body.erro).to.contain('inválido');
    });
  });

  it('deve listar cupons disponíveis via API', () => {
    cy.request({
      method: 'GET',
      url: `${apiUrl}/cupom/disponiveis`,
      headers: headersTestDb(),
    }).then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body.ok).to.be.true;
      expect(response.body.dados).to.be.an('array');
      expect(response.body.dados.length).to.be.greaterThan(0);

      const cupomDesconto10 = response.body.dados.find((c: { codigo: string }) => c.codigo === 'DESCONTO10');
      expect(cupomDesconto10).to.exist;
      expect(cupomDesconto10.tipo).to.eq('promocional');
      expect(cupomDesconto10.valorDesconto).to.eq(10.00);
    });
  });
});

describe('Integração API - Split de Pagamento', () => {
  const apiUrl = Cypress.env('apiUrl') || apiUrlDefault;
  const email = 'clientetest@email.com';
  const senha = '@asdfJKLÇ123';

  beforeEach(() => {
    cy.loginApi(email, senha);
  });

  it('deve validar valor mínimo de R$ 10,00 por cartão no split (RN0034)', () => {
    cy.request({ method: 'GET', url: `${apiUrl}/livros`, headers: headersTestDb() }).then((r) => {
      expect(r.status).to.eq(200);
      const livro = r.body.livros[0];
      expect(livro, 'catálogo deve ter ao menos um livro').to.exist;

      const base = payloadPedidoDesdeLivro(livro, { valorFrete: 10, quantidade: 1 });
      const total = base.valorTotal as number;
      const linhaInvalida = 5;
      const linhaValida = Number((total - linhaInvalida).toFixed(2));

      cy.request({
        method: 'POST',
        url: `${apiUrl}/vendas`,
        headers: headersTestDb({ 'Content-Type': 'application/json; charset=utf-8' }),
        body: {
          ...base,
          pagamentos: [
            { tipo: 'cartao', valor: linhaValida },
            { tipo: 'cartao', valor: linhaInvalida },
          ],
        },
        failOnStatusCode: false,
      }).then((res) => {
        expect(res.status).to.eq(400);
        expect(res.body.erro).to.match(/RN0034/i);
      });
    });
  });

  it('deve aceitar POST /vendas com split em dois cartões que respeitam RN0034', () => {
    cy.request({ method: 'GET', url: `${apiUrl}/livros`, headers: headersTestDb() }).then((r) => {
      expect(r.status).to.eq(200);
      const livro = r.body.livros[0];
      expect(livro, 'catálogo deve ter ao menos um livro').to.exist;

      const fretePadrao = 10;
      let qtd = 1;
      while (livro.preco * qtd + fretePadrao < 20) {
        qtd += 1;
      }

      const base = payloadPedidoDesdeLivro(livro, { valorFrete: fretePadrao, quantidade: qtd });
      const total = base.valorTotal as number;
      const a = Number((total / 2).toFixed(2));
      const b = Number((total - a).toFixed(2));

      cy.request({
        method: 'POST',
        url: `${apiUrl}/vendas`,
        headers: headersTestDb({ 'Content-Type': 'application/json; charset=utf-8' }),
        body: {
          ...base,
          pagamentos: [
            { tipo: 'cartao', valor: a },
            { tipo: 'cartao', valor: b },
          ],
        },
      }).then((res) => {
        expect(res.status).to.eq(201);
        expect(res.body.status).to.eq('EM PROCESSAMENTO');
        expect(res.body.totalVenda).to.eq(total);
      });
    });
  });

  it('deve expor política de parcelamento em GET /pagamento/info', () => {
    cy.request({
      method: 'GET',
      url: `${apiUrl}/pagamento/info`,
      headers: headersTestDb(),
      qs: {
        cepDestino: '01310100',
        pesoKg: 1,
        valorTotalItens: 100,
      },
    }).then((res) => {
      expect(res.status).to.eq(200);
      expect(res.body.politicaParcelamentoCartao).to.exist;
      expect(res.body.politicaParcelamentoCartao.parcelasMaximas).to.eq(12);
      expect(res.body.politicaParcelamentoCartao.parcelasSemJuros).to.eq(6);
    });
  });
});
