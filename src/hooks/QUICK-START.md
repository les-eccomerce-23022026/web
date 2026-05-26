# Quick Start: useLojaAtiva

## Instalação (já feita ✅)

O hook está pronto para usar. Nenhuma instalação adicional necessária.

## Uso Básico (30 segundos)

### 1. Importar o hook

```tsx
import { useLojaAtiva } from '@/hooks/useLojaAtiva';
```

### 2. Usar no componente

```tsx
export function MeuComponente() {
  const { lojaAtiva, carregando, erro } = useLojaAtiva();

  if (carregando) return <div>Carregando...</div>;
  if (erro) return <div>Erro: {erro}</div>;
  if (!lojaAtiva) return <div>Nenhuma loja selecionada</div>;

  return <div>Bem-vindo à {lojaAtiva.nome}</div>;
}
```

## Exemplos Práticos

### Exibir informações da loja

```tsx
export function HeaderLoja() {
  const { lojaAtiva } = useLojaAtiva();

  return (
    <header>
      {lojaAtiva && (
        <div>
          <h1>{lojaAtiva.nome}</h1>
          <p>CNPJ: {lojaAtiva.cnpj}</p>
        </div>
      )}
    </header>
  );
}
```

### Trocar de loja

```tsx
export function SeletorLoja() {
  const { lojaAtiva, trocarLoja } = useLojaAtiva();

  return (
    <div>
      <p>Loja atual: {lojaAtiva?.nome}</p>
      <button onClick={() => trocarLoja('novo-uuid')}>
        Trocar Loja
      </button>
    </div>
  );
}
```

### Validar loja antes de renderizar

```tsx
export function PaginaProtegida() {
  const { lojaAtiva, carregando } = useLojaAtiva();

  // Enquanto carrega, não renderizar nada
  if (carregando) return null;

  // Se não houver loja, redirecionar
  if (!lojaAtiva) {
    return <Navigate to="/selecionar-loja" />;
  }

  return <div>Conteúdo protegido</div>;
}
```

## API Completa

```typescript
const {
  lojaAtiva,      // ILoja | null — Loja ativa
  carregando,     // boolean — Está carregando?
  erro,           // string | null — Mensagem de erro
  trocarLoja,     // (uuid: string) => void — Trocar loja
  definirLoja,    // (loja: ILoja) => void — Definir loja manualmente
  limparLoja,     // () => void — Limpar loja ativa
} = useLojaAtiva();
```

## Tipos

```typescript
interface ILoja {
  uuid: string;      // UUID único
  nome: string;      // Nome da loja
  slug: string;      // Slug (URL-friendly)
  cnpj: string;      // CNPJ
  ativo: boolean;    // Status
}
```

## Fluxo Automático

O hook **automaticamente**:

1. ✅ Lê cookie `x-loja-uuid` ao montar
2. ✅ Busca loja via API
3. ✅ Armazena no Redux
4. ✅ Persiste em localStorage
5. ✅ Evita requisições desnecessárias

Você não precisa fazer nada além de usar o hook!

## Troubleshooting

### "Nenhuma loja selecionada"

```
1. Verificar se cookie x-loja-uuid existe
   → Abrir DevTools > Application > Cookies
   → Procurar por "x-loja-uuid"

2. Se não existir, o backend não definiu
   → Verificar fluxo de login no backend
```

### "Erro ao carregar loja"

```
1. Verificar status da API
   → Abrir DevTools > Network
   → Procurar por GET /api/loja/tenante/:uuid
   → Verificar status code (200, 401, 403, 404, 500)

2. Se 401: Não autenticado
   → Fazer login novamente

3. Se 403: Sem permissão
   → Verificar permissões no backend

4. Se 404: Loja não encontrada
   → Verificar UUID do cookie
```

### Loja não persiste após reload

```
1. Verificar localStorage
   → Abrir DevTools > Application > Local Storage
   → Procurar por "persist:root"
   → Verificar se contém "loja"

2. Se não existir, redux-persist não está funcionando
   → Verificar se 'loja' está na whitelist em store/index.ts
```

## Próximos Passos

1. **Usar em um componente**
   ```bash
   # Copiar exemplo acima e adaptar para seu caso
   ```

2. **Executar testes**
   ```bash
   npm run cypress:open
   # Selecionar "loja-ativa.cy.ts"
   ```

3. **Ler documentação completa**
   - `README-useLojaAtiva.md` — Guia detalhado
   - `LOJA-INTEGRATION.md` — Comparação com useSeletorLoja

## Dúvidas?

Consulte:
- `README-useLojaAtiva.md` — Documentação completa
- `LOJA-INTEGRATION.md` — Integração com outros hooks
- `web/cypress/e2e/loja-ativa.cy.ts` — Exemplos de testes
- `web/src/components/LojaAtivaIndicador.tsx` — Componente exemplo
