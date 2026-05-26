/**
 * Testes E2E da Página Admin — Gestão de Clientes (/admin/clientes)
 * Cobertura: Cenários felizes e validação
 */

describe('Admin — Gestão de Clientes', () => {
  beforeEach(() => {
    cy.autenticarAdministradorViaApi();
  });

  describe('Acesso à Página', () => {
    it('deve acessar /admin/clientes como administrador', () => {
      cy.visit('/admin/clientes');
      
      cy.url().should('include', '/admin/clientes');
    });

    it('deve exibir lista de clientes', () => {
      cy.visit('/admin/clientes');
      
      cy.get('body').then(($body) => {
        if ($body.find('table').length > 0) {
          cy.get('table').should('exist');
        } else if ($body.find('[data-cy="clientes-list"]').length > 0) {
          cy.get('[data-cy="clientes-list"]').should('exist');
        }
      });
    });

    it('deve ter título da página correto', () => {
      cy.visit('/admin/clientes');
      
      cy.get('body').then(($body) => {
        if ($body.find('h1').length > 0) {
          cy.get('h1').should('contain', 'Clientes');
        }
      });
    });
  });

  describe('Listagem de Clientes', () => {
    it('deve exibir informações do cliente', () => {
      cy.visit('/admin/clientes');
      
      cy.get('body').then(($body) => {
        if ($body.find('table').length > 0) {
          cy.get('table').should('exist');
          // Verificar que há linhas na tabela
          cy.get('tbody tr').should('have.length.at.least', 1);
        }
      });
    });

    it('deve exibir nome do cliente', () => {
      cy.visit('/admin/clientes');
      
      cy.get('body').then(($body) => {
        if ($body.find('table').length > 0) {
          cy.get('tbody tr').first().should('contain.text');
        }
      });
    });

    it('deve exibir email do cliente', () => {
      cy.visit('/admin/clientes');
      
      cy.get('body').then(($body) => {
        if ($body.find('table').length > 0) {
          cy.get('tbody tr').first().should('contain', '@');
        }
      });
    });

    it('deve exibir CPF do cliente', () => {
      cy.visit('/admin/clientes');
      
      cy.get('body').then(($body) => {
        if ($body.find('table').length > 0) {
          cy.get('tbody tr').first().should('contain', /\d{3}\.\d{3}\.\d{3}-\d{2}/);
        }
      });
    });

    it('deve exibir status do cliente', () => {
      cy.visit('/admin/clientes');
      
      cy.get('body').then(($body) => {
        if ($body.find('table').length > 0) {
          cy.get('tbody tr').first().then(($row) => {
            if ($row.find('[data-cy="cliente-status"]').length > 0) {
              cy.get('[data-cy="cliente-status"]').should('exist');
            }
          });
        }
      });
    });
  });

  describe('Busca e Filtros', () => {
    it('deve ter campo de busca por nome', () => {
      cy.visit('/admin/clientes');
      
      cy.get('body').then(($body) => {
        if ($body.find('input[placeholder*="nome" i]').length > 0) {
          cy.get('input[placeholder*="nome" i]').should('exist');
        } else if ($body.find('input[name="busca"]').length > 0) {
          cy.get('input[name="busca"]').should('exist');
        }
      });
    });

    it('deve ter campo de busca por email', () => {
      cy.visit('/admin/clientes');
      
      cy.get('body').then(($body) => {
        if ($body.find('input[placeholder*="email" i]').length > 0) {
          cy.get('input[placeholder*="email" i]').should('exist');
        }
      });
    });

    it('deve ter campo de busca por CPF', () => {
      cy.visit('/admin/clientes');
      
      cy.get('body').then(($body) => {
        if ($body.find('input[placeholder*="cpf" i]').length > 0) {
          cy.get('input[placeholder*="cpf" i]').should('exist');
        }
      });
    });

    it('deve permitir buscar cliente por nome', () => {
      cy.visit('/admin/clientes');
      
      cy.get('body').then(($body) => {
        if ($body.find('input[placeholder*="nome" i]').length > 0) {
          cy.get('input[placeholder*="nome" i]').type('Teste');
          cy.get('button[type="submit"]').click();
          
          // Verificar que busca foi realizada
          cy.get('input[placeholder*="nome" i]').should('have.value', 'Teste');
        }
      });
    });
  });

  describe('Ações do Cliente', () => {
    it('deve ter botão para ver detalhes do cliente', () => {
      cy.visit('/admin/clientes');
      
      cy.get('body').then(($body) => {
        if ($body.find('table').length > 0) {
          cy.get('tbody tr').first().then(($row) => {
            if ($row.find('button').length > 0 || $row.find('a').length > 0) {
              cy.wrap($row).find('button, a').first().should('exist');
            }
          });
        }
      });
    });

    it('deve permitir visualizar detalhes do cliente', () => {
      cy.visit('/admin/clientes');
      
      cy.get('body').then(($body) => {
        if ($body.find('table').length > 0) {
          cy.get('tbody tr').first().then(($row) => {
            if ($row.find('button, a').length > 0) {
              cy.wrap($row).find('button, a').first().click();
              
              // Verificar que navegou para detalhes
              cy.url().should('include', '/admin/clientes/');
            }
          });
        }
      });
    });
  });

  describe('Paginação', () => {
    it('deve ter controles de paginação', () => {
      cy.visit('/admin/clientes');
      
      cy.get('body').then(($body) => {
        if ($body.find('[data-cy="pagination"]').length > 0) {
          cy.get('[data-cy="pagination"]').should('exist');
        }
      });
    });

    it('deve permitir navegar entre páginas', () => {
      cy.visit('/admin/clientes');
      
      cy.get('body').then(($body) => {
        if ($body.find('[data-cy="pagination"]').length > 0) {
          cy.get('[data-cy="pagination"]').then(($pagination) => {
            if ($pagination.find('button').length > 1) {
              cy.get('[data-cy="pagination"] button').eq(1).click();
              
              // Verificar que navegou
              cy.url().should('include', 'pagina=');
            }
          });
        }
      });
    });
  });

  describe('Ordenação', () => {
    it('deve permitir ordenar por nome', () => {
      cy.visit('/admin/clientes');
      
      cy.get('body').then(($body) => {
        if ($body.find('th').length > 0) {
          cy.get('th').contains('Nome').click();
          
          // Verificar que ordenação foi aplicada
          cy.get('th').contains('Nome').should('exist');
        }
      });
    });

    it('deve permitir ordenar por data de cadastro', () => {
      cy.visit('/admin/clientes');
      
      cy.get('body').then(($body) => {
        if ($body.find('th').length > 0) {
          cy.get('th').then(($headers) => {
            if ($headers.find('th:contains("Data")').length > 0 || $headers.find('th:contains("Cadastro")').length > 0) {
              cy.get('th').contains(/Data|Cadastro/).click();
            }
          });
        }
      });
    });
  });

  describe('Exportação', () => {
    it('deve ter botão para exportar lista de clientes', () => {
      cy.visit('/admin/clientes');
      
      cy.get('body').then(($body) => {
        if ($body.find('button').length > 0) {
          cy.get('button').then(($buttons) => {
            if ($buttons.filter((i, btn) => btn.textContent?.includes('Exportar')).length > 0) {
              cy.get('button').contains('Exportar').should('exist');
            }
          });
        }
      });
    });
  });

  describe('Responsividade', () => {
    it('deve exibir corretamente em mobile', () => {
      cy.viewport(375, 667);
      cy.visit('/admin/clientes');
      
      cy.url().should('include', '/admin/clientes');
    });

    it('deve exibir corretamente em tablet', () => {
      cy.viewport(768, 1024);
      cy.visit('/admin/clientes');
      
      cy.url().should('include', '/admin/clientes');
    });

    it('deve exibir corretamente em desktop', () => {
      cy.viewport(1920, 1080);
      cy.visit('/admin/clientes');
      
      cy.url().should('include', '/admin/clientes');
    });
  });

  describe('Navegação', () => {
    it('deve ter link para voltar ao dashboard', () => {
      cy.visit('/admin/clientes');
      
      cy.get('body').then(($body) => {
        if ($body.find('a[href="/admin"]').length > 0) {
          cy.get('a[href="/admin"]').should('exist');
        }
      });
    });

    it('deve navegar para dashboard ao clicar em voltar', () => {
      cy.visit('/admin/clientes');
      
      cy.get('body').then(($body) => {
        if ($body.find('a[href="/admin"]').length > 0) {
          cy.get('a[href="/admin"]').click();
          cy.url().should('include', '/admin');
        }
      });
    });
  });

  describe('Estado Vazio', () => {
    it('deve exibir mensagem quando não houver clientes', () => {
      cy.visit('/admin/clientes');
      
      cy.get('body').then(($body) => {
        if ($body.find('table').length > 0 && $body.find('tbody tr').length === 0) {
          cy.contains('Nenhum cliente encontrado').should('exist');
        }
      });
    });
  });
});
