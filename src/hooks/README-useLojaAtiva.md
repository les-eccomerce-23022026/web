# Hook useLojaAtiva

## Descrição

Hook customizado para gerenciar a loja ativa (tenante) no e-commerce. Responsável por:

- Ler o cookie `x-loja-uuid` ao inicializar
- Buscar dados da loja via API (`GET /api/loja/tenante/:loj_uuid`)
- Armazenar loja ativa no Redux
- Fornecer métodos para trocar loja
- Fornecer seletores para obter loja ativa

## Uso

### Básico

```tsx
import { useLojaAtiva } from '@/hooks/useLojaAtiva';

export function MeuComponente() {
  const { lojaAtiva, carregando, erro } = useLojaAtiva();

  if (carregando) return <div>Carregando...</div>;
  if (erro) return <div>Erro: {erro}</div>;
  if (!lojaAtiva) return <div>Nenhuma loja selecionada</div>;

  return <div>Loja: {lojaAtiva.nome}</div>;
}
```

### Com troca de loja

```tsx
export function SeletorLoja() {
  const { lojaAtiva, trocarLoja } = useLojaAtiva();

  const handleTrocarLoja = (novoUuid: string) => {
    trocarLoja(novoUuid);
  };

  return (
    <div>
      <p>Loja atual: {lojaAtiva?.nome}</p>
      <button onClick={() => handleTrocarLoja('novo-uuid')}>
        Trocar Loja
      </button>
    </div>
  );
}
```

## API do Hook

### Retorno

```typescript
{
  lojaAtiva: ILoja | null;        // Loja ativa ou null
  carregando: boolean;             // Estado de carregamento
  erro: string | null;             // Mensagem de erro ou null
  trocarLoja: (uuid: string) => void;  // Função para trocar loja
  definirLoja: (loja: ILoja) => void;  // Função para definir loja manualmente
  limparLoja: () => void;          // Função para limpar loja ativa
}
```

### ILoja

```typescript
interface ILoja {
  uuid: string;      // UUID único da loja
  nome: string;      // Nome da loja
  slug: string;      // Slug da loja (URL-friendly)
  cnpj: string;      // CNPJ da loja
  ativo: boolean;    // Status da loja
}
```

## Fluxo de Inicialização

1. **Componente monta** → Hook é executado
2. **Lê cookie `x-loja-uuid`** → Se não existir, retorna null
3. **Valida se loja já está carregada** → Se sim, retorna (evita requisição desnecessária)
4. **Busca loja via API** → `GET /api/loja/tenante/:loj_uuid`
5. **Armazena no Redux** → Estado `loja.lojaAtiva`
6. **Persiste em localStorage** → Via redux-persist

## Integração com Redux

### Slice: `lojaSlice.ts`

- **State**: `{ lojaAtiva, carregando, erro }`
- **Actions**: `definirLojaAtiva`, `limparLojaAtiva`, `definirErroLoja`
- **Thunks**: `buscarLojaAtiva`
- **Seletores**: `selecionarLojaAtiva`, `selecionarCarregandoLoja`, `selecionarErroLoja`

### Store

O slice está registrado em `web/src/store/index.ts`:

```typescript
const rootReducer = combineReducers({
  // ... outros reducers
  loja: lojaReducer,
});
```

A loja é persistida via `redux-persist`:

```typescript
whitelist: ['carrinho', 'cotacaoFrete', 'cliente', 'loja'],
```

## Testes E2E

Veja `web/cypress/e2e/loja-ativa.cy.ts` para exemplos de testes.

### Casos de teste cobertos

- ✅ Carregar loja ao encontrar cookie `x-loja-uuid`
- ✅ Não fazer requisição se cookie não existir
- ✅ Exibir erro ao falhar na busca
- ✅ Trocar loja
- ✅ Persistir loja no localStorage
- ✅ Estados de carregamento

## Segurança

- ⚠️ **Cookie `x-loja-uuid`**: Deve ser definido pelo backend (não pelo cliente)
- ⚠️ **API `/api/loja/tenante/:loj_uuid`**: Deve validar permissões no backend
- ✅ **Dados sensíveis**: Não armazenar em localStorage (apenas loja pública)

## Exemplos de Componentes

### LojaAtivaIndicador

Componente que exibe a loja ativa. Veja `web/src/components/LojaAtivaIndicador.tsx`.

```tsx
import { LojaAtivaIndicador } from '@/components/LojaAtivaIndicador';

export function Header() {
  return (
    <header>
      <LojaAtivaIndicador />
    </header>
  );
}
```

## Troubleshooting

### "Nenhuma loja selecionada"

- Verificar se o cookie `x-loja-uuid` está sendo definido pelo backend
- Verificar se a API está retornando dados corretos
- Verificar console para erros de rede

### "Erro ao carregar loja"

- Verificar status da API em `GET /api/loja/tenante/:loj_uuid`
- Verificar se o UUID é válido
- Verificar permissões no backend

### Loja não persiste após reload

- Verificar se `redux-persist` está configurado corretamente
- Verificar se localStorage está habilitado no navegador
- Verificar se a loja está na whitelist de persistência

## Próximos Passos

- [ ] Criar componente de seletor de loja (dropdown)
- [ ] Adicionar cache de lojas (lista de lojas disponíveis)
- [ ] Adicionar validação de permissões no frontend
- [ ] Adicionar analytics de troca de loja
