/**
 * Validador de Page Objects para Cypress E2E
 * Garante qualidade e consistência dos Page Objects do projeto
 */

import { BasePage } from '../pages/base/BasePage';

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  duplicates: string[];
}

export interface PageObjectMetrics {
  totalGetters: number;
  totalMethods: number;
  uniqueSelectors: number;
  duplicateSelectors: number;
  complexity: 'low' | 'medium' | 'high';
}

/**
 * Valida um Page Object completamente
 * @param pageClass - Classe do Page Object a ser validada
 * @param pageName - Nome do Page Object para logs
 * @returns Resultado da validação detalhado
 */
export function validatePageObject(
  pageClass: any, 
  pageName: string = 'Unknown'
): ValidationResult {
  const result: ValidationResult = {
    isValid: true,
    errors: [],
    warnings: [],
    duplicates: []
  };

  // 1. Validar estrutura básica
  if (!pageClass || typeof pageClass !== 'function') {
    result.isValid = false;
    result.errors.push(`${pageName}: Classe inválida ou não fornecida`);
    return result;
  }

  // 2. Validar getters Chainable
  const chainableErrors = BasePage.validatePageObject(pageClass);
  if (chainableErrors.length > 0) {
    result.isValid = false;
    result.errors.push(...chainableErrors.map(e => `${pageName}: ${e}`));
  }

  // 3. Verificar seletores duplicados
  const duplicates = BasePage.findDuplicateSelectors(pageClass);
  if (duplicates.length > 0) {
    result.isValid = false;
    result.duplicates.push(...duplicates.map(d => `${pageName}: ${d}`));
  }

  // 4. Validar nomenclatura
  const namingWarnings = validateNaming(pageClass, pageName);
  result.warnings.push(...namingWarnings);

  // 5. Validar padrões de código
  const patternWarnings = validatePatterns(pageClass, pageName);
  result.warnings.push(...patternWarnings);

  return result;
}

/**
 * Calcula métricas de um Page Object
 * @param pageClass - Classe do Page Object
 * @returns Métricas detalhadas
 */
export function getPageObjectMetrics(pageClass: any): PageObjectMetrics {
  const descriptors = Object.getOwnPropertyDescriptors(pageClass);
  let totalGetters = 0;
  let totalMethods = 0;
  const selectors = new Set<string>();

  for (const [key, descriptor] of Object.entries(descriptors)) {
    if (key === 'constructor') continue;

    if (descriptor.get && !descriptor.set) {
      totalGetters++;
      
      // Extrair seletor se possível
      try {
        const result = descriptor.get.call(pageClass);
        const selector = result?.selector || result?.toString();
        if (selector) {
          selectors.add(selector);
        }
      } catch (error) {
        // Ignorar erros na extração de seletores
      }
    } else if (typeof descriptor.value === 'function') {
      totalMethods++;
    }
  }

  const uniqueSelectors = selectors.size;
  const duplicateSelectors = totalGetters - uniqueSelectors;

  // Calcular complexidade
  let complexity: 'low' | 'medium' | 'high' = 'low';
  if (totalGetters > 50 || totalMethods > 30) {
    complexity = 'high';
  } else if (totalGetters > 25 || totalMethods > 15) {
    complexity = 'medium';
  }

  return {
    totalGetters,
    totalMethods,
    uniqueSelectors,
    duplicateSelectors,
    complexity
  };
}

/**
 * Valida nomenclatura do Page Object
 * @param pageClass - Classe do Page Object
 * @param pageName - Nome do Page Object
 * @returns Array de warnings
 */
function validateNaming(pageClass: any, pageName: string): string[] {
  const warnings: string[] = [];
  const descriptors = Object.getOwnPropertyDescriptors(pageClass);

  for (const [key, descriptor] of Object.entries(descriptors)) {
    if (key === 'constructor') continue;

    // Validar getters
    if (descriptor.get && !descriptor.set) {
      // Getters devem ser camelCase
      if (!/^[a-z][a-zA-Z0-9]*$/.test(key)) {
        warnings.push(`${pageName}: Getter "${key}" deveria ser camelCase`);
      }

      // Evitar nomes muito curtos
      if (key.length < 3) {
        warnings.push(`${pageName}: Getter "${key}" muito curto, seja mais descritivo`);
      }

      // Evitar nomes genéricos
      const genericNames = ['element', 'item', 'button', 'input', 'select'];
      if (genericNames.includes(key.toLowerCase())) {
        warnings.push(`${pageName}: Getter "${key}" muito genérico, seja mais específico`);
      }
    }

    // Validar métodos
    if (typeof descriptor.value === 'function' && !descriptor.get) {
      // Métodos devem ser camelCase
      if (!/^[a-z][a-zA-Z0-9]*$/.test(key)) {
        warnings.push(`${pageName}: Método "${key}" deveria ser camelCase`);
      }

      // Métodos de ação devem começar com verbo
      const actionMethods = ['click', 'type', 'select', 'check', 'uncheck', 'fill', 'clear'];
      if (actionMethods.some(verb => key.startsWith(verb))) {
        if (!/^(click|type|select|check|uncheck|fill|clear)[A-Z]/.test(key)) {
          warnings.push(`${pageName}: Método "${key}" deveria seguir padrão verbo+Substantivo`);
        }
      }
    }
  }

  return warnings;
}

/**
 * Valida padrões de código do Page Object
 * @param pageClass - Classe do Page Object
 * @param pageName - Nome do Page Object
 * @returns Array de warnings
 */
function validatePatterns(pageClass: any, pageName: string): string[] {
  const warnings: string[] = [];
  const descriptors = Object.getOwnPropertyDescriptors(pageClass);

  for (const [key, descriptor] of Object.entries(descriptors)) {
    if (key === 'constructor') continue;

    // Verificar se getters usam cy.getDataCy
    if (descriptor.get && !descriptor.set) {
      try {
        const source = descriptor.get.toString();
        
        // Deveria usar cy.getDataCy
        if (!source.includes('getDataCy')) {
          warnings.push(`${pageName}: Getter "${key}" deveria usar cy.getDataCy()`);
        }

        // Não deveria usar seletores frágeis
        const fragileSelectors = ['cy.get(\'', 'cy.contains(', 'cy.find('];
        if (fragileSelectors.some(fragile => source.includes(fragile))) {
          warnings.push(`${pageName}: Getter "${key}" usa seletores frágeis, prefira data-cy`);
        }

        // Não deveria ter waits fixos
        if (source.includes('cy.wait(')) {
          warnings.push(`${pageName}: Getter "${key}" não deveria ter waits fixos`);
        }
      } catch (error) {
        // Ignorar erros na análise do código fonte
      }
    }
  }

  return warnings;
}

/**
 * Valida múltiplos Page Objects
 * @param pageObjects - Array de Page Objects para validar
 * @returns Resultado consolidado da validação
 */
export function validateMultiplePageObjects(
  pageObjects: Array<{ class: any; name: string }>
): { valid: ValidationResult[]; invalid: ValidationResult[]; summary: any } {
  const valid: ValidationResult[] = [];
  const invalid: ValidationResult[] = [];
  const summary = {
    total: pageObjects.length,
    valid: 0,
    invalid: 0,
    totalErrors: 0,
    totalWarnings: 0,
    totalDuplicates: 0
  };

  for (const { class: pageClass, name } of pageObjects) {
    const result = validatePageObject(pageClass, name);
    
    if (result.isValid) {
      valid.push(result);
      summary.valid++;
    } else {
      invalid.push(result);
      summary.invalid++;
    }

    summary.totalErrors += result.errors.length;
    summary.totalWarnings += result.warnings.length;
    summary.totalDuplicates += result.duplicates.length;
  }

  return { valid, invalid, summary };
}

/**
 * Gera relatório HTML da validação
 * @param results - Resultados da validação
 * @returns HTML string do relatório
 */
export function generateValidationReport(results: {
  valid: ValidationResult[];
  invalid: ValidationResult[];
  summary: any;
}): string {
  const { valid, invalid, summary } = results;

  return `
<!DOCTYPE html>
<html>
<head>
    <title>Relatório de Validação de Page Objects</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .header { background: #f5f5f5; padding: 20px; border-radius: 5px; }
        .summary { display: flex; gap: 20px; margin: 20px 0; }
        .metric { background: #e9ecef; padding: 15px; border-radius: 5px; text-align: center; }
        .metric h3 { margin: 0; color: #495057; }
        .metric .value { font-size: 2em; font-weight: bold; }
        .valid { color: #28a745; }
        .invalid { color: #dc3545; }
        .warning { color: #ffc107; }
        .section { margin: 20px 0; }
        .error { background: #f8d7da; padding: 10px; border-radius: 3px; margin: 5px 0; }
        .warning-box { background: #fff3cd; padding: 10px; border-radius: 3px; margin: 5px 0; }
        .duplicate { background: #d1ecf1; padding: 10px; border-radius: 3px; margin: 5px 0; }
    </style>
</head>
<body>
    <div class="header">
        <h1>🔍 Relatório de Validação de Page Objects</h1>
        <p>Gerado em: ${new Date().toLocaleString('pt-BR')}</p>
    </div>

    <div class="summary">
        <div class="metric">
            <h3>Total</h3>
            <div class="value">${summary.total}</div>
        </div>
        <div class="metric">
            <h3>Válidos</h3>
            <div class="value valid">${summary.valid}</div>
        </div>
        <div class="metric">
            <h3>Inválidos</h3>
            <div class="value invalid">${summary.invalid}</div>
        </div>
        <div class="metric">
            <h3>Erros</h3>
            <div class="value invalid">${summary.totalErrors}</div>
        </div>
        <div class="metric">
            <h3>Warnings</h3>
            <div class="value warning">${summary.totalWarnings}</div>
        </div>
    </div>

    ${invalid.length > 0 ? `
    <div class="section">
        <h2>❌ Page Objects Inválidos (${invalid.length})</h2>
        ${invalid.map(result => `
            <div>
                <h3>${result.errors[0]?.split(':')[0] || 'Unknown'}</h3>
                ${result.errors.map(error => `<div class="error">🔴 ${error}</div>`).join('')}
                ${result.warnings.map(warning => `<div class="warning-box">⚠️ ${warning}</div>`).join('')}
                ${result.duplicates.map(duplicate => `<div class="duplicate">🔄 ${duplicate}</div>`).join('')}
            </div>
        `).join('')}
    </div>
    ` : ''}

    ${valid.length > 0 ? `
    <div class="section">
        <h2>✅ Page Objects Válidos (${valid.length})</h2>
        ${valid.map(result => `
            <div>
                <h3>${result.warnings[0]?.split(':')[0] || 'Unknown'}</h3>
                ${result.warnings.map(warning => `<div class="warning-box">⚠️ ${warning}</div>`).join('')}
            </div>
        `).join('')}
    </div>
    ` : ''}

</body>
</html>
  `;
}