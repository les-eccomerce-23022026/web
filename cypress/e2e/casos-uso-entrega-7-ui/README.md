# Testes E2E com telas — 7ª entrega (casos de uso)

Suíte **UI-first**: navega pelas páginas reais do Next.js (`/`, `/checkout`, `/pedidos`, `/admin/*`, `/minha-conta`), com `cy.visit`, cliques e asserts visuais.

A pasta irmã [`casos-uso-entrega-7/`](../casos-uso-entrega-7/) mantém os testes **API-driven** (contrato HTTP / BDD export).

## Helpers

- [`cypress/support/helpers/uiEntrega7Helpers.ts`](../../support/helpers/uiEntrega7Helpers.ts) — jornadas de checkout, admin e troca
- [`cypress/support/helpers/bddEntrega7Helpers.ts`](../../support/helpers/bddEntrega7Helpers.ts) — setup rápido via API quando a UI não é o foco do cenário

## Mapa CDU → spec UI

| CDU | Arquivo UI | Telas exercitadas |
|-----|------------|-------------------|
| 001 | `cdu001-ui-cliente-realizar-compra.cy.ts` | Catálogo, carrinho, checkout, pedido confirmado, admin pedidos |
| 002 | `cdu002-ui-cliente-pagar-combinacoes.cy.ts` | Checkout (cupom, split, RN0034) |
| 003 | `cdu003-ui-registrar-cartao-endereco.cy.ts` | Minha conta (endereços e cartões) |
| 004 | `cdu004-ui-solicitar-troca.cy.ts` | Solicitar troca, meus pedidos |
| 005 | `cdu005-ui-pagamento-aprovado.cy.ts` | Checkout, meus pedidos |
| 006 | `cdu006-ui-admin-trocas.cy.ts` | Admin trocas |
| 007 | `cdu007-ui-admin-despacho.cy.ts` | Admin pedidos (despacho) |
| 008 | `cdu008-ui-admin-recebimento.cy.ts` | Admin trocas (recebimento) |
| 009 | `cdu009-ui-cupom-troca.cy.ts` | Admin trocas + checkout com cupom |
| 010 | `cdu010-ui-confirmar-entregue.cy.ts` | Admin pedidos + meus pedidos |

## Execução

Requer **Next.js** em `http://localhost:3002` (`npm run dev` no workspace `web`) com proxy `/api` → backend, e **Postgres de teste** com seed (`005_seed_usuarios_teste.sql`). O backend Express costuma ficar na porta **3000**; os scripts desta suíte usam `baseUrl`/`apiUrl` na **3002** (mesmo padrão de `test:e2e:entrega-7:*`).

```bash
# Terminal 1 — backend (porta 3000)
cd backend && npm run dev

# Terminal 2 — Next na 3002 (proxy /api → backend)
cd web && PORT=3002 BACKEND_URL=http://localhost:3000 npm run dev

# Terminal 3 — suíte UI
cd web && npm run test:e2e:entrega-7-ui:run
```

Navegador visível (Chrome, executa a suíte ao rodar o comando):

```bash
cd web
npm run test:e2e:entrega-7-ui:open
```

App Cypress (escolher spec manualmente, time-travel):

```bash
cd web
npm run test:e2e:entrega-7-ui:gui
```

## Estratégia

1. **Assert principal na UI** (textos, badges, toasts, URL).
2. **Setup mínimo via API** apenas para pré-condição (ex.: pedido já aprovado antes de despachar na UI).
3. **Seletores `data-cy`** conforme `web/cypress/TESTING_CONVENTIONS.md`.
4. **`injectTestDbHeader=true`** alinhado ao Postgres de testes.

## Confiabilidade (P0/P1)

- **Checkout:** `configurarInterceptadoresFinalizacaoCheckoutUi()` + `cy.wait` da cadeia `criarVenda` → `selecionarPagamento` → `processarPagamento` → `cadastrarEntrega` antes do assert de `/pedido-confirmado` (`uiEntrega7Helpers.ts`).
- **Troca:** jornada Meus Pedidos → `btn-solicitar-troca-{uuid}` → `/troca`; cenário 7 usa `this.skip()` se `bddRetrocederDataEntrega` falhar (sem pass silencioso).
- **CDU006:** solicitação de troca pelo cliente na UI; admin só autoriza/rejeita.
- **Aliases:** preferir `cy.wrap().as()` em vez de `let` nos `beforeEach` (CDU007/CDU010).
