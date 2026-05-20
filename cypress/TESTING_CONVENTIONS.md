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

## Estrutura de Testes E2E por Domínio

A reorganização dos testes E2E segue uma estrutura baseada em domínios de negócio, facilitando a manutenção e localização de testes.

### Diretórios por Domínio

```
cypress/e2e/
├── autenticacao/          # Login, registro, proteção de rotas, permissões
├── clientes/              # Perfil, endereços, cartões, inativação
├── catalogo/              # Home, listagem de livros, detalhes do livro
├── carrinho/              # Gerenciar itens, cotar frete
├── vendas/                # Fluxo de compra, checkout, validações
├── pagamentos/            # Cartões, cupons, salvamento no checkout
├── entregas/              # Despacho, confirmação, cotação de frete
├── trocas/                # Solicitação, autorização, recebimento, cupom
├── admin/                 # Dashboard administrativo
├── responsividade/       # Testes mobile-first
└── user/                  # Utils e helpers legados (preservados)
```

### Mapa de Suítes (Domínio → Capacidade → Arquivo)

| Domínio | Capacidade | Arquivo | Observação |
|---------|-----------|---------|------------|
| **Autenticação** | Login Cliente | `autenticacao/login-cliente.cy.ts` | Fluxo de login do cliente |
| **Autenticação** | Login Administrador | `autenticacao/login-admin.cy.ts` | Fluxo de login do admin |
| **Autenticação** | Registro de Cliente | `autenticacao/registro-cliente.cy.ts` | Wizard de registro |
| **Autenticação** | Proteção de Rotas | `autenticacao/protecao-rotas-cliente.cy.ts` | Acesso não autorizado |
| **Autenticação** | Permissões Admin | `autenticacao/permissoes-admin.cy.ts` | Controle de acesso admin |
| **Clientes** | Dados Básicos | `clientes/perfil-dados-basicos.cy.ts` | Atualização de perfil |
| **Clientes** | Troca de Senha | `clientes/perfil-trocar-senha.cy.ts` | Alteração de senha |
| **Clientes** | Gerenciar Endereços | `clientes/gerenciar-enderecos.cy.ts` | CRUD de endereços |
| **Clientes** | Limite de Endereços | `clientes/limite-enderecos.cy.ts` | RN0021 |
| **Clientes** | Gerenciar Cartões | `clientes/gerenciar-cartoes.cy.ts` | CRUD de cartões |
| **Clientes** | Inativação de Conta | `clientes/inativar-conta.cy.ts` | RN0008 |
| **Clientes** | Registrar Cartão/Endereço | `clientes/registrar-cartao-e-endereco-checkout.cy.ts` | CDU003 |
| **Clientes** | Falha ao Atualizar Endereço | `clientes/atualizar-endereco-falha.cy.ts` | RF0038, RF0039 |
| **Catálogo** | Home e Listagem | `catalogo/home-listagem.cy.ts` | Exibição de livros |
| **Catálogo** | Conteúdo dos Livros | `catalogo/home-conteudo-livros.cy.ts` | Validação de conteúdo |
| **Catálogo** | Detalhes do Livro | `catalogo/detalhes-livro.cy.ts` | Página do produto |
| **Carrinho** | Gerenciar Itens e Frete | `carrinho/gerenciar-carrinho-e-cotar-frete.cy.ts` | Operações de carrinho |
| **Vendas** | Caminho Feliz | `vendas/caminho-feliz-compra.cy.ts` | Fluxo principal |
| **Vendas** | Realizar Compra Completa | `vendas/realizar-compra-completa.cy.ts` | CDU001 |
| **Vendas** | Falhas Recuperáveis | `vendas/falhas-na-compra.cy.ts` | Validações de checkout |
| **Vendas** | Múltiplas Falhas | `vendas/multiplas-falhas-consecutivas.cy.ts` | Cancelamento automático |
| **Vendas** | Validações de Formulários | `vendas/validacoes-de-formularios.cy.ts` | Casos de borda |
| **Vendas** | Fluxo Ponta a Ponta | `vendas/fluxo-ponta-a-ponta.cy.ts` | Cliente + Admin |
| **Vendas** | Evidências Visuais | `vendas/evidencias-visuais-compra.cy.ts` | Screenshots |
| **Vendas** | Etapas do Checkout | `vendas/etapas-do-checkout.cy.ts` | Passos do checkout |
| **Pagamentos** | Combinações de Pagamento | `pagamentos/combinacoes-de-pagamento.cy.ts` | CDU002 |
| **Pagamentos** | Aprovação da Venda | `pagamentos/pagamento-aprovado.cy.ts` | CDU005 |
| **Pagamentos** | Cartões e Cupons | `pagamentos/pagamento-no-checkout.cy.ts` | Salvamento no checkout |
| **Pagamentos** | Parcelamento Mínimo | `pagamentos/pagamento-no-checkout.cy.ts` | RN0069 |
| **Pagamentos** | Cadastrar Endereço | `pagamentos/cadastrar-endereco-no-checkout.cy.ts` | Cadastro no checkout |
| **Entregas** | Despachar Pedido | `entregas/despachar-pedido.cy.ts` | CDU007, RF0038 |
| **Entregas** | Despacho e Confirmação | `entregas/despacho-e-confirmacao-admin.cy.ts` | Fluxo admin |
| **Entregas** | Falha e Reendereçamento | `entregas/falha-de-entrega-e-reenderecamento.cy.ts` | Recuperação de entrega |
| **Entregas** | Confirmar Entrega | `entregas/confirmar-entregue.cy.ts` | CDU010, RF0039 |
| **Entregas** | Cotação de Frete | `entregas/cotacao-de-frete-no-checkout.cy.ts` | Cálculo de frete |
| **Trocas** | Solicitar Troca | `trocas/solicitar-troca-cliente.cy.ts` | CDU004, RF0041 |
| **Trocas** | Autorizar/Rejeitar | `trocas/autorizar-ou-rejeitar-troca.cy.ts` | CDU006, RF0042 |
| **Trocas** | Confirmar Recebimento | `trocas/confirmar-recebimento.cy.ts` | CDU008, RF0044 |
| **Trocas** | Validações | `trocas/solicitar-troca-validacoes.cy.ts` | RF0040, RF0043 |
| **Trocas** | Fluxo Administrativo | `trocas/fluxo-administrativo-trocas.cy.ts` | Gestão de trocas |
| **Trocas** | Geração de Cupom | `trocas/cupom-gerado-pela-troca.cy.ts` | CDU009, RF0046 |
| **Admin** | Dashboard | `admin/dashboard.cy.ts` | Painel administrativo |
| **Responsividade** | Jornadas Cliente | `responsividade/jornadas-criticas-cliente.cy.ts` | Mobile-first |
| **Responsividade** | Painel Admin | `responsividade/painel-administrativo.cy.ts` | Mobile-first |

### Convenções de Nomenclatura

**Arquivos:**
- Formato: `kebab-case` + sufixo `.cy.ts`
- Exemplo: `login-cliente.cy.ts`, `gerenciar-enderecos.cy.ts`

**Blocos `describe`:**
- Formato: `describe('<Domínio> — <Capacidade>', () => ...)`
- Exemplo: `describe('Vendas — Realizar Compra Completa (CDU001)', () => ...)`

**Blocos `it`:**
- Formato: `it('deve <ação observável>[(RF000X, RN00YY)]', () => ...)`
- Exemplo: `it('deve exibir o cabeçalho com logo e links (RF0005)', () => ...)`

**Proibido:**
- Sufixos técnicos: `(UI Real)`, `(E2E)`, `TDD`, `via UI`, `via API`, `cdu00X-ui-...`
- snake_case em nomes de arquivos
- Termos técnicos genéricos: `entity`, `record`, `transaction`, `data`, `item`

## Ambiente: `injectTestDbHeader` e `apiUrl`

- **`cypress.config.ts`**: `injectTestDbHeader: false` e `apiUrl: http://localhost:5173/api` (Vite + proxy `/api`).
- **Scripts npm** de compra/checkout passam **`injectTestDbHeader=true`** para o app injetar `x-use-test-db` (`cypress/support/e2e.ts`).
- **`cy.request()`** não passa por `cy.intercept`; comandos como `loginApi` e specs de integração enviam `x-use-test-db` nas headers quando necessário.
- **`cliente-login-compra-feliz`** e **`cliente-login-compra-falhas`**: `beforeEach` com `Cypress.env('injectTestDbHeader', true)` para alinhar ao Postgres de teste sem depender só da CLI.

### Next.js SSR (MVP)

- **Dev server**: `npm run dev:next` → `http://localhost:3002` (porta 3000 usada pelo backend).
- **API proxy**: `next.config.mjs` com `rewrites` de `/api/*` → `http://localhost:3000/:path*`.
- **Rotas SSR**: `/`, `/livro/[uuid]` (Server Components com `generateMetadata`).
- **Rotas CSR** (futuro): `/carrinho`, `/minha-conta`, `/checkout`, `/pagamento`, `/admin/*`.
- **Testes SEO**: `cypress/e2e/seo/` com `cy.request` para validar HTML/meta sem `db:reset:all`.

### Scripts npm (`web/`)

| Script | Uso |
|--------|-----|
| `npm run test:e2e` | Alias → `test:e2e:compra:run` (feliz + falhas + carrinho checkout). |
| `npm run test:e2e:integration:run` | Só `pagamento-api.cy.ts` + header de teste. |
| `npm run cypress:run:e2e-compra-devdb` | Mesmas specs de compra com **`injectTestDbHeader=false`** (fase 1 de `scripts/run-e2e-compra-com-relatorio.sh`). |
| `npm run cypress:run:e2e-compra-testdb` | Igual `test:e2e:compra:run` (test DB). |
| `npm run cypress:run:e2e-checkout-pagamento` | `pagamento.cy.ts` + `entrega-frete.cy.ts`. |
| `npm run test:e2e:seo` | Specs de SEO/SSR com `cy.request` (sem `db:reset:all`). |

Backend na porta 3000 sem Vite: acrescentar `--env apiUrl=http://localhost:3000/api`.

## Integração API-first

- `pagamento-api.cy.ts`: cupons e split/RN0034/política de parcelas; **`cy.request`** com `x-use-test-db` quando aplicável.
- `GET /cupom/disponiveis` pode permanecer com resposta fixa no backend até a regra evoluir — os testes documentam o contrato atual.

## Histórico / contexto

- Mocks trocados por API real nos fluxos principais; helpers em `cypress/support/helpers/checkoutHelpers.ts`.
- Rotas de cupom (`cupom.routes.ts`), migrations 027/028.
- Formato do restante no split: regex `/Total.*Soma das linhas.*OK/` ou `/Ajuste/`.

## Estratégia de Testes

### Política API-Driven Only

Este projeto adota uma estratégia de testes E2E **API-driven only**, onde todos os testes Cypress exercitam o fluxo real de usuário em páginas/componentes contra o backend local, sem stubs falsos.

**Critério de Decisão:**
- ✅ **PRESERVAR**: Spec executa fluxo real em página/componente + usa `cy.request`/`cy.loginApi`/UI real contra backend local
- ❌ **EXCLUIR**: Spec usa `cy.intercept(url, { statusCode, body, ... })` para stubar resposta falsa
- ❌ **EXCLUIR**: Spec é unitário (`*.test.ts`/`*.test.tsx`)
- ❌ **EXCLUIR**: Spec valida apenas CSS/visual/SSR/API isolada
- ✅ **OK**: `cy.intercept(url).as(...)` apenas como spy (sem body) → API real

### Testes E2E (UI)
- Foco: Fluxo completo de usuário contra backend real
- Dependência: UI renderizada corretamente + backend local
- Uso: Validar experiência de usuário final em jornadas críticas
- Localização: `cypress/e2e/fluxo/`, `cypress/e2e/user/`, `cypress/e2e/shop/`, `cypress/e2e/casos-uso-entrega-7-ui/`, `cypress/e2e/ui-ux/` (apenas jornadas reais)

### Testes Unitários
- **NÃO UTILIZADOS** neste projeto
- Motivo: Decisão de focar em testes E2E API-driven para validar fluxos de usuário completos

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
- Next.js Migration Plan: `docs/plans/next-roteamento-ssr-cypress-tdd.md`
- ADR Next.js: `documentacao-exigida/adr/0003-nextjs-app-router-ssr-migration.md`
