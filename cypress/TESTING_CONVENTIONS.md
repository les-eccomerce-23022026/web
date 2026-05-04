# Convenções de Teste - LES E-Commerce de Livros

## Seletores `data-cy`

### Cupons Aplicados
- Seletor: `checkout-coupon-{codigo}`
- Exemplo: `checkout-coupon-DESCONTO10`
- Localização: `CupomInput.tsx` linha 80
- Nota: O seletor é dinâmico baseado no código do cupom

### Split de Pagamento
- Seletor de restante: `checkout-split-restante`
- Localização: `CheckoutSplitPagamento.tsx` linha 145
- Formato do texto (E2E): `"Total após cupons: R$ X · Soma das linhas: R$ Y · OK"`
- Nota: O texto inclui informações detalhadas de total e soma, não apenas "OK"

### Erro RN0034
- Seletor: `checkout-split-rn34-error`
- Localização: `CheckoutSplitPagamento.tsx` linha 152
- Nota: O erro é mostrado dinamicamente quando a validação falha

## Mapa de suítes (cenário → arquivo → papel)

| Cenário | Arquivo | Observação |
|--------|---------|------------|
| **Happy path único** (login UI → carrinho → checkout → frete PAC → cupom DESCONTO10 → cartão → venda) | `e2e/fluxo/cliente-login-compra-feliz.cy.ts` | **Um** `it` longo; não cobre split, dois cupons, parcial, etc. |
| **Outros sucessos** (cupom+troca, parcial, split cartão+PIX, resumos, `cotacaoUuid`, …) | `e2e/user/cliente/checkout/pagamento.cy.ts` | Vários `it` ativos; ainda há `it.skip` (modal novo cartão, Luhn, RN0034 na UI, …). |
| **Falhas / validações** (sem endereço+frete, cupom inválido, CEP inexistente, teto sandbox) | `e2e/fluxo/cliente-login-compra-falhas.cy.ts` | Livro(s) via `GET /livros` / `obterPrimeiroLivroUuidDoCatalogo`. |
| **Frete / CEP / jornada longa na UI** | `e2e/user/cliente/checkout/entrega-frete.cy.ts` | Catálogo → checkout; sensível a Redux. |
| **Regras via API** (cupom, RN0034, política parcelas) | `e2e/integration/pagamento-api.cy.ts` | Menos flakiness que UI. |

Lista atual de `.skip` em checkout de pagamento: `grep -n "it\\.skip" web/cypress/e2e/user/cliente/checkout/pagamento.cy.ts`.

## Ambiente: `injectTestDbHeader` e `apiUrl`

- **`cypress.config.ts`**: `injectTestDbHeader: false` e `apiUrl: http://localhost:5173/api` (Vite + proxy `/api`).
- **Scripts npm** de compra/checkout passam **`injectTestDbHeader=true`** para o app injetar `x-use-test-db` (`cypress/support/e2e.ts`).
- **`cy.request()`** não passa por `cy.intercept`; comandos como `loginApi` e specs de integração enviam `x-use-test-db` nas headers quando necessário.
- **`cliente-login-compra-feliz`** e **`cliente-login-compra-falhas`**: `beforeEach` com `Cypress.env('injectTestDbHeader', true)` para alinhar ao Postgres de teste sem depender só da CLI.

### Scripts npm (`web/`)

| Script | Uso |
|--------|-----|
| `npm run test:e2e` | Alias → `test:e2e:compra:run` (feliz + falhas + carrinho checkout). |
| `npm run test:e2e:integration:run` | Só `pagamento-api.cy.ts` + header de teste. |
| `npm run cypress:run:e2e-compra-devdb` | Mesmas specs de compra com **`injectTestDbHeader=false`** (fase 1 de `scripts/run-e2e-compra-com-relatorio.sh`). |
| `npm run cypress:run:e2e-compra-testdb` | Igual `test:e2e:compra:run` (test DB). |
| `npm run cypress:run:e2e-checkout-pagamento` | `pagamento.cy.ts` + `entrega-frete.cy.ts`. |

Backend na porta 3000 sem Vite: acrescentar `--env apiUrl=http://localhost:3000/api`.

## Integração API-first

- `pagamento-api.cy.ts`: cupons e split/RN0034/política de parcelas; **`cy.request`** com `x-use-test-db` quando aplicável.
- `GET /cupom/disponiveis` pode permanecer com resposta fixa no backend até a regra evoluir — os testes documentam o contrato atual.

## Histórico / contexto

- Mocks trocados por API real nos fluxos principais; helpers em `cypress/support/helpers/checkoutHelpers.ts`.
- Rotas de cupom (`cupom.routes.ts`), migrations 027/028.
- Formato do restante no split: regex `/Total.*Soma das linhas.*OK/` ou `/Ajuste/`.

## Estratégia de Testes

### Testes E2E (UI)
- Foco: Fluxo completo de usuário
- Dependência: UI renderizada corretamente
- Uso: Validar experiência de usuário final

### Testes de Integração API-first
- Foco: Lógica de negócio
- Dependência: Apenas API backend
- Uso: Validar regras de negócio sem depender de UI
- Localização: `cypress/e2e/integration/`

### Testes Unitários
- Foco: Funções e componentes isolados
- Dependência: Nenhuma (mocks)
- Uso: Validar lógica específica

## Helpers Cypress

### Seleção Dinâmica de Cartões
```typescript
// Obtém cartões do cliente via API
function obterCartoesCliente() {
  const apiUrl = Cypress.env('apiUrl') || 'http://localhost:5173/api';
  return cy.request({
    method: 'GET',
    url: `${apiUrl}/pagamento/info`,
    qs: { cepDestino: '01310100', pesoKg: 1 },
    headers: apiHeadersTestDb(),
  }).its('body.cartoesCliente');
}

// Seleciona o primeiro cartão disponível
function selecionarPrimeiroCartaoCheckout() {
  obterCartoesCliente()
    .should('be.an', 'array')
    .should('have.length.at.least', 1)
    .then((cartoes) => {
      const primeiro = cartoes[0];
      cy.get(`[data-cy="checkout-card-item-${primeiro.ultimosDigitosCartao}"]`)
        .scrollIntoView()
        .should('be.visible')
        .click({ force: true });
    });
}
```

### Headers para Banco de Testes
```typescript
function apiHeadersTestDb(): Record<string, string> {
  const useTestDb = Cypress.env('injectTestDbHeader') === true;
  return {
    ...(useTestDb ? { 'x-use-test-db': 'true' } : {}),
  };
}
```

## Boas Práticas

1. **Usar `scrollIntoView()` antes de clicar** em elementos que podem estar fora da viewport
2. **Usar `{ force: true }`** quando o elemento está visível mas coberto por outro elemento
3. **Preferir `cy.request`** para validação de lógica de negócio
4. **Usar seletores `data-cy`** em vez de seletores CSS genéricos
5. **`it.skip`** apenas com comentário objetivo; inventário em `pagamento.cy.ts` via `grep it\\.skip`
6. **Documentar mudanças de formato** neste arquivo quando afetarem asserts

## Referências

- Frontend React: `web/AGENTS.md`
- Backend SQL: `backend/sql/AGENTS.md`
- Documentação Exigida: `documentacao-exigida/`
