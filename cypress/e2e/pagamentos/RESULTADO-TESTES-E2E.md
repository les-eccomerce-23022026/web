# Resultado dos Testes E2E - Validations Checkout

## Status Atual
❌ **10 de 13 testes falharam (77%)**  
✅ **3 de 13 testes passaram (23%)**

## Arquivo de Testes
`cypress/e2e/pagamentos/validacoes-checkout-rn0033-rn0034-rn0035-rn0036-rn0069.cy.ts`

## Resultado da Execução
**Data:** 2026-06-15 15:50:53  
**Duração:** 3 minutos, 25 segundos  
**Código de saída:** 10 (falha)

## Testes que Passaram ✅
1. RN0033 - Cupom Promocional Único - deve impedir aplicação de segundo cupom promocional
2. RN0035 - Cupons Prioritários - deve listar cupons reais do banco de dados
3. RN0036 - Cupom de Troca Excedente - deve rejeitar cupom inválido ou inexistente

## Testes que Falharam ❌

### RN0033 - Cupom Promocional Único
- ❌ deve permitir múltiplos cupons de troca junto com promocional

### RN0034 - Múltiplos Cartões
- ❌ deve impedir valor abaixo de R$ 10 em cartão adicional
- ❌ deve permitir múltiplos cartões com valor mínimo de R$ 10 cada

### RN0035 - Cupons Prioritários
- ❌ deve aplicar cupom promocional do banco corretamente

### RN0036 - Cupom de Troca Excedente
- ❌ deve permitir múltiplos cupons de troca
- ❌ deve aplicar cupom de troca com valor correto

### RN0069 - Parcelamento Mínimo
- ❌ deve impedir parcelamento para compra abaixo de R$ 80
- ❌ deve permitir parcelamento para compra acima de R$ 80

### Validações Combinadas
- ❌ deve aplicar cupom promocional e cupom de troca juntos
- ❌ deve manter validações com múltiplos cartões e cupons

## Principais Erros Identificados

### 1. Erro de Autenticação ⚠️
**Erro:** "Token não fornecido"  
**Impacto:** Login via UI não está funcionando corretamente  
**Causa:** O helper `loginClienteUi()` usa login via UI, mas o frontend Next.js está com problemas de autenticação  
**Solução necessária:** Investigar o sistema de autenticação Next.js ou usar login programático via API

### 2. Erro de Hidratação Next.js ⚠️
**Erro:** "Hydration failed because the server rendered HTML didn't match the client"  
**Impacto:** Next.js SSR não está correspondendo com client-side rendering  
**Causa:** Possível uso de variáveis dinâmicas ou condições de server/client no código  
**Solução necessária:** Investigar componentes que causam mismatch entre server e client

### 3. Erro de Seletores - Pagamento Parcial ✅ **CORRIGIDO**
**Erro:** "Expected to find content: 'Adicionar' within the element: <button.btn-secondary> but never did"  
**Impacto:** Seletores incorretos no componente de pagamento parcial  
**Causa:** Uso de `.within()` com seletores genéricos em vez de data-cy específicos  
**Solução aplicada:** Substituído seletores genéricos por data-cy específicos:
- `checkout-partial-value-input` (input de valor)
- `checkout-add-partial-payment-button` (botão adicionar)
- `checkout-partial-payment-error` (mensagem de erro)

### 4. Erro de Múltiplos Elementos ⚠️
**Erro:** "Too many elements found. Found '12', expected '1'"  
**Impacto:** Seletor encontrando múltiplos elementos quando esperava apenas 1  
**Causa:** Provavelmente seletor muito genérico que corresponde a múltiplos elementos na página  
**Solução necessária:** Tornar seletores mais específicos usando data-cy ou contexto mais restrito

## Correções Aplicadas

### Seletores de Pagamento Parcial
**Antes:**
```typescript
cy.get('[data-cy="checkout-partial-payment"]').within(() => {
  cy.get('input[type="number"]').clear().type('5.00');
  cy.get('button').contains('Adicionar').click();
});
```

**Depois:**
```typescript
cy.get('[data-cy="checkout-partial-value-input"]').clear().type('5.00');
cy.get('[data-cy="checkout-add-partial-payment-button"]').click();
```

### Seletores de Erro
**Antes:**
```typescript
cy.get('[data-cy="checkout-coupon-error"]')
```

**Depois:**
```typescript
cy.get('[data-cy="checkout-partial-payment-error"]')
```

### Seletores de Valor Total
**Antes:**
```typescript
cy.get('[data-cy="checkout-total-pagamento"]')
```

**Depois:**
```typescript
cy.get('[data-cy="checkout-total-value"]')
```

### Uso de .first()
**Correção:** Removido `.first()` redundante após `.contains()` pois `.contains()` já retorna o primeiro elemento que corresponde ao filtro de texto.

## Próximos Passos Recomendados

### Alta Prioridade
1. **Investigar autenticação Next.js:** O erro "Token não fornecido" está impedindo que os testes funcionem corretamente. Possíveis soluções:
   - Usar login programático via API em vez de UI
   - Investigar o sistema de autenticação Next.js
   - Verificar se os cookies estão sendo definidos corretamente

2. **Resolver erro de hidratação:** O erro de hidratação Next.js está causando instabilidade nos testes. Possíveis soluções:
   - Identificar componentes que usam variáveis dinâmicas
   - Usar `useEffect` para código que deve rodar apenas no client
   - Verificar condições de server/client no código

### Média Prioridade
3. **Corrigir seletor de múltiplos elementos:** Identificar qual seletor está encontrando 12 elementos e torná-lo mais específico
4. **Adicionar seletores faltantes:** Verificar se todos os componentes necessários têm data-cy apropriados
5. **Melhorar estabilidade dos testes:** Adicionar waits e timeouts adequados para operações assíncronas

### Baixa Prioridade
6. **Otimizar performance dos testes:** Reduzir tempo de execução dos testes
7. **Adicionar mais cenários de teste:** Cobrir mais casos de borda e cenários negativos

## Conclusão

Os testes E2E foram criados com sucesso e cobrem as validações de checkout solicitadas. No entanto, problemas fundamentais do ambiente (autenticação Next.js e hidratação) estão impedindo que a maioria dos testes passe. As correções de seletores foram aplicadas, mas os problemas de autenticação precisam ser resolvidos antes que os testes possam funcionar corretamente.

**Status:** ⚠️ **Aguardando correção de autenticação Next.js e erro de hidratação**
