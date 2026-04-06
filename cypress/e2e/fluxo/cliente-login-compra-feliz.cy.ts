import { Header } from '../../support/pages/layout/Header';
import { LoginPage } from '../../support/pages/auth/LoginPage';

/**
 * Requer backend em http://localhost:3000 com banco de testes (docker-compose.test + setup)
 * e variável `apiUrl` no cypress.config (padrão: http://localhost:3000/api).
 *
 * O catálogo/carrinho HTTP ainda não existe no backend; o GET /carrinho é interceptado
 * com fixture contendo o UUID de livro usado nos testes de integração da API.
 */
describe('Fluxo cliente — login e compra feliz', () => {
  const apiUrl = Cypress.env('apiUrl') as string;

  describe('Login (UI + resposta mockada)', () => {
    it('deve autenticar e exibir o nome do usuário no header', () => {
      cy.fixture('auth/login_cliente_sucesso').then((json) => {
        cy.intercept('POST', '**/auth/login', json).as('loginMock');

        cy.visit('/minha-conta');
        LoginPage.emailInput.type('cristiana@gmail.com');
        LoginPage.passwordInput.type('cliente@asdfJKLÇ123');
        LoginPage.submitButton.click();

        cy.wait('@loginMock');
        cy.url().should('not.include', '/minha-conta');
        Header.verifyLoggedIn(json.dados.user.nome);
      });
    });
  });

  describe('Compra feliz (sessão real + checkout)', () => {
    beforeEach(() => {
      // Evita `x-use-test-db` do Vite (ApiClient) para usar o mesmo Postgres do seed (dev).
      cy.intercept(`${apiUrl}/**`, (req) => {
        delete req.headers['x-use-test-db'];
      });
      cy.intercept('GET', `${apiUrl}/carrinho`, { fixture: 'carrinho-com-livro-teste.json' }).as(
        'carrinhoFixture',
      );
      cy.intercept('GET', `${apiUrl}/pagamento/info`, { fixture: 'pagamento-info-checkout.json' }).as(
        'pagamentoInfo',
      );
      cy.intercept('POST', `${apiUrl}/frete/cotar`, { fixture: 'frete-cotar-checkout.json' }).as('freteCotar');
      /** O UUID do item pode não existir no catálogo local; o E2E valida o fluxo de tela + APIs de pagamento. */
      cy.intercept('POST', `${apiUrl}/vendas`, {
        statusCode: 201,
        fixture: 'venda-criada-resposta.json',
      }).as('criarVenda');

      let selecionarCount = 0;
      cy.intercept('POST', `${apiUrl}/pagamentos/selecionar`, (req) => {
        selecionarCount += 1;
        const raw = req.body as unknown;
        const body =
          typeof raw === 'string' ? (JSON.parse(raw) as Record<string, unknown>) : (raw as Record<string, unknown>);
        const tipo = (body?.tipoPagamento as string) ?? 'cupom_promocional';
        const valor = typeof body?.valor === 'number' ? body.valor : 0;
        req.reply({
          statusCode: 201,
          body: {
            id: `pay-selecionar-${selecionarCount}`,
            vendaUuid: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
            valor,
            formaPagamento: {
              tipo,
              detalhes: tipo === 'cupom_promocional' ? 'DESCONTO10' : 'cartão',
            },
            status: 'pendente',
            criadoEm: new Date().toISOString(),
          },
        });
      }).as('selecionarPagamento');

      cy.intercept('POST', '**/pagamentos/*/processar', (req) => {
        const id = req.url.split('/pagamentos/')[1]?.split('/')[0] ?? 'pay-processado';
        req.reply({
          statusCode: 200,
          body: {
            id,
            vendaUuid: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
            valor: 60,
            formaPagamento: { tipo: 'cartao_credito' },
            status: 'aprovado',
            criadoEm: new Date().toISOString(),
            processadoEm: new Date().toISOString(),
          },
        });
      }).as('processarPagamento');

      cy.intercept('POST', `${apiUrl}/entregas`, {
        statusCode: 201,
        body: {
          id: 'entrega-mock-1',
          vendaUuid: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
          tipoFrete: 'PAC',
          custo: 15,
          endereco: {
            rua: 'Bela Vista',
            bairro: 'Centro',
            cidade: 'São Paulo',
            estado: 'SP',
            cep: '01000000',
          },
          criadoEm: new Date().toISOString(),
        },
      }).as('cadastrarEntrega');
    });

    it('deve registrar sessão, carregar checkout, aplicar cupom e concluir pedido', () => {
      cy.session('cliente-compra-feliz', () => {
        cy.loginClienteSeed();
      });

      cy.visit('/');
      cy.wait('@carrinhoFixture', { timeout: 20000 });

      cy.visit('/checkout');
      cy.contains('h1', 'Finalizar Compra', { timeout: 20000 }).should('be.visible');

      cy.get('[data-cy^="checkout-address-item-"]', { timeout: 20000 }).first().click({ force: true });

      cy.get('[data-cy="checkout-freight-zip-input"]', { timeout: 20000 }).should('be.visible');
      cy.get('[data-cy="checkout-freight-zip-input"]').clear({ force: true });
      cy.get('[data-cy="checkout-freight-zip-input"]').type('01310100', { force: true });
      cy.get('[data-cy="checkout-freight-calculate-button"]').click();
      cy.wait('@freteCotar', { timeout: 15000 });
      cy.get('[data-cy="checkout-freight-options"]', { timeout: 10000 }).should('be.visible');
      cy.get('[data-cy="checkout-freight-option-PAC"]').click({ force: true });

      cy.get('[data-cy="checkout-coupon-input"]').should('be.visible');
      cy.get('[data-cy="checkout-coupon-input"]').clear({ force: true });
      cy.get('[data-cy="checkout-coupon-input"]').type('DESCONTO10', { force: true });
      cy.get('[data-cy="checkout-apply-coupon-button"]').scrollIntoView().click({ force: true });
      cy.get('[data-cy="checkout-applied-coupons"]').should('be.visible');
      cy.get('[data-cy="checkout-coupon-DESCONTO10"]').should('exist');

      cy.get('[data-cy="checkout-finish-button"]').should('not.be.disabled');
      cy.get('[data-cy="checkout-finish-button"]').scrollIntoView().click({ force: true });

      cy.url({ timeout: 30000 }).should('include', '/pedido-confirmado');
      cy.contains('Pedido', { matchCase: false }).should('exist');
    });
  });
});
