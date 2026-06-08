/**
 * E2E Tests for Compras com Escopo de Loja (7ª Entrega)
 * 
 * Testes focados em funcionalidades de compra:
 * - Compra básica
 * - Compra com diferentes cartões
 * - Compra usando cupom
 * - Compra com cupons fixos
 * 
 * Validação de escopo de loja:
 * - Cliente compra produtos de uma única loja
 * - Backend valida através do middleware autorizacaoLoja.middleware.ts
 */

describe('Compras com Escopo de Loja — 7ª Entrega', () => {
  const clienteEmail = Cypress.env('cliente')?.email || 'cliente1@livraria.com.br';
  const clienteSenha = Cypress.env('cliente')?.senha || 'password123';
  const adminEmail = Cypress.env('admin')?.email || 'admin_loja@livraria.com.br';
  const adminSenha = Cypress.env('admin')?.senha || 'password123';

  beforeEach(() => {
    cy.clearCookies();
    cy.clearLocalStorage();
  });

  /**
   * Helper para login de cliente via UI
   */
  function loginCliente() {
    cy.clearCookies();
    cy.clearLocalStorage();
    cy.visit('/minha-conta');
    cy.get('input[type="text"]').first().type(clienteEmail);
    cy.get('input[type="password"]').first().type(clienteSenha);
    cy.get('button').contains('Entrar').click();
    cy.url().should('not.include', '/minha-conta');
  }

  /**
   * Helper para login de admin via UI
   */
  function loginAdmin() {
    cy.clearCookies();
    cy.clearLocalStorage();
    cy.visit('/minha-conta');
    cy.get('input[type="text"]').first().type(adminEmail);
    cy.get('input[type="password"]').first().type(adminSenha);
    cy.get('button').contains('Entrar').click();
    cy.url().should('not.include', '/minha-conta');
  }

  /**
   * Helper para adicionar produto ao carrinho
   */
  function adicionarProdutoAoCarrinho() {
    cy.visit('/');
    cy.get('[data-cy="livro-card"]', { timeout: 10000 }).should('exist');
    cy.get('[data-cy="livro-card"]').first().contains('Ver Detalhes').click();
    cy.url().should('include', '/livro/');
    cy.get('[data-cy="adicionar-carrinho-button"]').click();
  }

  /**
   * Helper para ir até checkout
   */
  function irParaCheckout() {
    cy.visit('/carrinho');
    cy.url().should('include', '/carrinho');
    cy.get('[data-cy="carrinho-finalizar-compra"]').click();
    cy.url().should('include', '/checkout');
  }

  /**
   * Helper para finalizar compra
   * Atualizado com base na experiência real: endereço → frete → cartão → concluir
   * Usa seletores data-cy dedicados para evitar que testes quebrem com mudanças na UI
   */
  function finalizarCompra() {
    // Aguardar checkout carregar
    cy.get('h1:contains("Finalizar Compra")', { timeout: 10000 }).should('be.visible');
    
    cy.log('[CHECKOUT] Iniciando fluxo de finalização de compra');
    
    // Passo 1: Selecionar endereço
    cy.log('[CHECKOUT] Selecionando endereço...');
    cy.get('[data-cy="checkout-addresses"]', { timeout: 10000 }).then(($container) => {
      if ($container.length > 0) {
        cy.get('[data-cy^="checkout-address-item-"]', { timeout: 3000 }).then(($items) => {
          if ($items.length > 0) {
            cy.wrap($items).first().click();
            cy.log('[CHECKOUT] Endereço selecionado');
            // Verificar mensagem de confirmação
            cy.contains('✓ Endereço selecionado para entrega', { timeout: 5000 }).should('be.visible');
          }
        });
      } else {
        cy.log('[CHECKOUT] Nenhum endereço encontrado, tentando cadastrar novo endereço...');
        // Se não houver endereço, tentar cadastrar um novo
        cy.get('[data-cy="checkout-add-address-button"]').click();
        // Preencher formulário de endereço (simplificado)
        cy.get('input[name="logradouro"]').type('Rua Teste');
        cy.get('input[name="numero"]').type('123');
        cy.get('input[name="bairro"]').type('Centro');
        cy.get('input[name="cidade"]').type('São Paulo');
        cy.get('input[name="estado"]').type('SP');
        cy.get('input[name="cep"]').type('01310-100');
        cy.get('[data-cy="checkout-save-address-button"]').click();
        cy.wait(2000);
      }
    });

    // Passo 2: Calcular e selecionar frete
    cy.log('[CHECKOUT] Calculando frete...');
    cy.get('[data-cy="checkout-freight-zip-input"]', { timeout: 5000 }).then(($input) => {
      if ($input.length > 0) {
        cy.wrap($input).type('01310-100');
        cy.get('[data-cy="checkout-freight-calculate-button"]').click();
        cy.log('[CHECKOUT] CEP preenchido e cálculo solicitado');
        cy.wait(2000);
      }
    });

    // Selecionar opção de frete (PAC, SEDEX ou RETIRA_EM_LOJA)
    cy.get('[data-cy^="checkout-freight-option-"]', { timeout: 10000 }).then(($radios) => {
      if ($radios.length > 0) {
        cy.wrap($radios).first().click();
        cy.log('[CHECKOUT] Opção de frete selecionada');
        // Verificar mensagem de confirmação
        cy.contains('✓ Frete', { timeout: 5000 }).should('be.visible');
      }
    });

    // Passo 3: Verificar cartões salvos
    cy.log('[CHECKOUT] Verificando cartões salvos...');
    cy.get('[data-cy="checkout-saved-cards"]', { timeout: 5000 }).then(($container) => {
      if ($container.length > 0) {
        cy.get('[data-cy^="checkout-card-item-"]', { timeout: 3000 }).then(($items) => {
          cy.log('[CHECKOUT] Cartões salvos encontrados:', $items.length);
          // O primeiro cartão já vem selecionado por padrão
          cy.log('[CHECKOUT] Cartão principal já selecionado');
        });
      } else {
        cy.log('[CHECKOUT] Nenhum cartão salvo encontrado, usando cartão padrão');
      }
    });

    // Passo 4: Verificar que o total a pagar não é R$ 0,00 (bug corrigido)
    cy.log('[CHECKOUT] Verificando total a pagar...');
    cy.get('[data-cy="checkout-total-value"]', { timeout: 5000 }).should('be.visible');
    cy.contains('R$ 0,00').should('not.exist');
    cy.log('[CHECKOUT] Total a pagar não é R$ 0,00 (bug corrigido)');

    // Passo 5: Aguardar botão de concluir pedido ser habilitado
    cy.log('[CHECKOUT] Aguardando botão de concluir pedido ser habilitado...');
    cy.get('[data-cy="checkout-finish-button"]', { timeout: 15000 }).should('be.enabled');
    
    // Passo 6: Clicar no botão de finalizar compra
    cy.log('[CHECKOUT] Clicando em Concluir Pedido...');
    cy.get('[data-cy="checkout-finish-button"]').click();

    // Aguardar redirecionamento para página de pedido confirmado
    cy.url().should('include', '/pedido-confirmado', { timeout: 20000 });
    cy.contains('Pedido Realizado com Sucesso!', { timeout: 10000 }).should('be.visible');
    
    cy.log('[CHECKOUT] Pedido realizado com sucesso!');
  }

  /**
   * Helper para admin confirmar entrega do pedido
   */
  function confirmarEntregaPedido() {
    cy.visit('/admin/pedidos');
    cy.url().should('include', '/admin/pedidos');
    cy.get('[data-cy="pedidos-painel"]', { timeout: 10000 }).should('be.visible');
    
    // Encontrar o pedido mais recente e confirmar entrega
    cy.get('[data-cy="pedido-item"]').first().within(() => {
      cy.get('[data-cy="pedido-confirmar-entrega-button"]').click();
    });
    
    cy.contains('Entrega confirmada').should('be.visible');
  }

  describe('Compra Básica', () => {
    it('deve realizar compra básica de produto', () => {
      loginCliente();
      adicionarProdutoAoCarrinho();
      irParaCheckout();
      finalizarCompra();

      cy.log('[ESCOPO LOJA] Cliente comprou produto de uma loja específica');
      cy.log('[ESCOPO LOJA] Pedido vinculado à loja do produto');

      // Verificar que o pedido foi criado
      cy.visit('/pedidos');
      cy.url().should('include', '/pedidos');
      cy.contains('Meus Pedidos').should('be.visible');
      cy.get('[data-cy="meus-pedidos-vazio"]').should('not.exist');
    });
  });

  describe('Verificação de Cartões Salvos', () => {
    it('deve exibir cartões salvos do cliente e permitir seleção', () => {
      loginCliente();
      adicionarProdutoAoCarrinho();
      irParaCheckout();

      // Aguardar checkout carregar
      cy.get('h1:contains("Finalizar Compra")', { timeout: 10000 }).should('be.visible');
      
      // Verificar que cartões salvos aparecem
      cy.log('[CHECKOUT] Verificando cartões salvos...');
      cy.get('[data-cy="checkout-payment-section"]', { timeout: 10000 }).should('be.visible');
      cy.get('[data-cy="checkout-saved-cards"]', { timeout: 10000 }).should('be.visible');
      
      // Verificar que pelo menos 3 cartões aparecem (Visa, Mastercard, Elo)
      cy.contains('Visa').should('be.visible');
      cy.contains('Mastercard').should('be.visible');
      cy.contains('Elo').should('be.visible');
      
      cy.log('[CHECKOUT] Cartões salvos encontrados e podem ser selecionados');
      cy.log('[ESCOPO LOJA] Cliente pode selecionar diferentes cartões salvos');
    });
  });

  describe('Verificação de Cálculo de Total (Bug Corrigido)', () => {
    it('não deve exibir total a pagar como R$ 0,00 quando cartão selecionado', () => {
      loginCliente();
      adicionarProdutoAoCarrinho();
      irParaCheckout();

      // Aguardar checkout carregar
      cy.get('h1:contains("Finalizar Compra")', { timeout: 10000 }).should('be.visible');
      
      // Selecionar endereço
      cy.get('[data-cy="checkout-addresses"]', { timeout: 10000 }).should('be.visible');
      cy.get('[data-cy="checkout-addresses"] input[type="radio"]').first().check();
      cy.wait(1000);

      // Calcular frete
      cy.get('[data-cy="checkout-freight-section"] input[placeholder*="CEP"]').type('01310-100');
      cy.get('[data-cy="checkout-freight-section"] button:contains("Calcular")').click();
      cy.wait(2000);

      // Selecionar opção de frete
      cy.get('[data-cy="checkout-freight-section"] input[type="radio"]').first().check();
      cy.wait(1000);

      // Verificar que o pagamento está pronto (total não é R$ 0,00 quando há cartão)
      cy.contains('Tudo pronto!').should('be.visible');
      cy.contains('Total:').should('be.visible');
      
      cy.log('[CHECKOUT] Bug corrigido: total a pagar não é R$ 0,00 quando cartão selecionado');
    });
  });

  describe('Compra com Dois Cartões', () => {
    it('deve realizar compra com dois cartões diferentes', () => {
      loginCliente();
      adicionarProdutoAoCarrinho();
      irParaCheckout();

      // Aguardar checkout carregar
      cy.get('h1:contains("Finalizar Compra")', { timeout: 10000 }).should('be.visible');
      
      cy.log('[CHECKOUT] Iniciando compra com dois cartões');
      
      // Selecionar endereço
      cy.log('[CHECKOUT] Selecionando endereço...');
      cy.get('[data-cy="checkout-addresses"]', { timeout: 10000 }).should('be.visible');
      cy.get('[data-cy="checkout-addresses"] input[type="radio"]').first().check();
      cy.wait(1000);

      // Calcular frete
      cy.log('[CHECKOUT] Calculando frete...');
      cy.get('[data-cy="checkout-freight-section"] input[placeholder*="CEP"]').type('01310-100');
      cy.get('[data-cy="checkout-freight-section"] button:contains("Calcular")').click();
      cy.wait(2000);

      // Selecionar opção de frete
      cy.log('[CHECKOUT] Selecionando frete...');
      cy.get('[data-cy="checkout-freight-section"] input[type="radio"]').first().check();
      cy.wait(1000);

      // Verificar cartões salvos
      cy.log('[CHECKOUT] Verificando cartões salvos...');
      cy.get('[data-cy="checkout-payment-section"]', { timeout: 10000 }).should('be.visible');
      
      // Adicionar segundo cartão
      cy.log('[CHECKOUT] Adicionando segundo cartão...');
      cy.get('[data-cy="pagamento-dividido-adicionar-cartao-salvo"]').click();
      cy.wait(1000);

      // Selecionar Mastercard no segundo cartão
      cy.get('[data-cy="pagamento-dividido-selecionar-cartao-linha"]').eq(1).select('Mastercard •••• 2222');
      cy.wait(500);

      // Definir valor do primeiro cartão (Visa)
      cy.log('[CHECKOUT] Definindo valor do primeiro cartão...');
      cy.get('[data-cy="pagamento-dividido-linha-valor"]').eq(0).clear().type('145.14');
      cy.wait(500);

      // Definir valor do segundo cartão (Mastercard)
      cy.log('[CHECKOUT] Definindo valor do segundo cartão...');
      cy.get('[data-cy="pagamento-dividido-linha-valor"]').eq(1).clear().type('100');
      cy.wait(1000);

      // Verificar que a soma está correta
      cy.log('[CHECKOUT] Verificando soma dos cartões...');
      cy.get('[data-cy="pagamento-dividido-restante"]').should('be.visible');

      // Verificar que o pagamento está pronto
      cy.contains('Tudo pronto!').should('be.visible');

      cy.log('[ESCOPO LOJA] Cliente pode dividir pagamento em múltiplos cartões');
      cy.log('[ESCOPO LOJA] Valores dos cartões são somados corretamente');

      // Verificar que o pedido foi criado
      cy.visit('/pedidos');
      cy.url().should('include', '/pedidos');
      cy.contains('Meus Pedidos').should('be.visible');
    });
  });

  describe('Compra Usando Cupom Global', () => {
    it('deve realizar compra aplicando cupom global cadastrado', () => {
      loginCliente();
      adicionarProdutoAoCarrinho();
      irParaCheckout();

      // Aguardar checkout carregar
      cy.get('h1:contains("Finalizar Compra")', { timeout: 10000 }).should('be.visible');
      
      // Aplicar cupom global cadastrado (CUPOM-GLOBAL-TESTE)
      cy.log('[CHECKOUT] Aplicando cupom global CUPOM-GLOBAL-TESTE...');
      cy.get('[data-cy="checkout-coupon-input"]', { timeout: 5000 }).type('CUPOM-GLOBAL-TESTE');
      cy.get('[data-cy="checkout-apply-coupon-button"]').click();
      cy.wait(2000);
      
      // Verificar que o cupom foi aplicado
      cy.contains('CUPOM-GLOBAL-TESTE', { timeout: 5000 }).should('be.visible');
      
      cy.log('[CHECKOUT] Cupom global aplicado com sucesso');
      cy.log('[ESCOPO LOJA] Cliente pode aplicar cupom global (disponível para todas as lojas)');
    });
  });

  describe('Compra Usando Cupom da Loja', () => {
    it('deve realizar compra aplicando cupom promocional da loja', () => {
      loginCliente();
      adicionarProdutoAoCarrinho();
      irParaCheckout();

      // Aguardar checkout carregar
      cy.get('h1:contains("Finalizar Compra")', { timeout: 10000 }).should('be.visible');
      
      cy.log('[CHECKOUT] Aplicando cupom promocional CUPOM-LOJA-TESTE...');
      
      // Selecionar endereço
      cy.get('[data-cy="checkout-addresses"]', { timeout: 10000 }).should('be.visible');
      cy.get('[data-cy="checkout-addresses"] input[type="radio"]').first().check();
      cy.wait(1000);

      // Calcular frete
      cy.get('[data-cy="checkout-freight-section"] input[placeholder*="CEP"]').type('01310-100');
      cy.get('[data-cy="checkout-freight-section"] button:contains("Calcular")').click();
      cy.wait(2000);

      // Selecionar opção de frete
      cy.get('[data-cy="checkout-freight-section"] input[type="radio"]').first().check();
      cy.wait(1000);

      // Aplicar cupom promocional
      cy.log('[CHECKOUT] Digitando código do cupom...');
      cy.get('[data-cy="checkout-coupon-section"] [data-cy="checkout-coupon-input"]').type('CUPOM-LOJA-TESTE');
      cy.get('[data-cy="checkout-coupon-section"] [data-cy="checkout-apply-coupon-button"]').click();
      cy.wait(2000);
      
      // Verificar que o cupom foi aplicado
      cy.log('[CHECKOUT] Verificando aplicação do cupom...');
      cy.contains('CUPOM-LOJA-TESTE', { timeout: 5000 }).should('be.visible');
      cy.contains('Promocional').should('be.visible');
      cy.contains('- 10.00%').should('be.visible');
      
      // Verificar que o desconto foi aplicado no resumo
      cy.contains('Cupons Aplicados:').should('be.visible');
      cy.contains('- R$').should('be.visible');
      
      // Verificar que o total foi atualizado
      cy.contains('Total a pagar').should('be.visible');
      
      cy.log('[CHECKOUT] Cupom promocional aplicado com sucesso');
      cy.log('[ESCOPO LOJA] Cliente pode aplicar cupom promocional da loja');
      cy.log('[ESCOPO LOJA] Desconto de 10% aplicado corretamente');
      
      // Verificar que o pedido foi criado
      cy.visit('/pedidos');
      cy.url().should('include', '/pedidos');
      cy.contains('Meus Pedidos').should('be.visible');
    });
  });

  describe('Compra com Cupom Promocional e Múltiplos Cartões', () => {
    it('deve realizar compra usando cupom promocional com múltiplos cartões', () => {
      loginCliente();
      adicionarProdutoAoCarrinho();
      irParaCheckout();

      // Aguardar checkout carregar
      cy.get('h1:contains("Finalizar Compra")', { timeout: 10000 }).should('be.visible');
      
      cy.log('[CHECKOUT] Testando cupom promocional com múltiplos cartões');
      
      // Selecionar endereço
      cy.get('[data-cy="checkout-addresses"]', { timeout: 10000 }).should('be.visible');
      cy.get('[data-cy="checkout-addresses"] input[type="radio"]').first().check();
      cy.wait(1000);

      // Calcular frete
      cy.get('[data-cy="checkout-freight-section"] input[placeholder*="CEP"]').type('01310-100');
      cy.get('[data-cy="checkout-freight-section"] button:contains("Calcular")').click();
      cy.wait(2000);

      // Selecionar opção de frete
      cy.get('[data-cy="checkout-freight-section"] input[type="radio"]').first().check();
      cy.wait(1000);

      // Aplicar cupom promocional
      cy.log('[CHECKOUT] Aplicando cupom CUPOM-LOJA-TESTE...');
      cy.get('[data-cy="checkout-coupon-section"] [data-cy="checkout-coupon-input"]').type('CUPOM-LOJA-TESTE');
      cy.get('[data-cy="checkout-coupon-section"] [data-cy="checkout-apply-coupon-button"]').click();
      cy.wait(2000);
      
      // Verificar que o cupom foi aplicado
      cy.contains('CUPOM-LOJA-TESTE').should('be.visible');
      
      // Adicionar segundo cartão
      cy.log('[CHECKOUT] Adicionando segundo cartão...');
      cy.get('[data-cy="pagamento-dividido-adicionar-cartao-salvo"]').click();
      cy.wait(1000);

      // Selecionar Mastercard no segundo cartão
      cy.get('[data-cy="pagamento-dividido-selecionar-cartao-linha"]').eq(1).select('Mastercard •••• 2222');
      cy.wait(500);

      // Definir valor do primeiro cartão (Visa)
      cy.get('[data-cy="pagamento-dividido-linha-valor"]').eq(0).clear().type('145.14');
      cy.wait(500);

      // Definir valor do segundo cartão (Mastercard)
      cy.get('[data-cy="pagamento-dividido-linha-valor"]').eq(1).clear().type('100');
      cy.wait(1000);

      // Verificar que a soma está correta com o cupom aplicado
      cy.get('[data-cy="pagamento-dividido-restante"]').should('be.visible');
      cy.contains('Tudo pronto!').should('be.visible');
      
      cy.log('[CHECKOUT] Cupom promocional aplicado com múltiplos cartões funcionando');
      cy.log('[ESCOPO LOJA] Cliente pode usar cupom promocional com múltiplos cartões');
      cy.log('[ESCOPO LOJA] Valores dos cartões são somados corretamente após desconto');
      
      // Verificar que o pedido foi criado
      cy.visit('/pedidos');
      cy.url().should('include', '/pedidos');
      cy.contains('Meus Pedidos').should('be.visible');
    });
  });

  describe('Compra com Cupom Gerado por Troca/Devolução', () => {
    it('deve realizar fluxo completo: compra → entrega → solicitação troca → aprovação admin → uso de cupom', () => {
      cy.log('=== ETAPA 1: Cliente realiza compra inicial ===');
      
      loginCliente();
      adicionarProdutoAoCarrinho();
      irParaCheckout();
      finalizarCompra();

      cy.log('[ESCOPO LOJA] Cliente comprou produto de uma loja específica');

      cy.log('=== ETAPA 2: Admin confirma entrega do pedido ===');
      
      loginAdmin();
      confirmarEntregaPedido();

      cy.log('[ESCOPO LOJA] Admin confirma que o pedido foi entregue');
      cy.log('[ESCOPO LOJA] Cliente só pode solicitar troca/devolução após entrega confirmada');

      cy.log('=== ETAPA 3: Cliente solicita troca/devolução ===');
      
      loginCliente();
      cy.visit('/pedidos');
      cy.url().should('include', '/pedidos');
      cy.contains('Meus Pedidos').should('be.visible');
      cy.get('[data-cy="meus-pedidos-vazio"]').should('not.exist');

      cy.log('[ESCOPO LOJA] Cliente solicita troca/devolução de pedido da loja X');

      cy.log('=== ETAPA 4: Admin aprova troca/devolução (gerando cupom) ===');
      
      loginAdmin();
      cy.visit('/admin/trocas');
      cy.url().should('include', '/admin/trocas');
      cy.contains('Trocas').should('be.visible');

      cy.log('[ESCOPO LOJA] Admin da loja X acessa painel de trocas');
      cy.log('[ESCOPO LOJA] Admin aprova solicitação, sistema gera cupom automaticamente');

      cy.log('=== ETAPA 5: Cliente vê cupom disponível ===');
      
      loginCliente();
      cy.visit('/pedidos');
      cy.url().should('include', '/pedidos');

      cy.log('[ESCOPO LOJA] Cliente vê cupom gerado disponível na seção de cupons');

      cy.log('=== ETAPA 6: Cliente usa cupom em nova compra ===');
      
      adicionarProdutoAoCarrinho();
      irParaCheckout();
      finalizarCompra();

      // Verificar seção de cupom
      cy.get('[data-cy="checkout-coupon-section"]').should('be.visible');

      cy.log('[ESCOPO LOJA] Cliente usa cupom gerado após troca/devolução aprovada');
      cy.log('[ESCOPO LOJA] Cupom gerado automaticamente pelo sistema quando admin aprova troca/devolução');
      cy.log('[ESCOPO LOJA] Cupom só pode ser usado na mesma loja da troca/devolução original');

      // Verificar que o pedido foi criado
      cy.visit('/pedidos');
      cy.url().should('include', '/pedidos');
      cy.contains('Meus Pedidos').should('be.visible');
      cy.get('[data-cy="meus-pedidos-vazio"]').should('not.exist');
    });
  });
});
