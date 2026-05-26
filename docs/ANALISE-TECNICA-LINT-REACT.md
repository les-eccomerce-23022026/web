# 🔍 Análise Técnica: Sincronização de Estados e Padrões React 18+

## 1. Diagnóstico do Problema
Durante a auditoria de QA e linting, identificamos múltiplos alertas de `react-hooks/set-state-in-effect` nos componentes de checkout e perfil.

### Sintoma
```tsx
useEffect(() => {
  if (props.valor) {
    setEstado(props.valor); // ❌ Gatilho de renderização em cascata
  }
}, [props.valor]);
```

### Impacto
1.  **Cascading Renders:** O React renderiza o componente com o estado antigo, o efeito dispara, o estado muda e o React renderiza novamente. Em fluxos complexos como o `CheckoutSplitPagamento.tsx`, isso causa lentidão perceptível.
2.  **Dificuldade de Manutenção:** O fluxo de dados torna-se bidirecional e imprevisível, dificultando o rastreio de bugs de estado.

---

## 2. Proposta de Correção Definitiva

Para satisfazer o linter e adotar padrões modernos, devemos migrar para as seguintes abordagens:

### A. Estados Derivados (Eliminação do Effect)
Sempre que um estado puder ser calculado a partir de props ou de outro estado, não devemos usar `useEffect`.

**Como é hoje:**
```tsx
const [cep, setCep] = useState('');
useEffect(() => { setCep(formatar(initialCep)); }, [initialCep]);
```

**Correção:**
```tsx
// Se o CEP só muda por prop, use memoização ou inicialização controlada
const cepFormatado = useMemo(() => formatar(initialCep), [initialCep]);
```

### B. "Resetting State" com `key`
Para componentes que precisam resetar todo o seu estado interno quando um "ID" muda (ex: mudar de endereço no checkout), a prática recomendada pelo React 18+ é usar o atributo `key`.

```tsx
// No componente pai
<FreteCalculo key={enderecoSelecionado.uuid} />
```
*Isso força o React a destruir e recriar o componente, garantindo que o estado interno seja reinicializado de forma limpa.*

---

## 3. Plano de Refatoração ✅ IMPLEMENTADO

| Componente | Complexidade | Ação Sugerida | Status |
| :--- | :--- | :--- | :--- |
| `FreteCalculo.tsx` | Baixa | Migrar para `useState` com função de inicialização e remover `useEffect`. | ✅ Concluído |
| `FinalizarCompra.tsx` | Alta | Implementar `key` baseada no UUID do pedido/cliente para reset de formulário. | ✅ Concluído |
| `MeusPedidos.tsx` | Média | Substituir sincronização manual por estados derivados (`useMemo`). | ✅ Concluído |

## 4. Conclusão
A refatoração para **Estados Derivados** e o uso de **keys para reset de estado** foram aplicados com sucesso. Os erros de lint relacionados a `set-state-in-effect` foram eliminados nos componentes críticos, garantindo a performance "sênior" exigida pelo projeto LES 2026.
