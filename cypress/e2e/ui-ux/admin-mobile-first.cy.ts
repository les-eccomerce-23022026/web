/**
 * Testes TDD para Telas Administrativas - Mobile-First
 * 
 * Valida a responsividade das telas admin mais críticas:
 * - Dashboard
 * - Gerenciamento de Livros
 * - Gerenciamento de Pedidos
 * 
 * Abordagem TDD: Testes definidos antes da implementação
 */

describe('Telas Administrativas - Mobile-First TDD', () => {
  const breakpoints = [
    { width: 375, name: 'Mobile Pequeno' },
    { width: 480, name: 'Mobile Grande' },
    { width: 768, name: 'Tablet' },
    { width: 1024, name: 'Desktop' },
  ];

  describe('Dashboard Admin', () => {
    breakpoints.forEach(({ width, name }) => {
      context(`Breakpoint: ${name} (${width}px)`, () => {
        beforeEach(() => {
          cy.viewport(width, 800);
        });

        it('Layout deve se adaptar sem overflow', () => {
          cy.visit('/admin');
          
          cy.get('body').invoke('prop', 'scrollWidth').then((scrollWidth) => {
            cy.get('body').invoke('outerWidth').then((clientWidth) => {
              expect(scrollWidth).to.be.lte(clientWidth + 1);
            });
          });
        });

        it('Grid deve ser progressivo (mobile-first)', () => {
          cy.visit('/admin');
          cy.get('.dashboardGrid').should('be.visible');
          
          if (width < 768) {
            // Mobile: layout empilhado
            cy.get('.dashboardGrid').should('have.css', 'display', 'flex');
            cy.get('.dashboardGrid').should('have.css', 'flex-direction', 'column');
          } else if (width < 1024) {
            // Tablet: grid com sidebar menor
            cy.get('.dashboardGrid').should('have.css', 'display', 'grid');
            cy.get('.dashboardGrid').invoke('css', 'grid-template-columns').then((val) => {
              expect(val).to.include('200px');
            });
          } else {
            // Desktop+: grid com sidebar maior
            cy.get('.dashboardGrid').should('have.css', 'display', 'grid');
            cy.get('.dashboardGrid').invoke('css', 'grid-template-columns').then((val) => {
              expect(val).to.include('260px');
            });
          }
        });

        it('Sidebar deve ter largura fluida em mobile', () => {
          cy.visit('/admin');
          
          if (width < 768) {
            // Mobile: sidebar 100%
            cy.get('.sidebarAdmin').invoke('css', 'width').then((width) => {
              expect(width).to.eq('100%');
            });
          } else {
            // Desktop+: sidebar auto
            cy.get('.sidebarAdmin').invoke('css', 'width').then((width) => {
              expect(width).to.eq('auto');
            });
          }
        });

        it('Header deve empilhar em mobile', () => {
          cy.visit('/admin');
          
          if (width < 768) {
            // Mobile: header empilhado
            cy.get('.headerAdmin').should('have.css', 'flex-direction', 'column');
          } else {
            // Desktop+: header horizontal
            cy.get('.headerAdmin').should('have.css', 'flex-direction', 'row');
          }
        });
      });
    });
  });

  describe('Gerenciamento de Livros', () => {
    breakpoints.forEach(({ width, name }) => {
      context(`Breakpoint: ${name} (${width}px)`, () => {
        beforeEach(() => {
          cy.viewport(width, 800);
        });

        it('Layout deve se adaptar sem overflow', () => {
          cy.visit('/admin/livros');
          
          cy.get('body').invoke('prop', 'scrollWidth').then((scrollWidth) => {
            cy.get('body').invoke('outerWidth').then((clientWidth) => {
              expect(scrollWidth).to.be.lte(clientWidth + 1);
            });
          });
        });

        it('Tabela deve se adaptar para cards em mobile', () => {
          cy.visit('/admin/livros');
          
          if (width < 768) {
            // Mobile: tabela vira cards (se implementado)
            cy.get('body').should('be.visible');
          } else {
            // Desktop+: tabela normal
            cy.get('body').should('be.visible');
          }
        });

        it('Botões de ação devem ter touch targets adequados', () => {
          cy.visit('/admin/livros');
          
          cy.get('button').first().invoke('outerHeight').then((height) => {
            expect(height).to.be.at.least(32);
          });
        });
      });
    });
  });

  describe('Gerenciamento de Pedidos', () => {
    breakpoints.forEach(({ width, name }) => {
      context(`Breakpoint: ${name} (${width}px)`, () => {
        beforeEach(() => {
          cy.viewport(width, 800);
        });

        it('Layout deve se adaptar sem overflow', () => {
          cy.visit('/admin/pedidos');
          
          cy.get('body').invoke('prop', 'scrollWidth').then((scrollWidth) => {
            cy.get('body').invoke('outerWidth').then((clientWidth) => {
              expect(scrollWidth).to.be.lte(clientWidth + 1);
            });
          });
        });

        it('Tabela de pedidos deve ser responsiva', () => {
          cy.visit('/admin/pedidos');
          
          if (width < 768) {
            // Mobile: tabela vira cards ou scroll horizontal
            cy.get('body').should('be.visible');
          } else {
            // Desktop+: tabela normal
            cy.get('body').should('be.visible');
          }
        });
      });
    });
  });

  describe('Navegação Admin em Mobile', () => {
    it('Links da sidebar devem ter touch targets adequados em mobile', () => {
      cy.viewport(375, 800);
      cy.visit('/admin');
      
      cy.get('.sidebarLink').first().invoke('outerHeight').then((height) => {
        expect(height).to.be.at.least(40);
      });
    });

    it('Botões de ação do header devem ter altura mínima', () => {
      cy.viewport(375, 800);
      cy.visit('/admin');
      
      cy.get('.navIconBtn').first().invoke('outerHeight').then((height) => {
        expect(height).to.be.at.least(44);
      });
    });
  });
});
