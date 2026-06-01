/**
 * Testes automatizados para validação de Page Objects
 * Garante qualidade e consistência de todos os Page Objects do projeto
 */

import { validatePageObject, getPageObjectMetrics, validateMultiplePageObjects } from '../../support/validators/pageObjectValidator';
import { BasePage } from '../../support/pages/base/BasePage';

// Importar todos os Page Objects para validação
import { CheckoutPage } from '../../support/pages/checkout/CheckoutPage';
import { AdminPedidosPage } from '../../support/pages/admin/AdminPedidosPage';
import { AdminClientesPage } from '../../support/pages/admin/AdminClientesPage';
import { CarrinhoPage } from '../../support/pages/carrinho/CarrinhoPage';
import { CatalogoPage } from '../../support/pages/catalogo/CatalogoPage';

describe('🔍 Page Objects Validation', () => {
  const pageObjects = [
    { class: CheckoutPage, name: 'CheckoutPage' },
    { class: AdminPedidosPage, name: 'AdminPedidosPage' },
    { class: AdminClientesPage, name: 'AdminClientesPage' },
    { class: CarrinhoPage, name: 'CarrinhoPage' },
    { class: CatalogoPage, name: 'CatalogoPage' }
  ];

  before(() => {
    cy.log('🚀 Iniciando validação de Page Objects...');
  });

  describe('✅ Validação Individual de Page Objects', () => {
    pageObjects.forEach(({ class: PageClass, name }) => {
      describe(`${name}`, () => {
        let validationResult: any;
        let metrics: any;

        before(() => {
          validationResult = validatePageObject(PageClass, name);
          metrics = getPageObjectMetrics(PageClass);
        });

        it('deve ter estrutura válida', () => {
          expect(validationResult.isValid).to.be.true;
          
          if (!validationResult.isValid) {
            cy.log('❌ Erros encontrados:', validationResult.errors);
            cy.log('⚠️ Warnings encontrados:', validationResult.warnings);
            cy.log('🔄 Seletores duplicados:', validationResult.duplicates);
          }
        });

        it('não deve ter seletores duplicados', () => {
          expect(validationResult.duplicates).to.have.length(0, 
            `Seletores duplicados encontrados: ${validationResult.duplicates.join(', ')}`);
        });

        it('deve ter getters retornando Chainable válidos', () => {
          expect(validationResult.errors.filter((e: string) => e.includes('Chainable'))).to.have.length(0);
        });

        it('deve ter métricas aceitáveis', () => {
          cy.log(`📊 Métricas de ${name}:`, {
            getters: metrics.totalGetters,
            methods: metrics.totalMethods,
            uniqueSelectors: metrics.uniqueSelectors,
            complexity: metrics.complexity
          });

          // Validar que não há seletores duplicados nas métricas
          expect(metrics.duplicateSelectors).to.equal(0);
          
          // Validar complexidade razoável
          expect(['low', 'medium']).to.include(metrics.complexity);
        });

        it('deve seguir padrões de nomenclatura', () => {
          const warnings = validationResult.warnings.filter((w: string) => w.includes('camelCase'));
          
          if (warnings.length > 0) {
            cy.log('⚠️ Warnings de nomenclatura:', warnings);
          }
          
          // Permitir warnings de nomenclatura mas não erros
          expect(validationResult.errors.filter((e: string) => e.includes('camelCase'))).to.have.length(0);
        });

        it('deve usar seletores resilientes', () => {
          const warnings = validationResult.warnings.filter((w: string) => 
            w.includes('seletores frágeis') || w.includes('getDataCy')
          );
          
          if (warnings.length > 0) {
            cy.log('⚠️ Warnings de seletores:', warnings);
          }
          
          // Permitir warnings mas garantir que não há uso de seletores frágeis críticos
          expect(validationResult.errors.filter((e: string) => e.includes('seletores frágeis'))).to.have.length(0);
        });
      });
    });
  });

  describe('🔄 Validação Consolidada', () => {
    let consolidatedResult: any;

    before(() => {
      consolidatedResult = validateMultiplePageObjects(pageObjects);
    });

    it('todos os Page Objects devem ser válidos', () => {
      expect(consolidatedResult.invalid).to.have.length(0, 
        `Page Objects inválidos: ${consolidatedResult.invalid.map((r: any) => r.errors[0]).join(', ')}`);
    });

    it('não deve haver erros críticos no projeto', () => {
      expect(consolidatedResult.summary.totalErrors).to.equal(0);
    });

    it('deve ter métricas globais aceitáveis', () => {
      cy.log('📊 Métricas globais:', consolidatedResult.summary);
      
      expect(consolidatedResult.summary.valid).to.be.greaterThan(0);
      expect(consolidatedResult.summary.invalid).to.equal(0);
    });
  });

  describe('🧪 Testes de Integração dos Page Objects', () => {
    it('CheckoutPage deve funcionar em ambiente real', () => {
      cy.visit('/checkout').then(() => {
        // Testar getters principais
        expect(CheckoutPage.container).to.exist;
        
        // Verificar se não há erros de execução
        cy.wrap(() => CheckoutPage.container.should('exist')).should('not.throw');
      });
    });

    it('CarrinhoPage deve funcionar em ambiente real', () => {
      cy.visit('/carrinho').then(() => {
        expect(CarrinhoPage.container).to.exist;
        
        // Verificar se não há erros de execução
        cy.wrap(() => CarrinhoPage.container.should('exist')).should('not.throw');
      });
    });

    it('CatalogoPage deve funcionar em ambiente real', () => {
      cy.visit('/catalogo').then(() => {
        expect(CatalogoPage.container).to.exist;
        
        // Verificar se não há erros de execução
        cy.wrap(() => CatalogoPage.container.should('exist')).should('not.throw');
      });
    });
  });

  describe('⚡ Performance dos Page Objects', () => {
    it('Page Objects devem ser rápidos para instanciar', () => {
      const startTime = Date.now();
      
      pageObjects.forEach(({ class: PageClass }) => {
        // Simular uso dos getters
        const descriptors = Object.getOwnPropertyDescriptors(PageClass);
        Object.values(descriptors).forEach(descriptor => {
          if (descriptor.get && !descriptor.set) {
            try {
              descriptor.get.call(PageClass);
            } catch (error) {
              // Ignorar erros de elementos não encontrados
            }
          }
        });
      });
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      cy.log(`⏱️ Tempo total de validação: ${duration}ms`);
      expect(duration).to.be.lessThan(1000); // Menos de 1 segundo
    });
  });

  describe('🔧 Debug e Troubleshooting', () => {
    it('deve gerar relatório detalhado quando houver problemas', () => {
      const result = validateMultiplePageObjects(pageObjects);
      
      if (result.summary.totalErrors > 0 || result.summary.totalWarnings > 0) {
        cy.log('📋 Relatório de Problemas:');
        cy.log(`Total de erros: ${result.summary.totalErrors}`);
        cy.log(`Total de warnings: ${result.summary.totalWarnings}`);
        cy.log(`Total de duplicatas: ${result.summary.totalDuplicates}`);
        
        result.invalid.forEach((invalid: any) => {
          cy.log('❌ Erros:', invalid.errors);
          cy.log('⚠️ Warnings:', invalid.warnings);
          cy.log('🔄 Duplicatas:', invalid.duplicates);
        });
      }
    });

    it('deve fornecer sugestões de melhoria', () => {
      pageObjects.forEach(({ class: PageClass, name }) => {
        const metrics = getPageObjectMetrics(PageClass);
        
        if (metrics.complexity === 'high') {
          cy.log(`💡 Sugestão para ${name}: Considere dividir em Page Objects menores (${metrics.totalGetters} getters)`);
        }
        
        if (metrics.duplicateSelectors > 0) {
          cy.log(`💡 Sugestão para ${name}: Remover ${metrics.duplicateSelectors} seletores duplicados`);
        }
        
        if (metrics.totalGetters < 10) {
          cy.log(`💡 Sugestão para ${name}: Page Object parece pequeno (${metrics.totalGetters} getters), verifique se está completo`);
        }
      });
    });
  });

  after(() => {
    cy.log('✅ Validação de Page Objects concluída!');
    
    // Gerar relatório final
    const finalResult = validateMultiplePageObjects(pageObjects);
    cy.log('📊 Resumo Final:', finalResult.summary);
    
    if (finalResult.summary.invalid === 0) {
      cy.log('🎉 Todos os Page Objects estão válidos!');
    } else {
      cy.log(`⚠️ ${finalResult.summary.invalid} Page Objects precisam de correção`);
    }
  });
});