// ***********************************************
// This example commands.ts shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Cypress {
    interface Chainable {
      login(email: string, password: string): Chainable<void>;
      loginProgramatico(userType: 'admin' | 'cliente'): Chainable<void>;
      /** Sessão de cliente via API real (banco de testes) — uso em checkout e fluxos autenticados. */
      loginCliente(): Chainable<void>;
      getDataCy(value: string): Chainable<JQuery<HTMLElement>>;
      getNewUser(): Chainable<{ nome: string, cpf: string, email: string, senha: string }>;
    }
  }
}

/**
 * Gera um usuário dinâmico para testes de registro e perfil.
 */
Cypress.Commands.add('getNewUser', () => {
  const n = () => Math.floor(Math.random() * 10).toString();
  const cpf = `${n()}${n()}${n()}.${n()}${n()}${n()}.${n()}${n()}${n()}-${n()}${n()}`;
  return cy.wrap({
    nome: 'João Silva Teste',
    cpf: cpf,
    email: `teste.${Date.now()}.${Math.floor(Math.random() * 1000)}@email.com`,
    senha: 'StrongPass@2026'
  });
});

/**
 * Login via UI - Útil para testar o fluxo completo de login e feedbacks visuais.
 */
Cypress.Commands.add('loginCliente', () => {
  cy.loginProgramatico('cliente');
});

Cypress.Commands.add('login', (email, password) => {
  cy.visit('/minha-conta');
  cy.getDataCy('login-email-input').type(email);
  cy.getDataCy('login-password-input').type(password);
  cy.getDataCy('login-submit-button').click();
  // Aguarda o login ser processado
  cy.url().should('not.include', '/minha-conta');
});

/**
 * Registra um usuário dinamicamente via API e realiza o login programático.
 * Extremamente rápido e isola o estado entre os testes usando cy.session.
 */
Cypress.Commands.add('loginProgramatico', (userType: 'admin' | 'cliente') => {
  const apiUrl = Cypress.env('apiUrl') || 'http://localhost:3000/api';

  if (userType === 'cliente') {
    cy.getNewUser().then((newUser) => {
      cy.session(`session-cliente-${newUser.email}`, () => {
        // Passo 1: Registrar o cliente via API
        cy.request({
          method: 'POST',
          url: `${apiUrl}/clientes/registro`,
          headers: { 'x-use-test-db': 'true' },
          body: {
            nome: newUser.nome,
            cpf: newUser.cpf,
            email: newUser.email,
            senha: newUser.senha,
            confirmacaoSenha: newUser.senha,
            genero: 'Prefiro não informar',
            dataNascimento: '1990-01-01',
            telefone: { tipo: 'Celular', ddd: '11', numero: '999999999' }
          },
          failOnStatusCode: false
        }).then((registroResponse) => {
          if (registroResponse.status !== 201 && registroResponse.status !== 200) {
            throw new Error(`Falha no registro programático: ${registroResponse.body.mensagem || 'Erro desconhecido'}`);
          }

          // Passo 2: Fazer o login via API usando a conta recém-criada
          cy.request({
            method: 'POST',
            url: `${apiUrl}/auth/login`,
            headers: { 'x-use-test-db': 'true' },
            body: { email: newUser.email, senha: newUser.senha },
            failOnStatusCode: false
          }).then((loginResponse) => {
            if (loginResponse.status !== 200) {
              throw new Error(`Falha no login programático (cliente): ${loginResponse.body.mensagem || 'Erro desconhecido'}`);
            }

            const { token, user: userData } = loginResponse.body.dados;
            
            // Passo 3: Persistir a sessão no frontend
            window.sessionStorage.setItem('les_auth_session', JSON.stringify({
              token,
              user: userData
            }));
          });
        });
      }, {
        cacheAcrossSpecs: false
      });
    });
  } else {
    // Para o administrador, chamamos a rota Sandbox de Bootstrap
    // para garantir o setup limpo via código seguro sem seeds manuais.
    const user = Cypress.env('admin') || { email: 'admin@livraria.com.br', senha: 'Admin@123' };
    
    cy.session(`session-admin`, () => {
      cy.request({
        method: 'POST',
        url: `${apiUrl}/admin/bootstrap`,
        headers: { 'x-use-test-db': 'true' },
        failOnStatusCode: false
      }).then((bootstrapResponse) => {
        if (bootstrapResponse.status !== 200 && bootstrapResponse.status !== 201) {
          throw new Error(`Falha no bootstrap do admin: ${bootstrapResponse.body?.mensagem || 'Erro'}`);
        }

        // Após garantir o admin de testes, fazemos o login
        cy.request({
          method: 'POST',
          url: `${apiUrl}/auth/login`,
          headers: { 'x-use-test-db': 'true' },
          body: { email: user.email, senha: user.senha },
          failOnStatusCode: false
        }).then((response) => {
          if (response.status !== 200) {
            throw new Error(`Falha no login programático (admin): ${response.body?.mensagem || 'Erro desconhecido'}`);
          }

          const { token, user: userData } = response.body.dados;
          window.sessionStorage.setItem('les_auth_session', JSON.stringify({
            token,
            user: userData
          }));
        });
      });
    }, {
      cacheAcrossSpecs: false
    });
  }
});

Cypress.Commands.add('getDataCy', (value) => {
  return cy.get(`[data-cy="${value}"]`);
});

export {};
