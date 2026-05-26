# Testes do Caminho Feliz - Divididos em Etapas

Esta pasta contém os testes E2E do caminho feliz de compra divididos em etapas menores e independentes para facilitar debug e execução rápida.

## Estrutura dos Testes

- **01-carrinho.cy.ts** - Adicionar item ao carrinho (via UI e API)
- **02-checkout-preparacao.cy.ts** - Acesso ao checkout e seleção de endereço
- **03-frete.cy.ts** - Cotação de frete e seleção de opção
- **04-cupom.cy.ts** - Aplicação e remoção de cupons
- **05-pagamento-finalizacao.cy.ts** - Seleção de cartão e finalização da compra
- **06-pedido-confirmado.cy.ts** - Validação da página de sucesso

## Como Rodar os Testes

### Rodar todos os testes do caminho feliz:
```bash
cd web
npx cypress run --e2e --spec "cypress/e2e/vendas/caminho-feliz/*.cy.ts"
```

### Rodar um teste específico:
```bash
cd web
npx cypress run --e2e --spec "cypress/e2e/vendas/caminho-feliz/01-carrinho.cy.ts"
```

### Rodar em modo interativo ( Cypress UI ):
```bash
cd web
npx cypress open
# Selecione o arquivo desejado na UI
```

## Dados Compartilhados

Todos os testes usam os mesmos comandos customizados do Cypress:
- `cy.autenticarViaApi(email, senha)` - Autenticação via API
- `cy.prepararCarrinhoSincronizado()` - Prepara carrinho via API
- `cy.garantirEnderecoViaApi()` - Garante endereço cadastrado
- `cy.checkoutPreencherFretePadrao(cep)` - Preenche CEP e cota frete
- `cy.checkoutAplicarCupom(codigo)` - Aplica cupom de desconto
- `cy.checkoutIrFinalizarCompra()` - Carrinho → Finalizar Compra + `@pagamentoInfo`
- `cy.garantirCartoesViaApi()` - Garante cartões no perfil/API (seed 026 ou POST)
- `cy.checkoutSelecionarCartaoSalvoPreferido(bandeira?)` - Seleciona cartão na lista (fallback PIX)
- `cy.checkoutPreencherPixCobrindoTotal()` - Split só PIX; total via `checkout-split-restante` ou `checkout-total-value`
- `cy.checkoutConfirmarPixSePendente()` - Simula webhook se redirecionar para `/pagamento-pix`

## Variáveis de Ambiente

- `apiUrl` - URL da API (default: http://localhost:5173/api)
- `clienteEmail` - Email do cliente de teste (default: clientetest@email.com)
- `clienteSenha` - Senha do cliente de teste (default: @asdfJKLÇ123)
- `injectTestDbHeader` - Usa banco de testes (default: true)

## Vantagens da Divisão

1. **Execução mais rápida** - Cada teste foca em uma etapa específica
2. **Debug mais fácil** - Erros são isolados em etapas específicas
3. **Paralelismo** - Testes podem rodar em paralelo (exceto dependências)
4. **Manutenção** - Alterações em uma etapa não afetam outras
5. **Feedback rápido** - Identificar rapidamente qual etapa está falhando

## Teste Original

O teste original completo está em: `cypress/e2e/vendas/caminho-feliz-compra.cy.ts`
