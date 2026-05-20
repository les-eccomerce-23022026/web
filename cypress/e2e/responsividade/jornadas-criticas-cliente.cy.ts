/**
 * Testes para Jornadas Críticas - Mobile-First
 * 
 * Valida a responsividade das jornadas principais de compra:
 * - Home/Listagem (CatalogoLivros)
 * - Detalhe do Livro
 * - Carrinho
 * - Finalizar Compra
 * 
 * Abordagem: Testes definidos antes da implementação
 */

describe('Responsividade — Jornadas Críticas do Cliente (Mobile)', () => {
  const breakpoints = [
    { width: 375, name: 'Mobile Pequeno' },
    { width: 480, name: 'Mobile Grande' },
    { width: 768, name: 'Tablet' },
    { width: 1024, name: 'Desktop' },
  ];

  describe('Home/Listagem (CatalogoLivros)', () => {
    breakpoints.forEach(({ width, name }) => {
      context(`Breakpoint: ${name} (${width}px)`, () => {
        beforeEach(() => {
          cy.viewport(width, 800);
        });

        it('Grade de produtos deve se adaptar sem overflow', () => {
          cy.visit('/');
          
          // Verificar que não há overflow horizontal
          cy.get('body').invoke('prop', 'scrollWidth').then((scrollWidth) => {
            cy.get('body').invoke('outerWidth').then((clientWidth) => {
              expect(scrollWidth).to.be.lte(clientWidth + 1);
            });
          });
        });

        it('Cartões de livro devem ter touch targets adequados', () => {
          cy.visit('/');
          cy.get('.cartao-livro').first().should('be.visible');
          
          // Botões de quantidade devem ter altura mínima
          cy.get('.ctrl-qtd__btn').first().invoke('outerHeight').then((height) => {
            expect(height).to.be.at.least(26);
          });
        });

        it('Grade deve ter colunas progressivas', () => {
          cy.visit('/');
          cy.get('.grade--produto').should('be.visible');
          
          if (width < 480) {
            // Mobile: 1 coluna
            cy.get('.grade--produto').invoke('css', 'grid-template-columns').then((val) => {
              expect(val.toString().split(' ').length).to.eq(1);
            });
          } else if (width < 768) {
            // Mobile grande: 2 colunas
            cy.get('.grade--produto').invoke('css', 'grid-template-columns').then((val) => {
              expect(val.toString().split(' ').length).to.eq(2);
            });
          } else {
            // Desktop+: auto-fill com minmax
            cy.get('.grade--produto').should('be.visible');
          }
        });

        it('Banner deve ser responsivo', () => {
          cy.visit('/');
          
          if (width < 768) {
            // Mobile: banner com altura reduzida
            cy.get('.pagina-inicio__banner').invoke('css', 'height').then((height) => {
              expect(parseInt(String(height), 10)).to.be.lte(200);
            });
          }
        });
      });
    });
  });

  describe('Detalhe do Livro', () => {
    breakpoints.forEach(({ width, name }) => {
      context(`Breakpoint: ${name} (${width}px)`, () => {
        beforeEach(() => {
          cy.viewport(width, 800);
        });

        it('Layout deve se adaptar sem overflow', () => {
          cy.visit('/livro/1');
          
          cy.get('body').invoke('prop', 'scrollWidth').then((scrollWidth) => {
            cy.get('body').invoke('outerWidth').then((clientWidth) => {
              expect(scrollWidth).to.be.lte(clientWidth + 1);
            });
          });
        });

        it('Grid deve ser progressivo (mobile-first)', () => {
          cy.visit('/livro/1');
          cy.get('.detalhes-grid').should('be.visible');
          
          if (width < 768) {
            // Mobile: layout empilhado (flex column)
            cy.get('.detalhes-grid').should('have.css', 'display', 'flex');
            cy.get('.detalhes-grid').should('have.css', 'flex-direction', 'column');
          } else {
            // Tablet+: grid com 2 colunas
            cy.get('.detalhes-grid').should('have.css', 'display', 'grid');
            cy.get('.detalhes-grid').invoke('css', 'grid-template-columns').then((val) => {
              expect(val).to.include('1fr');
              expect(val).to.include('2fr');
            });
          }
        });

        it('Imagem deve ser responsiva', () => {
          cy.visit('/livro/1');
          cy.get('.detalhes-img').should('be.visible');
          
          // Imagem deve ter width 100% em mobile
          cy.get('.detalhes-img').invoke('css', 'width').then((width) => {
            expect(width).to.eq('100%');
          });
        });

        it('Breadcrumb deve ser legível em mobile', () => {
          cy.visit('/livro/1');
          cy.get('.detalhes-breadcrumb').should('be.visible');
          
          if (width < 480) {
            // Mobile: breadcrumb pode ter font-size reduzido
            cy.get('.detalhes-breadcrumb').invoke('css', 'font-size').then((fontSize) => {
              expect(parseInt(String(fontSize), 10)).to.be.at.most(13);
            });
          }
        });
      });
    });
  });

  describe('Carrinho', () => {
    breakpoints.forEach(({ width, name }) => {
      context(`Breakpoint: ${name} (${width}px)`, () => {
        beforeEach(() => {
          cy.viewport(width, 800);
        });

        it('Página deve usar container padrão responsivo', () => {
          cy.visit('/carrinho');
          cy.get('.carrinho-page').should('be.visible');
          
          // Verificar padding progressivo
          cy.get('.carrinho-page').invoke('css', 'padding-left').then((paddingLeft) => {
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

        it('Tabela deve se adaptar para cards em mobile', () => {
          cy.visit('/carrinho');
          
          if (width < 768) {
            // Mobile: tabela vira cards
            cy.get('.carrinho-table').should('have.css', 'display', 'block');
            cy.get('.carrinho-table-header').should('have.css', 'display', 'none');
          } else {
            // Desktop+: tabela normal
            cy.get('.carrinho-table').should('have.css', 'display', 'table');
            cy.get('.carrinho-table-header').should('be.visible');
          }
        });

        it('Resumo deve empilhar em mobile', () => {
          cy.visit('/carrinho');
          
          if (width < 768) {
            // Mobile: resumo empilhado
            cy.get('.carrinho-resumo').should('have.css', 'flex-direction', 'column');
          } else {
            // Desktop+: resumo horizontal
            cy.get('.carrinho-resumo').should('have.css', 'flex-direction', 'row');
          }
        });

        it('Sem overflow horizontal', () => {
          cy.visit('/carrinho');
          
          cy.get('body').invoke('prop', 'scrollWidth').then((scrollWidth) => {
            cy.get('body').invoke('outerWidth').then((clientWidth) => {
              expect(scrollWidth).to.be.lte(clientWidth + 1);
            });
          });
        });
      });
    });
  });

  describe('Finalizar Compra (Checkout)', () => {
    breakpoints.forEach(({ width, name }) => {
      context(`Breakpoint: ${name} (${width}px)`, () => {
        beforeEach(() => {
          cy.viewport(width, 800);
        });

        it('Layout deve se adaptar sem overflow', () => {
          cy.visit('/checkout');
          
          cy.get('body').invoke('prop', 'scrollWidth').then((scrollWidth) => {
            cy.get('body').invoke('outerWidth').then((clientWidth) => {
              expect(scrollWidth).to.be.lte(clientWidth + 1);
            });
          });
        });

        it('Grid de checkout deve ser progressivo', () => {
          cy.visit('/checkout');
          
          if (width < 768) {
            // Mobile: layout empilhado
            cy.get('.checkout-grid').should('have.css', 'display', 'flex');
            cy.get('.checkout-grid').should('have.css', 'flex-direction', 'column');
          } else {
            // Desktop+: grid
            cy.get('.checkout-grid').should('have.css', 'display', 'grid');
          }
        });
      });
    });
  });

  describe('Touch Targets - Validação Mínima 44px', () => {
    it('Botões de compra devem ter altura mínima de 44px', () => {
      cy.viewport(375, 800);
      cy.visit('/livro/1');
      
      cy.get('.controles-compra__btn-comprar').invoke('outerHeight').then((height) => {
        expect(height).to.be.at.least(44);
      });
    });

    it('Botões de quantidade devem ter altura adequada', () => {
      cy.viewport(375, 800);
      cy.visit('/');
      
      cy.get('.ctrl-qtd__btn').first().invoke('outerHeight').then((height) => {
        expect(height).to.be.at.least(26);
      });
    });

    it('Botões de ação do carrinho devem ter altura mínima', () => {
      cy.viewport(375, 800);
      cy.visit('/carrinho');
      
      cy.get('.carrinho-btn-finalizar').invoke('outerHeight').then((height) => {
        expect(height).to.be.at.least(44);
      });
    });
  });
});
