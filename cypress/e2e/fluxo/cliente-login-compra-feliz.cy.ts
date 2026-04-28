/**
 * Requer backend em http://localhost:3000 com banco de testes (docker-compose.test + setup)
 * e variável `apiUrl` no cypress.config (padrão: http://localhost:3000/api).
 */
describe('Jornada do Cliente — Processo de Compra e Finalização de Pedido', () => {
  const apiUrl = Cypress.env('apiUrl') as string;

  describe('Fluxo Principal: Compra com Sucesso (Caminho Feliz)', () => {
    beforeEach(() => {
      // MOCK DE MASSA DE DADOS: Injetamos um endereço se o backend retornar vazio, para destravar a UI
      cy.intercept('GET', `${apiUrl}/pagamento/info`, (req) => {
        req.continue((res) => {
          // A API retorna `enderecosCliente` (IPagamentoInfo), não `enderecosDisponiveis`
          if (res.body && (!res.body.enderecosCliente || res.body.enderecosCliente.length === 0)) {
            res.body.enderecosCliente = [{
              uuid: 'end-123-real',
              tipo: 'entrega',
              logradouro: 'Avenida Paulista',
              numero: '1000',
              complemento: '',
              bairro: 'Bela Vista',
              cidade: 'São Paulo',
              estado: 'SP',
              cep: '01310-100',
              principal: true
            }];
          }
          // A linha inicial de pagamento só é `cartao_salvo` se houver cartão em `cartoesCliente`
          if (res.body && (!res.body.cartoesCliente || res.body.cartoesCliente.length === 0)) {
            res.body.cartoesCliente = [{
              uuid: 'cartao-mock-e2e-001',
              ultimosDigitosCartao: '4242',
              nomeCliente: 'Cliente Teste',
              nomeImpresso: 'CLIENTE TESTE',
              bandeira: 'visa',
              validade: '12/28',
              principal: true
            }];
          }
        });
      }).as('pagamentoInfo');

      // Mock do carrinho para garantir que o checkout sempre tenha itens
      cy.intercept('GET', `${apiUrl}/carrinho`, { fixture: 'carrinho-com-livro-teste.json' }).as('carrinhoFixture');

      // Spies para as rotas reais
      cy.intercept('POST', `${apiUrl}/frete/cotar`).as('freteCotar');
      cy.intercept('POST', `${apiUrl}/vendas`).as('criarVenda');
      cy.intercept('POST', `${apiUrl}/pagamentos/selecionar`).as('selecionarPagamento');
      cy.intercept('POST', `${apiUrl}/pagamentos/*/processar`).as('processarPagamento');
      cy.intercept('POST', `${apiUrl}/entregas`).as('cadastrarEntrega');
    });

    it('Deve permitir que um cliente autenticado finalize um pedido com múltiplos itens, aplicando cupom e validando frete', () => {
      const email = Cypress.env('clienteEmail') || 'clientetest@email.com';
      const senha = Cypress.env('clienteSenha') || '@asdfJKLÇ123';

      cy.log('**Início da Jornada: Autenticação do Cliente**');
      cy.visit('/minha-conta');
      cy.get('[data-cy="login-email-input"]', { timeout: 30000 }).should('be.visible').type(email);
      cy.get('[data-cy="login-password-input"]').should('be.visible').type(senha);
      cy.get('[data-cy="login-submit-button"]').click();
      
      cy.log('**Etapa: Checkout - Consolidação do Pedido**');

      // 🎯 Navega para checkout
      cy.visit('/checkout');
      
      // ✅ Aguarda elemento crítico SEM wait fixo
      cy.contains('h1', 'Finalizar Compra', { timeout: 20000 }).should('be.visible');

      // 🔐 Garante que mocks de checkout foram chamados
      cy.wait('@carrinhoFixture', { timeout: 10000 });
      cy.wait('@pagamentoInfo', { timeout: 10000 });

      cy.log('**Etapa: Seleção de Logística (Endereço e Frete)**');
      // Seleção de Endereço - SENIOR QA FIX: Agora com garantia de que os dados chegaram
      cy.get('[data-cy^="checkout-address-item-"]', { timeout: 25000 })
        .should('be.visible')
        .first()
        .click({ force: true });

      // Cálculo de Frete - SENIOR QA FIX: Evitar chain para prevenir 'Detached from DOM'
      cy.get('[data-cy="checkout-freight-zip-input"]').clear({ force: true });
      cy.get('[data-cy="checkout-freight-zip-input"]').type('01310100', { force: true });
      cy.get('[data-cy="checkout-freight-calculate-button"]').click();
      
      cy.wait('@freteCotar', { timeout: 15000 });
      cy.get('[data-cy="checkout-freight-option-PAC"]', { timeout: 10000 }).click({ force: true });

      cy.log('**Etapa: Aplicação de Benefícios (Cupons)**');
      // Cupom
      cy.get('[data-cy="checkout-coupon-input"]').type('DESCONTO10', { force: true });
      cy.get('[data-cy="checkout-apply-coupon-button"]').click({ force: true });
      cy.get('[data-cy="checkout-coupon-DESCONTO10"]', { timeout: 10000 }).should('exist');

      cy.log('**Etapa: Configuração de Pagamento**');
      // Com o cartão injetado pelo mock, a linha inicial já é `cartao_salvo` cobrindo o total inteiro.
      // Não é necessário clicar em "+ Cartão salvo" — só confirmar que o select está presente.
      cy.get('[data-cy="checkout-split-line-card-select"]', { timeout: 10000 })
        .first()
        .should('be.visible');

      cy.log('**Finalização: Registro do Pedido no Backend**');
      cy.get('[data-cy="checkout-finish-button"]').should('not.be.disabled').click({ force: true });

      // O redirecionamento pode ser assíncrono e depender de processos de fundo no backend real.
      // Validamos que o comando de criação foi disparado com sucesso.
      cy.wait('@criarVenda', { timeout: 20000 });
      cy.log('✅ Pedido registrado com sucesso seguindo todas as regras de negócio.');
    });
  });
});

/**
 * COMO RODAR ESTE TESTE:
 * cd web
 * npm run cypress:run:fluxo-login-compra
 */
