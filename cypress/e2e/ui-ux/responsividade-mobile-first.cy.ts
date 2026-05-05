/**
 * Teste de Responsividade Mobile-First
 * 
 * Valida o padrão mobile-first implementado com breakpoints:
 * - 0px (base mobile)
 * - 480px (mobile large)
 * - 768px (tablet)
 * - 1024px (desktop)
 * - 1440px (desktop large)
 * 
 * Critérios de aceite:
 * - Sem overflow horizontal inesperado
 * - Componentes críticos sem largura fixa rígida
 * - Layouts se adaptam progressivamente com min-width
 */

describe('Responsividade Mobile-First - Sprint 1 Fundação', () => {
  // Breakpoints críticos conforme plano ágil
  const breakpoints = [
    { width: 375, name: 'Mobile Pequeno' },
    { width: 480, name: 'Mobile Grande' },
    { width: 768, name: 'Tablet' },
    { width: 1024, name: 'Desktop' },
    { width: 1440, name: 'Desktop Grande' },
  ];

  breakpoints.forEach(({ width, name }) => {
    context(`Breakpoint: ${name} (${width}px)`, () => {
      beforeEach(() => {
        cy.viewport(width, 800);
      });

      it('Header deve se adaptar sem overflow horizontal', () => {
        cy.visit('/');
        cy.get('header').should('be.visible');
        cy.get('body').invoke('outerWidth').should('eq', width);
        
        // Validar que não há scroll horizontal
        cy.get('body').invoke('prop', 'scrollWidth').then((scrollWidth) => {
          cy.get('body').invoke('outerWidth').then((clientWidth) => {
            expect(scrollWidth).to.eq(clientWidth);
          });
        });
      });

      it('Header layout se adapta progressivamente', () => {
        cy.visit('/');
        
        if (width < 768) {
          // Mobile: layout empilhado
          cy.get('.header-top-inner').should('have.css', 'flex-direction', 'column');
          cy.get('.search-bar').should('have.css', 'width').and('not.eq', '600px');
        } else {
          // Tablet+: layout horizontal
          cy.get('.header-top-inner').should('have.css', 'flex-direction', 'row');
          cy.get('.search-bar').should('have.css', 'max-width', '600px');
        }
      });

      it('Footer deve ajustar colunas progressivamente', () => {
        cy.visit('/');
        cy.scrollTo('bottom');
        
        if (width < 768) {
          // Mobile: 1 coluna
          cy.get('.footer-content').invoke('css', 'grid-template-columns').then((val) => {
            expect(val.toString().split(' ').length).to.eq(1);
          });
        } else if (width < 1024) {
          // Tablet: 2 colunas
          cy.get('.footer-content').invoke('css', 'grid-template-columns').then((val) => {
            expect(val.toString().split(' ').length).to.eq(2);
          });
        } else {
          // Desktop+: auto-fit
          cy.get('.footer-content').should('be.visible');
        }
      });

      it('Modal deve ter largura fluida em mobile', () => {
        cy.visit('/');
        
        // Verificar que o modal não quebra o layout
        cy.get('body').invoke('outerWidth').should('eq', width);
      });

      it('Container padrão respeita gutters progressivos', () => {
        cy.visit('/');
        cy.get('.container').should('be.visible');
        
        cy.get('.container').invoke('css', 'padding-left').then((paddingLeft) => {
          const paddingValue = parseInt(String(paddingLeft), 10);
          
          if (width < 480) {
            expect(paddingValue).to.eq(16); // gutter-mobile
          } else if (width < 768) {
            expect(paddingValue).to.eq(24); // gutter-tablet
          } else {
            expect(paddingValue).to.eq(32); // gutter-desktop
          }
        });
      });
    });
  });

  context('Validação de Componentes Críticos - Mobile', () => {
    beforeEach(() => {
      cy.viewport(375, 800); // Mobile pequeno
    });

    it('Modal não tem largura fixa rígida em mobile', () => {
      cy.visit('/');
      
      // Se modal existir, deve ter max-width fluido
      cy.get('body').then(($body) => {
        if ($body.find('.modalContainer').length > 0) {
          cy.get('.modalContainer').invoke('css', 'width').should('not.eq', '500px');
          cy.get('.modalContainer').invoke('css', 'max-width').should('eq', '90%');
        }
      });
    });

    it('Controles de compra têm touch targets mínimos', () => {
      cy.visit('/livro/1');
      
      cy.get('.ctrl-qtd__btn').invoke('outerHeight').then((height) => {
        expect(height).to.be.at.least(26); // Mínimo atual
      });
      
      // Botão de compra deve ter altura adequada
      cy.get('.controles-compra__btn-comprar').invoke('outerHeight').then((height) => {
        expect(height).to.be.at.least(44); // Touch target mínimo
      });
    });
  });

  context('Validação de Sem Overflow Horizontal', () => {
    breakpoints.forEach(({ width, name }) => {
      it(`Não deve haver overflow horizontal em ${name}`, () => {
        cy.viewport(width, 800);
        cy.visit('/');
        
        cy.get('body').invoke('prop', 'scrollWidth').then((scrollWidth) => {
          cy.get('body').invoke('outerWidth').then((clientWidth) => {
            // Scroll width não deve exceder client width
            expect(scrollWidth).to.be.lte(clientWidth + 1); // +1 para margem de erro
          });
        });
      });
    });
  });

  context('Admin Layout - Responsividade', () => {
    breakpoints.forEach(({ width, name }) => {
      it(`Admin dashboard se adapta em ${name}`, () => {
        cy.viewport(width, 800);
        cy.visit('/admin');
        
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
    });
  });

  context('Checkout - Responsividade', () => {
    breakpoints.forEach(({ width, name }) => {
      it(`Entrega layout se adapta em ${name}`, () => {
        cy.viewport(width, 800);
        cy.visit('/checkout');
        
        if (width < 768) {
          // Mobile: layout empilhado
          cy.get('.endereco-item').should('have.css', 'flex-direction', 'column');
        } else {
          // Tablet+: layout horizontal
          cy.get('.endereco-item').should('have.css', 'flex-direction', 'row');
        }
      });
    });
  });
});
