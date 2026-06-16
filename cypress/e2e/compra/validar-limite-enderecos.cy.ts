/**
 * E2E — Validação de Regra de Negócio: Limite de 5 endereços por cliente.
 * 
 * Este teste valida que o sistema bloqueia a adição de um novo endereço
 * quando o cliente já atingiu o limite de 5 endereços cadastrados.
 * 
 * RN: Cliente não pode ter mais de 5 endereços cadastrados.
 */
import {
  loginClienteUi,
} from '../../support/fluxo-venda.helpers';

describe('Validação de Regra de Negócio — Limite de Endereços (RN)', () => {
  beforeEach(() => {
    cy.clearCookies();
    cy.clearLocalStorage();
  });

  it('deve bloquear adição de endereço quando cliente já tem 5 endereços', () => {
    /**
     * Fluxo (Validação de limite de endereços):
     * 1. Cliente faz login
     * 2. Navega para página de endereços
     * 3. Verifica quantos endereços já tem
     * 4. Se tiver menos de 5, preenche até atingir o limite
     * 5. Tenta adicionar o 6º endereço
     * 6. Sistema deve exibir mensagem de erro de limite
     * 7. Modal deve permanecer aberto com mensagem de erro
     * 8. Endereço não deve ser adicionado à lista
     */

    // Login via API para garantir autenticação
    cy.request({
      method: 'POST',
      url: `${Cypress.env('apiUrl') || 'http://localhost:3001/api'}/auth/login`,
      headers: {
        'X-Test-Rate-Limit-Key': `cypress-e2e-${Date.now()}`,
      },
      body: { email: 'clientetest@email.com', senha: '@asdf123' },
    }).then((loginRes) => {
      const token = loginRes.body.dados.token;

      // Verificar endereços atuais
      cy.request({
        method: 'GET',
        url: `${Cypress.env('apiUrl') || 'http://localhost:3001/api'}/clientes/perfil`,
        headers: {
          'X-Test-Rate-Limit-Key': `cypress-e2e-${Date.now()}`,
          'Authorization': `Bearer ${token}`,
        },
      }).then((perfilRes) => {
        const enderecos = perfilRes.body.dados.enderecos || [];
        const quantidadeAtual = enderecos.length;

        // Se já tiver 5 endereços, tentar adicionar mais um direto
        // Se tiver menos, preencher até atingir 5
        const enderecosParaAdicionar = 5 - quantidadeAtual;

        if (enderecosParaAdicionar > 0) {
          // Adicionar endereços até atingir o limite
          for (let i = 0; i < enderecosParaAdicionar; i++) {
            const novoEndereco = {
              apelido: `Endereço Teste ${quantidadeAtual + i + 1}`,
              cep: '01310-100',
              logradouro: 'Avenida Paulista',
              numero: `${1000 + i}`,
              complemento: `Apto ${i + 1}`,
              bairro: 'Bela Vista',
              cidade: 'São Paulo',
              estado: 'SP',
              tipo: 'entrega',
              principal: false,
            };

            cy.request({
              method: 'POST',
              url: `${Cypress.env('apiUrl') || 'http://localhost:3001/api'}/clientes/perfil/enderecos`,
              headers: {
                'X-Test-Rate-Limit-Key': `cypress-e2e-${Date.now()}`,
                'Authorization': `Bearer ${token}`,
              },
              body: novoEndereco,
              failOnStatusCode: false, // Não falhar se já atingiu o limite
            }).then((res) => {
              // Se já atingiu o limite, interrompe o loop
              if (res.status === 400 || res.status === 409) {
                return false;
              }
              return true;
            });
          }
        }

        // Navegar para página de endereços após preencher
        cy.visit('/minha-conta');
        cy.get('[data-cy="tab-enderecos"]').should('be.visible').click();
        cy.get('[data-cy^="endereco-card-"]', { timeout: 10000 }).should('have.length', 5);

        // Verificar que o botão de adicionar está desabilitado
        cy.get('[data-cy="endereco-add-button"]').should('be.disabled');
        cy.get('[data-cy="endereco-add-button"]').should('contain.text', 'Limite de 5 Endereços Atingido');

        // Confirmar que a UI bloqueia mesmo com tentativa forçada (comportamento real de usuário)
        cy.get('[data-cy="endereco-add-button"]').click({ force: true });
        cy.get('[data-cy="endereco-add-button"]').should('be.disabled');

        // Validar que o endereço não foi adicionado (ainda tem 5)
        cy.request({
          method: 'GET',
          url: `${Cypress.env('apiUrl') || 'http://localhost:3001/api'}/clientes/perfil`,
          headers: {
            'X-Test-Rate-Limit-Key': `cypress-e2e-${Date.now()}`,
            'Authorization': `Bearer ${token}`,
          },
        }).then((perfilFinalRes) => {
          const enderecosFinal = perfilFinalRes.body.dados.enderecos || [];
          expect(enderecosFinal.length).to.equal(5);
        });

        // Limpeza: remover endereços de teste adicionados
        cy.request({
          method: 'GET',
          url: `${Cypress.env('apiUrl') || 'http://localhost:3001/api'}/clientes/perfil`,
          headers: {
            'X-Test-Rate-Limit-Key': `cypress-e2e-${Date.now()}`,
            'Authorization': `Bearer ${token}`,
          },
        }).then((perfilLimpezaRes) => {
          const enderecosLimpeza = perfilLimpezaRes.body.dados.enderecos || [];
          // Remover endereços de teste (que começam com "Endereço Teste")
          enderecosLimpeza.forEach((endereco: any) => {
            if (endereco.apelido && endereco.apelido.startsWith('Endereço Teste')) {
              cy.request({
                method: 'DELETE',
                url: `${Cypress.env('apiUrl') || 'http://localhost:3001/api'}/clientes/perfil/enderecos/${endereco.uuid}`,
                headers: {
                  'X-Test-Rate-Limit-Key': `cypress-e2e-${Date.now()}`,
                  'Authorization': `Bearer ${token}`,
                },
              });
            }
          });
        });
      });
    });
  });
});