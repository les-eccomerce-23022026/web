/**
 * Base Page Object com type safety e validações
 * Fornece métodos comuns para todos os Page Objects do projeto
 */

export abstract class BasePage {
  /**
   * Obtém um elemento com validação de seletor
   * @param selector - Seletor data-cy
   * @returns Chainable do Cypress
   */
  protected static getElement(selector: string): Cypress.Chainable<JQuery<HTMLElement>> {
    this.validateSelector(selector);
    return cy.getDataCy(selector);
  }

  /**
   * Valida se o seletor é válido em tempo de compilação
   * @param selector - Seletor a ser validado
   * @throws Error se o seletor for inválido
   */
  protected static validateSelector(selector: string): void {
    if (!selector || selector.trim() === '') {
      throw new Error('Seletor não pode estar vazio');
    }
    
    if (selector.includes(' ')) {
      console.warn(`⚠️ Seletor "${selector}" contém espaços. Considere usar um seletor mais específico.`);
    }
  }

  /**
   * Aguarda o elemento estar visível com timeout padronizado
   * @param selector - Seletor do elemento
   * @param timeout - Timeout personalizado (opcional)
   * @returns Chainable do Cypress
   */
  protected static waitForElementVisible(
    selector: string, 
    timeout?: number
  ): Cypress.Chainable<JQuery<HTMLElement>> {
    const element = this.getElement(selector);
    return timeout ? element.should('be.visible', { timeout }) : element.should('be.visible');
  }

  /**
   * Verifica se o elemento existe sem falhar o teste
   * @param selector - Seletor do elemento
   * @returns Chainable do Cypress
   */
  protected static elementExists(selector: string): Cypress.Chainable<JQuery<HTMLElement>> {
    return this.getElement(selector).should('exist');
  }

  /**
   * Clica em um elemento com validações de segurança
   * @param selector - Seletor do elemento
   * @param force - Força o clique mesmo se não visível (padrão: false)
   * @returns Chainable do Cypress
   */
  protected static safeClick(
    selector: string, 
    force: boolean = false
  ): Cypress.Chainable<JQuery<HTMLElement>> {
    const element = this.getElement(selector);
    
    if (!force) {
      element.should('be.visible').should('not.be.disabled');
    }
    
    return element.click({ force });
  }

  /**
   * Preenche um campo de texto com validações
   * @param selector - Seletor do campo
   * @param value - Valor a ser preenchido
   * @param clear - Limpa o campo antes de preencher (padrão: true)
   * @returns Chainable do Cypress
   */
  protected static safeType(
    selector: string, 
    value: string, 
    clear: boolean = true
  ): Cypress.Chainable<JQuery<HTMLElement>> {
    const element = this.getElement(selector);
    
    element.should('be.visible').should('not.be.disabled');
    
    if (clear) {
      element.clear().type(value);
    } else {
      element.type(value);
    }
    
    return element;
  }

  /**
   * Seleciona uma opção em um dropdown
   * @param selector - Seletor do select
   * @param value - Valor a ser selecionado
   * @returns Chainable do Cypress
   */
  protected static safeSelect(
    selector: string, 
    value: string
  ): Cypress.Chainable<JQuery<HTMLElement>> {
    const element = this.getElement(selector);
    
    element.should('be.visible').should('not.be.disabled');
    return element.select(value);
  }

  /**
   * Verifica se o texto do elemento contém o valor esperado
   * @param selector - Seletor do elemento
   * @param expectedText - Texto esperado
   * @param timeout - Timeout personalizado (opcional)
   * @returns Chainable do Cypress
   */
  protected static shouldContainText(
    selector: string, 
    expectedText: string, 
    timeout?: number
  ): Cypress.Chainable<JQuery<HTMLElement>> {
    const element = this.getElement(selector);
    
    if (timeout) {
      return element.should('contain.text', expectedText, { timeout });
    }
    
    return element.should('contain.text', expectedText);
  }

  /**
   * Verifica se o elemento está habilitado
   * @param selector - Seletor do elemento
   * @returns Chainable do Cypress
   */
  protected static shouldBeEnabled(selector: string): Cypress.Chainable<JQuery<HTMLElement>> {
    return this.getElement(selector).should('not.be.disabled');
  }

  /**
   * Verifica se o elemento está desabilitado
   * @param selector - Seletor do elemento
   * @returns Chainable do Cypress
   */
  protected static shouldBeDisabled(selector: string): Cypress.Chainable<JQuery<HTMLElement>> {
    return this.getElement(selector).should('be.disabled');
  }

  /**
   * Aguarda um determinado tempo (use com moderação)
   * @param ms - Milissegundos para aguardar
   * @returns Promise que resolve após o tempo
   */
  protected static wait(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Log estruturado para debug
   * @param message - Mensagem de log
   * @param data - Dados adicionais (opcional)
   */
  protected static log(message: string, data?: any): void {
    if (data) {
      cy.log(`🔍 ${message}`, data);
    } else {
      cy.log(`🔍 ${message}`);
    }
  }

  /**
   * Valida se todos os getters de um Page Object retornam Chainable válidos
   * @param pageClass - Classe do Page Object a ser validada
   * @returns Array de erros encontrados
   */
  public static validatePageObject(pageClass: any): string[] {
    const errors: string[] = [];
    const descriptors = Object.getOwnPropertyDescriptors(pageClass);
    
    for (const [key, descriptor] of Object.entries(descriptors)) {
      // Pular construtor e métodos não-getter
      if (key === 'constructor' || !descriptor.get || descriptor.set) {
        continue;
      }
      
      try {
        const result = descriptor.get.call(pageClass);
        
        // Verificar se retorna Chainable válido
        if (!result || typeof result.should !== 'function') {
          errors.push(`Getter '${key}' não retorna Chainable válido`);
        }
        
        // Verificar se o seletor é válido
        if (result && result.selector) {
          this.validateSelector(result.selector);
        }
      } catch (error) {
        errors.push(`Getter '${key}' falhou na validação: ${error.message}`);
      }
    }
    
    return errors;
  }

  /**
   * Verifica se há seletores duplicados em um Page Object
   * @param pageClass - Classe do Page Object a ser verificada
   * @returns Array de seletores duplicados
   */
  public static findDuplicateSelectors(pageClass: any): string[] {
    const selectors = new Map<string, string>();
    const duplicates: string[] = [];
    const descriptors = Object.getOwnPropertyDescriptors(pageClass);
    
    for (const [key, descriptor] of Object.entries(descriptors)) {
      if (key === 'constructor' || !descriptor.get || descriptor.set) {
        continue;
      }
      
      try {
        const result = descriptor.get.call(pageClass);
        const selector = result?.selector || result?.toString();
        
        if (selector && selectors.has(selector)) {
          duplicates.push(`"${selector}" duplicado em: ${selectors.get(selector)} e ${key}`);
        } else if (selector) {
          selectors.set(selector, key);
        }
      } catch (error) {
        // Ignorar erros na verificação de duplicatas
      }
    }
    
    return duplicates;
  }
}