/**
 * Testes E2E para gerenciamento de loja ativa.
 * Valida:
 * - Leitura do cookie x-loja-uuid
 * - Busca de dados da loja via API
 * - Armazenamento em Redux
 * - Troca de loja
 */

describe('Loja Ativa', () => {
  const lojaUuidMock = '550e8400-e29b-41d4-a716-446655440000';
  const lojaMock = {
    uuid: lojaUuidMock,
    nome: 'Livraria Exemplo',
    slug: 'livraria-exemplo',
    cnpj: '12.345.678/0001-90',
    ativo: true,
  };

  beforeEach(() => {
    // Limpar cookies antes de cada teste
    cy.clearCookies();
  });

  describe('Inicialização com cookie', () => {
    it('deve carregar loja ao encontrar cookie x-loja-uuid', () => {
      // Configurar cookie
      cy.setCookie('x-loja-uuid', lojaUuidMock);

      // Interceptar requisição à API
      cy.intercept('GET', `/api/loja/tenante/${lojaUuidMock}`, {
        statusCode: 200,
        body: lojaMock,
      }).as('buscarLoja');

      // Visitar página
      cy.visit('/');

      // Validar que a requisição foi feita
      cy.wait('@buscarLoja');

      // Validar que a loja foi armazenada no Redux
      cy.window().then((win) => {
        const state = (win as any).__REDUX_DEVTOOLS_EXTENSION__?.();
        expect(state?.loja?.lojaAtiva?.uuid).to.equal(lojaUuidMock);
      });
    });

    it('não deve fazer requisição se cookie não existir', () => {
      // Não configurar cookie
      cy.intercept('GET', '/api/loja/tenante/*', {
        statusCode: 200,
        body: lojaMock,
      }).as('buscarLoja');

      cy.visit('/');

      // Validar que a requisição NÃO foi feita
      cy.get('@buscarLoja.all').should('have.length', 0);
    });

    it('deve exibir erro ao falhar na busca da loja', () => {
      cy.setCookie('x-loja-uuid', lojaUuidMock);

      cy.intercept('GET', `/api/loja/tenante/${lojaUuidMock}`, {
        statusCode: 500,
        body: { erro: 'Erro ao carregar loja' },
      }).as('buscarLojaErro');

      cy.visit('/');

      cy.wait('@buscarLojaErro');

      // Validar que o erro foi armazenado no Redux
      cy.window().then((win) => {
        const state = (win as any).__REDUX_DEVTOOLS_EXTENSION__?.();
        expect(state?.loja?.erro).to.exist;
      });
    });
  });

  describe('Troca de loja', () => {
    it('deve trocar loja ao chamar trocarLoja', () => {
      const novaLojaUuid = '660e8400-e29b-41d4-a716-446655440001';
      const novaLojaMock = {
        uuid: novaLojaUuid,
        nome: 'Livraria Nova',
        slug: 'livraria-nova',
        cnpj: '98.765.432/0001-10',
        ativo: true,
      };

      cy.setCookie('x-loja-uuid', lojaUuidMock);

      cy.intercept('GET', `/api/loja/tenante/${lojaUuidMock}`, {
        statusCode: 200,
        body: lojaMock,
      }).as('buscarLojaInicial');

      cy.intercept('GET', `/api/loja/tenante/${novaLojaUuid}`, {
        statusCode: 200,
        body: novaLojaMock,
      }).as('buscarNovaLoja');

      cy.visit('/');

      cy.wait('@buscarLojaInicial');

      // Simular troca de loja (via componente ou diretamente no Redux)
      cy.window().then((win) => {
        const dispatch = (win as any).__REDUX_DEVTOOLS_EXTENSION__?.dispatch;
        if (dispatch) {
          dispatch({ type: 'loja/buscarLojaAtiva/pending' });
        }
      });

      // Validar que a nova loja foi carregada
      cy.wait('@buscarNovaLoja');
    });
  });

  describe('Persistência', () => {
    it('deve persistir loja no localStorage', () => {
      cy.setCookie('x-loja-uuid', lojaUuidMock);

      cy.intercept('GET', `/api/loja/tenante/${lojaUuidMock}`, {
        statusCode: 200,
        body: lojaMock,
      }).as('buscarLoja');

      cy.visit('/');

      cy.wait('@buscarLoja');

      // Validar que a loja foi persistida
      cy.window().then((win) => {
        const persistedState = localStorage.getItem('persist:root');
        expect(persistedState).to.exist;
        const parsed = JSON.parse(persistedState || '{}');
        expect(parsed.loja).to.exist;
      });
    });
  });

  describe('Estados de carregamento', () => {
    it('deve exibir carregando enquanto busca loja', () => {
      cy.setCookie('x-loja-uuid', lojaUuidMock);

      cy.intercept('GET', `/api/loja/tenante/${lojaUuidMock}`, (req) => {
        req.reply((res) => {
          res.delay(1000); // Simular delay
          res.send({
            statusCode: 200,
            body: lojaMock,
          });
        });
      }).as('buscarLojaComDelay');

      cy.visit('/');

      // Validar que carregando está true
      cy.window().then((win) => {
        const state = (win as any).__REDUX_DEVTOOLS_EXTENSION__?.();
        expect(state?.loja?.carregando).to.be.true;
      });

      cy.wait('@buscarLojaComDelay');

      // Validar que carregando está false
      cy.window().then((win) => {
        const state = (win as any).__REDUX_DEVTOOLS_EXTENSION__?.();
        expect(state?.loja?.carregando).to.be.false;
      });
    });
  });
});
