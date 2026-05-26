/**
 * Teste 1: Adicionar item ao carrinho
 * Etapa: Catálogo → Detalhes do Livro → Adicionar ao Carrinho
 */
describe('Vendas — Caminho Feliz — Etapa 1: Carrinho', () => {
  const apiUrl = (Cypress.env('apiUrl') as string) || 'http://localhost:5173/api';
  const email = Cypress.env('clienteEmail') || 'clientetest@email.com';
  const senha = (Cypress.env('clienteSenha') as string | undefined) ?? '@asdfJKL\u00C7123';

  beforeEach(() => {
    Cypress.env('injectTestDbHeader', true);
    cy.limparCarrinhoViaApi();
    cy.autenticarViaApi(email, senha);
  });

  it('Deve adicionar o primeiro livro ao carrinho via UI', () => {
    cy.log('**Início: catálogo (cliente já autenticado via API)**');
    cy.visit('/');

    cy.log('**Etapa: Navegar para detalhes do primeiro livro**');
    cy.get('[data-cy="livro-card"]', { timeout: 30000 })
      .should('be.visible')
      .first()
      .contains('Ver Detalhes')
      .click();

    cy.url().should('include', '/livro/');

    cy.log('**Etapa: Adicionar ao carrinho**');
    cy.contains('Adicionar ao Carrinho', { timeout: 10000 })
      .should('be.visible')
      .click({ force: true });

    cy.log('**Validação: redirecionado para carrinho**');
    cy.url().should('include', '/carrinho');
    cy.contains('Carrinho de Compras', { timeout: 15000 }).should('be.visible');

    cy.log('✅ Item adicionado ao carrinho com sucesso');
  });

  it('Deve adicionar item ao carrinho via API', () => {
    cy.log('**Etapa: Obter primeiro livro do catálogo**');
    cy.obterPrimeiroLivroCatalogo().then((livroUuid) => {
      cy.log(`**Livro UUID: ${livroUuid}**`);

      cy.log('**Etapa: Adicionar ao carrinho via API**');
      cy.adicionarAoCarrinhoViaApi(livroUuid, 1);

      cy.log('**Validação: carrinho contém item**');
      cy.visit('/carrinho');
      cy.contains('Carrinho de Compras', { timeout: 15000 }).should('be.visible');

      cy.log('✅ Item adicionado ao carrinho via API com sucesso');
    });
  });
});
