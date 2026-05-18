# Testes E2E por Caso de Uso - 7ª Entrega

## Estrutura Organizacional

Este diretório contém testes E2E organizados por caso de uso, baseados na documentação técnica das rotas backend (`backend/RESULTADOS_TESTE_ENTREGA_7.md`).

## Casos de Uso Cobertos

| Caso de Uso | Arquivo de Teste | Status |
|-------------|------------------|--------|
| 1. Cliente realizar compra | `cdu001-cliente-realizar-compra.cy.ts` | ✅ |
| 2. Cliente pagar com combinações | `cdu002-cliente-pagar-combinacoes.cy.ts` | ✅ |
| 3. Registrar novo cartão/endereço | `cdu003-registrar-cartao-endereco.cy.ts` | ✅ |
| 4. Solicitar troca/devolução | `cdu004-solicitar-troca.cy.ts` | ✅ |
| 5. Admin confirma pagamento | `cdu005-admin-confirma-pagamento.cy.ts` | ✅ |
| 6. Admin aceitar/negar troca | `cdu006-admin-aceitar-negar-troca.cy.ts` | ✅ |
| 7. Admin define EM TRANSPORTE | `cdu007-admin-despacha-entrega.cy.ts` | ✅ |
| 8. Admin confirma recebimento | `cdu008-admin-confirma-recebimento.cy.ts` | ✅ |
| 9. Sistema gerar cupom | `cdu009-sistema-gera-cupom.cy.ts` | ✅ |
| 10. Admin confirma ENTREGUE | `cdu010-admin-confirma-entregue.cy.ts` | ✅ |

## Convenções de Testes

### API-Driven com Logs
- Todos os testes usam `cy.log()` para documentar o fluxo
- Interceptações de rotas API são registradas com `cy.intercept().as()`
- Logs temporários de dados retornados enquanto testes não passam

### Seletores data-cy
- Preferir seletores `data-cy` em vez de seletores CSS genéricos
- Seguir convenções existentes em `TESTING_CONVENTIONS.md`

### Estrutura dos Testes
```typescript
describe('CDUXXX - Nome do Caso de Uso', () => {
  beforeEach(() => {
    Cypress.env('injectTestDbHeader', true);
    // Setup comum
  });

  it('deve [descrição do cenário]', () => {
    cy.log('**Etapa: Nome da etapa**');
    // Implementação
  });
});
```

### Helpers Reutilizáveis
- Usar helpers de `cypress/support/helpers/checkoutHelpers.ts`
- Usar helpers de `cypress/support/helpers/apiHelpers.ts` (se existir)

## Execução dos Testes

### Executar todos os testes por caso de uso
```bash
npm run cypress:run --configSpecPattern=cypress/e2e/casos-uso-entrega-7/**/*.cy.ts
```

### Executar caso de uso específico
```bash
npm run cypress:run --spec=cypress/e2e/casos-uso-entrega-7/cdu001-cliente-realizar-compra.cy.ts
```

### Executar com banco de dados de teste
```bash
npm run cypress:run --configSpecPattern=cypress/e2e/casos-uso-entrega-7/**/*.cy.ts --env injectTestDbHeader=true
```

## Referências

- Documentação técnica: `backend/RESULTADOS_TESTE_ENTREGA_7.md`
- Convenções de teste: `web/cypress/TESTING_CONVENTIONS.md`
- Regras de nomenclatura: `web/AGENTS.md`
