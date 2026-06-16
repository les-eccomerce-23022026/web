/**
 * E2E — 7ª Entrega / Seção 3: Registrar novo endereço no ato da compra.
 * Cliente adiciona um endereço durante o checkout, calcula frete para ele,
 * conclui o pedido e verifica que o endereço passa a constar nos salvos.
 */
import {
  loginClienteUi,
  adicionarLivrosAoCarrinho,
} from '../../support/fluxo-venda.helpers';

const NOVO_ENDERECO = {
  apelido: 'Trabalho E2E',
  cep: '01310-100',
  logradouro: 'Avenida Paulista',
  numero: '1578',
  complemento: 'Sala 2',
  bairro: 'Bela Vista',
  cidade: 'São Paulo',
  estado: 'SP',
};

describe('Compra — Registrar novo endereço no checkout (CDU001, RF0015)', () => {
  let devePularTeste = false;

  before(() => {
    // Verificar se o cliente já tem 5 endereços antes de executar os testes
    let token = '';
    cy.request({
      method: 'POST',
      url: `${Cypress.env('apiUrl')}/auth/login`,
      headers: {
        'X-Test-Rate-Limit-Key': `cypress-e2e-${Date.now()}`,
      },
      body: { email: 'clientetest@email.com', senha: '@asdf123' },
    }).then((loginRes) => {
      token = loginRes.body.dados.token;
      return cy.request({
        method: 'GET',
        url: `${Cypress.env('apiUrl')}/clientes/perfil`,
        headers: {
          'X-Test-Rate-Limit-Key': `cypress-e2e-${Date.now()}`,
          'Authorization': `Bearer ${token}`,
        },
      });
    }).then((enderecosRes) => {
      const enderecos: Array<{ uuid: string; apelido: string }> = enderecosRes.body.dados?.enderecos || [];

      // Limpeza idempotente: remove órfãos "Trabalho E2E" de runs anteriores que
      // quebraram antes do cleanup final, evitando que o cliente fique 5/5 e o teste
      // se autopule indefinidamente.
      const orfaos = enderecos.filter((e) => e.apelido === NOVO_ENDERECO.apelido);
      orfaos.forEach((e) => {
        cy.request({
          method: 'DELETE',
          url: `${Cypress.env('apiUrl')}/clientes/perfil/enderecos/${e.uuid}`,
          headers: {
            'X-Test-Rate-Limit-Key': `cypress-e2e-${Date.now()}`,
            'Authorization': `Bearer ${token}`,
          },
          failOnStatusCode: false,
        });
      });

      // Só pula se, mesmo após remover os órfãos, ainda houver 5+ endereços legítimos.
      if (enderecos.length - orfaos.length >= 5) {
        devePularTeste = true;
        cy.log('Cliente já tem 5 endereços. Use o teste validar-limite-enderecos.cy.ts para validar essa regra.');
      }
    });
  });

  beforeEach(() => {
    if (devePularTeste) {
      return;
    }
    cy.clearCookies();
    cy.clearLocalStorage();
    loginClienteUi();
    adicionarLivrosAoCarrinho(1);

    cy.visit('/carrinho');
    cy.get('[data-cy="carrinho-finalizar-compra"]').click();
    cy.url().should('include', '/checkout');
  });

  it('3 deve registrar um novo endereço durante a compra, entregar nele e salvá-lo na lista', function () {
    if (devePularTeste) {
      this.skip();
      return;
    }

    /**
     * Fluxo (3 Registrar novo endereço no ato da compra):
     * 1. Cliente faz login
     * 2. Adiciona livros ao carrinho
     * 3. Navega para checkout
     * 4. Clica em "Adicionar novo endereço"
     * 5. Preenche dados do endereço (rua, número, CEP, cidade, estado)
     * 6. Clica em "Salvar endereço"
     * 7. Sistema valida e salva o novo endereço
     * 8. Novo endereço é automaticamente selecionado para entrega
     * 9. Calcula frete para novo endereço
     * 10. Seleciona opção de frete
     * 11. Conclui pedido
     * 12. Verifica que pedido foi entregue no novo endereço
     * 13. Verifica que endereço aparece na lista de endereços salvos
     */
    /**
     * Fluxo (3 Registrar novo endereço no ato da compra):
     * 1. Cliente faz login
     * 2. Adiciona livros ao carrinho
     * 3. Navega para checkout
     * 4. Clica em "Adicionar novo endereço"
     * 5. Preenche dados do endereço (rua, número, CEP, cidade, estado)
     * 6. Clica em "Salvar endereço"
     * 7. Sistema valida e salva o novo endereço
     * 8. Novo endereço é automaticamente selecionado para entrega
     * 9. Calcula frete para novo endereço
     * 10. Seleciona opção de frete
     * 11. Conclui pedido
     * 12. Verifica que pedido foi entregue no novo endereço
     * 13. Verifica que endereço aparece na lista de endereços salvos
     */
    let novoEnderecoUuid: string;

    // Abrir formulário de novo endereço
    cy.get('[data-cy="checkout-add-address-button"], [data-cy="checkout-add-new-address"]').first().click();
    cy.get('[data-cy="checkout-new-address-form"]').should('be.visible');

    // Preencher dados do endereço
    cy.get('[data-cy="address-apelido"]').clear().type(NOVO_ENDERECO.apelido);
    cy.get('[data-cy="address-cep"]').clear().type(NOVO_ENDERECO.cep);
    cy.get('[data-cy="address-logradouro"]').clear().type(NOVO_ENDERECO.logradouro);
    cy.get('[data-cy="address-numero"]').clear().type(NOVO_ENDERECO.numero);
    cy.get('[data-cy="address-complemento"]').clear().type(NOVO_ENDERECO.complemento);
    cy.get('[data-cy="address-bairro"]').clear().type(NOVO_ENDERECO.bairro);
    cy.get('[data-cy="address-cidade"]').clear().type(NOVO_ENDERECO.cidade);
    cy.get('[data-cy="address-estado"]').clear().type(NOVO_ENDERECO.estado);

    // Salvar endereço
    cy.get('[data-cy="checkout-save-address-button"]').click();

    // Aguardar o modal fechar e o endereço aparecer na lista
    cy.get('[data-cy="checkout-new-address-form"]').should('not.exist');

    // Selecionar o novo endereço pelo seletor data-cy específico
    cy.get('[data-cy^="checkout-address-item-"]').filter(`:contains("${NOVO_ENDERECO.logradouro}")`).first().then(($el) => {
      novoEnderecoUuid = ($el.attr('data-cy') ?? '').replace('checkout-address-item-', '');
      cy.wrap($el).click();
    });

    // Verificar que o endereço selecionado contém o logradouro correto
    cy.get('[data-cy="checkout-address-selected"]').should('be.visible').and('contain.text', NOVO_ENDERECO.logradouro);

    // Calcular frete para o novo endereço e selecionar
    cy.get('[data-cy="checkout-freight-zip-input"]').scrollIntoView().clear({ force: true }).type(NOVO_ENDERECO.cep);
    cy.get('[data-cy="checkout-freight-calculate-button"]').click();
    cy.get('[data-cy="checkout-freight-options"]').should('be.visible');
    cy.get('[data-cy="checkout-freight-option-PAC"]').scrollIntoView().click();
    cy.get('[data-cy="checkout-freight-selected-info"]').should('be.visible');

    // Verificar que o endereço selecionado corresponde ao criado antes de concluir
    cy.get('[data-cy="checkout-address-selected"]').should('contain.text', NOVO_ENDERECO.logradouro);

    // Concluir pedido (cartão padrão já selecionado)
    cy.get('[data-cy="checkout-finish-button"]').should('not.be.disabled').click();
    cy.url().should('include', '/pedido-confirmado');
    cy.get('[data-cy="confirmado-page"]').should('be.visible');

    // Endereço aparece na lista de endereços salvos
    cy.visit('/minha-conta');
    cy.get('[data-cy="tab-enderecos"]').click();
    cy.get('[data-cy^="endereco-card-"]').filter(`:contains("${NOVO_ENDERECO.apelido}")`).should('be.visible').within(() => {
      cy.contains(NOVO_ENDERECO.logradouro).should('be.visible');
      cy.contains(NOVO_ENDERECO.numero).should('be.visible');
    });

    // Limpeza: remover o endereço criado via API
    // Primeiro precisa obter o token do cliente autenticado
    cy.request({
      method: 'POST',
      url: `${Cypress.env('apiUrl')}/auth/login`,
      headers: {
        'X-Test-Rate-Limit-Key': `cypress-e2e-${Date.now()}`,
      },
      body: { email: 'clientetest@email.com', senha: '@asdf123' },
    }).then((loginRes) => {
      const token = loginRes.body.dados.token;
      cy.request({
        method: 'DELETE',
        url: `${Cypress.env('apiUrl')}/clientes/perfil/enderecos/${novoEnderecoUuid}`,
        headers: {
          'X-Test-Rate-Limit-Key': `cypress-e2e-${Date.now()}`,
          'Authorization': `Bearer ${token}`,
        },
      }).then(() => {
        cy.log('Endereço de teste removido com sucesso');
      });
    });
  });
});
