/**
 * Plugin ESLint customizado para Page Objects Cypress
 * Valida padrões de qualidade e consistência
 */

module.exports = {
  rules: {
    // Regra para detectar seletores duplicados
    'no-duplicate-selectors': {
      meta: {
        type: 'problem',
        docs: {
          description: 'Detecta seletores duplicados em Page Objects',
          category: 'Best Practices',
          recommended: true
        },
        fixable: null,
        schema: []
      },
      create(context) {
        const selectors = new Map();
        
        return {
          // Analisa getters estáticos
          'MethodDefinition[kind="get"][static=true] PropertyIdentifier'(node) {
            const propertyName = node.name;
            
            // Encontra o corpo do getter
            const functionBody = node.parent.parent.body;
            if (!functionBody || !functionBody.body) return;
            
            // Procura por cy.getDataCy() ou cy.get()
            functionBody.body.forEach(statement => {
              if (statement.type === 'ReturnStatement' && statement.argument) {
                const callExpression = statement.argument;
                
                if (callExpression.type === 'CallExpression') {
                  const selector = extractSelector(callExpression);
                  if (selector) {
                    if (selectors.has(selector)) {
                      context.report({
                        node: node,
                        message: `Seletor "${selector}" duplicado. Já usado em: ${selectors.get(selector)}`
                      });
                    } else {
                      selectors.set(selector, propertyName);
                    }
                  }
                }
              }
            });
          }
        };
      }
    },

    // Regra para validar que getters retornem Chainable
    'getter-returns-chainable': {
      meta: {
        type: 'problem',
        docs: {
          description: 'Valida que getters de Page Objects retornem Chainable do Cypress',
          category: 'Best Practices',
          recommended: true
        },
        fixable: null,
        schema: []
      },
      create(context) {
        return {
          'MethodDefinition[kind="get"][static=true] PropertyIdentifier'(node) {
            const propertyName = node.name;
            
            // Encontra o corpo do getter
            const functionBody = node.parent.parent.body;
            if (!functionBody || !functionBody.body) return;
            
            // Verifica se retorna cy.getDataCy() ou similar
            let hasCypressCall = false;
            
            functionBody.body.forEach(statement => {
              if (statement.type === 'ReturnStatement' && statement.argument) {
                const callExpression = statement.argument;
                
                if (callExpression.type === 'CallExpression' && 
                    callExpression.callee &&
                    callExpression.callee.object &&
                    callExpression.callee.object.name === 'cy') {
                  hasCypressCall = true;
                }
              }
            });
            
            if (!hasCypressCall) {
              context.report({
                node: node,
                message: `Getter "${propertyName}" deveria retornar um Chainable do Cypress (cy.getDataCy(), cy.get(), etc.)`
              });
            }
          }
        };
      }
    },

    // Regra para nomenclatura consistente
    'consistent-naming': {
      meta: {
        type: 'suggestion',
        docs: {
          description: 'Valida nomenclatura consistente em Page Objects',
          category: 'Stylistic',
          recommended: true
        },
        fixable: null,
        schema: []
      },
      create(context) {
        return {
          'MethodDefinition[kind="get"][static=true] PropertyIdentifier'(node) {
            const propertyName = node.name;
            
            // Verifica camelCase
            if (!/^[a-z][a-zA-Z0-9]*$/.test(propertyName)) {
              context.report({
                node: node,
                message: `Getter "${propertyName}" deveria usar camelCase`
              });
            }
            
            // Verifica nomes muito curtos
            if (propertyName.length < 3) {
              context.report({
                node: node,
                message: `Getter "${propertyName}" muito curto, seja mais descritivo`
              });
            }
            
            // Verifica nomes genéricos
            const genericNames = ['element', 'item', 'button', 'input', 'select'];
            if (genericNames.includes(propertyName.toLowerCase())) {
              context.report({
                node: node,
                message: `Getter "${propertyName}" muito genérico, seja mais específico`
              });
            }
          },
          
          'MethodDefinition[kind="method"][static=true] PropertyIdentifier'(node) {
            const methodName = node.name;
            
            // Verifica camelCase em métodos
            if (!/^[a-z][a-zA-Z0-9]*$/.test(methodName)) {
              context.report({
                node: node,
                message: `Método "${methodName}" deveria usar camelCase`
              });
            }
          }
        };
      }
    },

    // Regra para prevenir seletores frágeis
    'no-fragile-selectors': {
      meta: {
        type: 'problem',
        docs: {
          description: 'Previne uso de seletores frágeis em Page Objects',
          category: 'Best Practices',
          recommended: true
        },
        fixable: null,
        schema: []
      },
      create(context) {
        return {
          // Analisa qualquer chamada cy.get() ou cy.contains()
          'CallExpression[callee.object.name="cy"]'(node) {
            const methodName = node.callee.property.name;
            
            if (methodName === 'get' || methodName === 'contains') {
              const args = node.arguments;
              if (args.length > 0) {
                const firstArg = args[0];
                
                // Verifica se é string literal
                if (firstArg.type === 'Literal' && typeof firstArg.value === 'string') {
                  const selector = firstArg.value;
                  
                  // Seletores frágeis comuns
                  const fragilePatterns = [
                    /^\./,        // Classes CSS
                    /^#/,         // IDs CSS
                    /^\[/,        // Atributos CSS
                    /^[a-z]/,     // Tags HTML sem data-cy
                    /'/,          // Strings com aspas simples
                    /"/           // Strings com aspas duplas
                  ];
                  
                  const isFragile = fragilePatterns.some(pattern => pattern.test(selector));
                  
                  if (isFragile && !selector.includes('data-cy')) {
                    context.report({
                      node: node,
                      message: `Seletor frágil "${selector}". Prefira usar data-cy attributes`
                    });
                  }
                }
              }
            }
          }
        };
      }
    },

    // Regra para prevenir waits fixos
    'no-hardcoded-waits': {
      meta: {
        type: 'suggestion',
        docs: {
          description: 'Previne uso de waits fixos em Page Objects',
          category: 'Performance',
          recommended: true
        },
        fixable: null,
        schema: []
      },
      create(context) {
        return {
          // Analisa chamadas cy.wait()
          'CallExpression[callee.object.name="cy"][callee.property.name="wait"]'(node) {
            const args = node.arguments;
            
            if (args.length > 0) {
              const firstArg = args[0];
              
              // cy.wait(número) - wait fixo
              if (firstArg.type === 'Literal' && typeof firstArg.value === 'number') {
                context.report({
                  node: node,
                  message: `Wait fixo de ${firstArg.value}ms. Prefira usar assertions ou waits condicionais`
                });
              }
              
              // cy.wait('string') - wait de alias (aceitável)
              if (firstArg.type === 'Literal' && typeof firstArg.value === 'string') {
                // Isso é OK - wait de alias
                return;
              }
            }
          }
        };
      }
    },

    // Regra para preferir data-cy
    'prefer-data-cy': {
      meta: {
        type: 'suggestion',
        docs: {
          description: 'Prefere uso de data-cy attributes em Page Objects',
          category: 'Best Practices',
          recommended: true
        },
        fixable: null,
        schema: []
      },
      create(context) {
        return {
          // Analisa qualquer chamada que não seja cy.getDataCy()
          'CallExpression[callee.object.name="cy"]'(node) {
            const methodName = node.callee.property.name;
            
            // Se já é getDataCy, está OK
            if (methodName === 'getDataCy') {
              return;
            }
            
            // Se é get() ou contains(), verificar se poderia ser getDataCy
            if (methodName === 'get' || methodName === 'contains') {
              const args = node.arguments;
              if (args.length > 0) {
                const firstArg = args[0];
                
                if (firstArg.type === 'Literal' && typeof firstArg.value === 'string') {
                  const selector = firstArg.value;
                  
                  // Se parece com seletor de data-cy, sugerir getDataCy
                  if (selector.includes('data-cy') || selector.startsWith('[data-cy')) {
                    context.report({
                      node: node,
                      message: `Prefira usar cy.getDataCy() para seletores data-cy em vez de cy.${methodName}()`
                    });
                  }
                }
              }
            }
          }
        };
      }
    }
  }
};

// Função auxiliar para extrair seletor de chamada Cypress
function extractSelector(callExpression) {
  if (!callExpression.arguments || callExpression.arguments.length === 0) {
    return null;
  }
  
  const firstArg = callExpression.arguments[0];
  
  // cy.getDataCy('selector')
  if (callExpression.callee.property.name === 'getDataCy' && 
      firstArg.type === 'Literal') {
    return firstArg.value;
  }
  
  // cy.get('[data-cy="selector"]')
  if (callExpression.callee.property.name === 'get' && 
      firstArg.type === 'Literal' &&
      firstArg.value.includes('data-cy')) {
    return firstArg.value;
  }
  
  return null;
}