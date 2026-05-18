# Testes Frontend e E2E - 7ª Entrega

## Visão Geral

Este documento descreve a estrutura e organização dos testes automatizados criados para a 7ª entrega, baseados na documentação técnica das rotas backend (`backend/RESULTADOS_TESTE_ENTREGA_7.md`).

## Estrutura dos Testes

### Testes E2E por Caso de Uso

Localização: `web/cypress/e2e/casos-uso-entrega-7/`

| Caso de Uso | Arquivo | Descrição |
|-------------|---------|-----------|
| CDU001 | `cdu001-cliente-realizar-compra.cy.ts` | Cliente realiza compra com validações de parcelamento e split payment |
| CDU002 | `cdu002-cliente-pagar-combinacoes.cy.ts` | Cliente paga com combinações (split payment, cupons) |
| CDU003 | `cdu003-registrar-cartao-endereco.cy.ts` | Cliente cadastra novo cartão e endereço |
| CDU004 | `cdu004-solicitar-troca.cy.ts` | Cliente solicita troca/devolução |
| CDU005 | `cdu005-admin-confirma-pagamento.cy.ts` | Admin confirma pagamento |
| CDU006 | `cdu006-admin-aceitar-negar-troca.cy.ts` | Admin autoriza ou rejeita troca |
| CDU007 | `cdu007-admin-despacha-entrega.cy.ts` | Admin agenda entrega (EM TRANSPORTE) |
| CDU008 | `cdu008-admin-confirma-recebimento.cy.ts` | Admin confirma recebimento e gera cupom |
| CDU009 | `cdu009-sistema-gera-cupom.cy.ts` | Sistema gera cupom automaticamente |
| CDU010 | `cdu010-admin-confirma-entregue.cy.ts` | Admin confirma ENTREGUE |

### Testes Unitários Frontend (Existentes)

Localização: `web/src/components/**/`

| Componente | Arquivo de Teste | Status |
|-------------|------------------|--------|
| FormInput | `Comum/Form/FormInput.test.tsx` | ✅ Existente |
| useNotification | `Comum/Notification/useNotification.test.tsx` | ✅ Existente |
| ProtectedRoute | `Comum/ProtectedRoute/ProtectedRoute.test.tsx` | ✅ Existente |
| CartaoCreditoForm | `FinalizarCompra/Pagamento/CartaoCreditoForm.test.tsx` | ✅ Existente |
| CheckoutSplitPagamento | `FinalizarCompra/Pagamento/CheckoutSplitPagamento.test.tsx` | ✅ Existente |
| LinhaPagamentoConfiguracao | `FinalizarCompra/Pagamento/LinhaPagamentoConfiguracao.test.tsx` | ✅ Existente |

## Convenções de Testes

### API-Driven com Logs

Todos os testes E2E seguem o padrão API-driven com logs detalhados:

```typescript
cy.log('**Etapa: Nome da etapa**');
cy.request({
  method: 'POST',
  url: `${apiUrl}/vendas`,
  headers: apiHeadersTestDb(),
  body: { /* payload */ }
}).then((response) => {
  cy.log('**Resposta POST /api/vendas:**');
  cy.log(JSON.stringify(response.body, null, 2));
  expect(response.status).to.equal(201);
});
```

### Estrutura dos Testes

```typescript
describe('CDUXXX - Nome do Caso de Uso', () => {
  beforeEach(() => {
    Cypress.env('injectTestDbHeader', true);
    // Setup comum
  });

  describe('Caminho Feliz - Descrição', () => {
    it('deve [descrição do cenário]', () => {
      cy.log('**Etapa 1: ...**');
      // Implementação
    });
  });

  describe('Validações de Negócio', () => {
    it('deve [descrição da validação]', () => {
      // Implementação
    });
  });
});
```

### Helpers Reutilizáveis

- `apiHeadersTestDb()` - Headers para requests com banco de testes
- `obterPrimeiroLivroUuidDoCatalogo()` - Obtém livro do catálogo
- `loginApi()` - Autenticação via API
- `limparCarrinhoApi()` - Limpa carrinho antes dos testes

## Execução dos Testes

### Executar todos os testes por caso de uso

```bash
cd web
npm run cypress:run --configSpecPattern=cypress/e2e/casos-uso-entrega-7/**/*.cy.ts
```

### Executar caso de uso específico

```bash
cd web
npm run cypress:run --spec=cypress/e2e/casos-uso-entrega-7/cdu001-cliente-realizar-compra.cy.ts
```

### Executar com banco de dados de teste

```bash
cd web
npm run cypress:run --configSpecPattern=cypress/e2e/casos-uso-entrega-7/**/*.cy.ts --env injectTestDbHeader=true
```

### Executar em modo interativo (dev)

```bash
cd web
npm run cypress:open
```

## Cobertura de Casos de Uso

### Casos de Uso Cobertos (100%)

- ✅ CDU001: Cliente realizar compra
- ✅ CDU002: Cliente pagar com combinações
- ✅ CDU003: Registrar novo cartão/endereço
- ✅ CDU004: Solicitar troca/devolução
- ✅ CDU005: Admin confirma pagamento
- ✅ CDU006: Admin aceitar/negar troca
- ✅ CDU007: Admin define EM TRANSPORTE
- ✅ CDU008: Admin confirma recebimento
- ✅ CDU009: Sistema gerar cupom
- ✅ CDU010: Admin confirma ENTREGUE

### Validações de Negócio Testadas

- ✅ RN0069: Parcelamento mínimo R$ 80,00
- ✅ RN0034: Mínimo R$ 10,00 por meio de pagamento no split
- ✅ RN0043: Prazo de arrependimento de 7 dias
- ✅ RN0063: Troca apenas para pedidos entregues
- ✅ RN0065: Motivo obrigatório ao rejeitar troca
- ✅ RN0067: Custo do frete validado
- ✅ RN0068: Status "ENTREGUE" habilita solicitações de troca

### Rotas API Testadas

- ✅ POST /api/auth/login
- ✅ POST /api/vendas
- ✅ GET /api/vendas/:uuid
- ✅ POST /api/vendas/:uuid/troca
- ✅ PATCH /api/admin/pedidos/:uuid/autorizar-troca
- ✅ PATCH /api/admin/pedidos/:uuid/rejeitar-troca
- ✅ PATCH /api/admin/pedidos/:uuid/confirmar-recebimento
- ✅ POST /api/entregas
- ✅ PATCH /api/entregas/:entregaUuid/confirmar
- ✅ PATCH /api/entregas/:entregaUuid/falha
- ✅ GET /api/entregas?vendaUuid=:uuid
- ✅ POST /api/pagamento/processar
- ✅ GET /api/cupom/disponiveis
- ✅ POST /api/carrinho/itens
- ✅ GET /api/carrinho
- ✅ GET /api/clientes/perfil
- ✅ POST /api/clientes/perfil/cartoes
- ✅ POST /api/clientes/perfil/enderecos

## Boas Práticas Aplicadas

1. **API-First**: Testes usam `cy.request` para validação de lógica de negócio sem depender de UI
2. **Logs Detalhados**: Todas as requisições e respostas são logadas para debugging
3. **Seletores data-cy**: Preferência por seletores `data-cy` em vez de seletores CSS genéricos
4. **Banco de Testes**: Uso de header `x-use-test-db` para isolar testes
5. **Early Return**: Validações de erro são feitas imediatamente com `failOnStatusCode: false`
6. **Nomenclatura em Português**: Todo código em Português seguindo regras do projeto
7. **Linguagem Ubíqua**: Uso de termos do negócio (venda, entrega, troca, cupom)

## Próximos Passos

### Testes Unitários Adicionais (Opcional)

Considerar criar testes unitários para:
- Hooks customizados de pagamento
- Hooks customizados de autenticação
- Componentes de checkout (endereço, frete, cupom)
- Componentes de troca (solicitação, status)

### Testes de Integração UI

Considerar criar testes E2E UI para:
- Fluxo completo de compra via interface
- Fluxo de troca via interface
- Fluxo de admin via interface

## Referências

- Documentação técnica: `backend/RESULTADOS_TESTE_ENTREGA_7.md`
- Convenções de teste: `web/cypress/TESTING_CONVENTIONS.md`
- Regras de nomenclatura: `web/AGENTS.md`
- Regras universais: `.windsurf/rules/universal-nomenclatura.md`
