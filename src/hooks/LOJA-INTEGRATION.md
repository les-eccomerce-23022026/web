# Integração de Gerenciamento de Loja

Este documento explica como usar os dois hooks de loja disponíveis no projeto:

1. **`useLojaAtiva`** — Para clientes (loja ativa persistida)
2. **`useSeletorLoja`** — Para admins (seleção entre múltiplas lojas)

## Diferenças

| Aspecto | useLojaAtiva | useSeletorLoja |
|---------|--------------|----------------|
| **Público-alvo** | Clientes | Admins multi-loja |
| **Armazenamento** | Redux + localStorage | Estado local (useState) |
| **Persistência** | Sim (redux-persist) | Não (recarrega página) |
| **API** | GET /api/loja/tenante/:uuid | GET /api/admin/lojas/minhas-lojas |
| **Cookie** | Lê x-loja-uuid | Lê e escreve x-loja-uuid |
| **Recarregamento** | Não | Sim (window.location.reload) |

## Quando Usar Cada Um

### useLojaAtiva

**Use quando:**
- Você está em uma página de cliente
- A loja já foi selecionada (cookie x-loja-uuid existe)
- Você quer persistir a loja entre navegações
- Você quer usar Redux para gerenciar estado global

**Exemplo:**
```tsx
import { useLojaAtiva } from '@/hooks/useLojaAtiva';

export function PaginaCliente() {
  const { lojaAtiva, carregando, erro } = useLojaAtiva();

  if (carregando) return <div>Carregando...</div>;
  if (erro) return <div>Erro: {erro}</div>;
  if (!lojaAtiva) return <div>Nenhuma loja selecionada</div>;

  return <div>Bem-vindo à {lojaAtiva.nome}</div>;
}
```

### useSeletorLoja

**Use quando:**
- Você está em uma página de admin
- O admin precisa selecionar entre múltiplas lojas
- Você quer listar todas as lojas do admin
- Você quer trocar de loja com recarregamento de página

**Exemplo:**
```tsx
import { useSeletorLoja } from '@/hooks/useSeletorLoja';

export function PainelAdmin() {
  const { lojas, lojaAtual, carregando, erro, trocarLoja } = useSeletorLoja();

  if (carregando) return <div>Carregando...</div>;
  if (erro) return <div>Erro: {erro}</div>;

  return (
    <div>
      <h1>Painel Admin</h1>
      <select value={lojaAtual?.uuid || ''} onChange={(e) => trocarLoja(e.target.value)}>
        {lojas.map((loja) => (
          <option key={loja.uuid} value={loja.uuid}>
            {loja.nome}
          </option>
        ))}
      </select>
    </div>
  );
}
```

## Fluxo de Inicialização

### Cliente (useLojaAtiva)

```
1. Usuário faz login
2. Backend define cookie x-loja-uuid
3. Usuário navega para página cliente
4. useLojaAtiva lê cookie
5. useLojaAtiva busca loja via API
6. Redux armazena loja ativa
7. redux-persist salva em localStorage
8. Componente renderiza com loja ativa
```

### Admin (useSeletorLoja)

```
1. Admin faz login
2. Backend define cookie x-loja-uuid (primeira loja)
3. Admin navega para painel admin
4. useSeletorLoja busca lista de lojas
5. useSeletorLoja lê cookie para loja atual
6. Admin seleciona nova loja
7. useSeletorLoja escreve cookie
8. Página recarrega com nova loja
```

## Integração com Redux

### useLojaAtiva

O hook usa Redux internamente:

```typescript
// Slice: web/src/store/slices/lojaSlice.ts
export const buscarLojaAtiva = createAsyncThunk(...)
export const definirLojaAtiva = (state, action) => { ... }
export const selecionarLojaAtiva = (state) => state.loja.lojaAtiva

// Hook: web/src/hooks/useLojaAtiva.ts
const lojaAtiva = useAppSelector(selecionarLojaAtiva);
const dispatch = useAppDispatch();
dispatch(buscarLojaAtiva(uuid));
```

### useSeletorLoja

O hook não usa Redux (estado local):

```typescript
const [lojas, setLojas] = useState<ILoja[]>([]);
const [lojaAtual, setLojaAtual] = useState<ILoja | null>(null);
```

## Testes

### Testes E2E (useLojaAtiva)

Veja `web/cypress/e2e/loja-ativa.cy.ts`:

```bash
npm run cypress:open
# Selecionar "loja-ativa.cy.ts"
```

### Testes Unitários (lojaSlice)

Veja `web/src/store/slices/__tests__/lojaSlice.test.ts`:

```bash
npm run test -- lojaSlice.test.ts
```

## Segurança

### Cookie x-loja-uuid

- ⚠️ **Definido pelo backend** — Nunca definir no cliente
- ✅ **Validado no backend** — Verificar permissões
- ✅ **Lido pelo cliente** — Para inicializar loja ativa

### API /api/loja/tenante/:uuid

- ✅ **Autenticada** — Requer JWT em cookie HttpOnly
- ✅ **Autorizada** — Backend valida se usuário tem acesso à loja
- ✅ **Validada** — UUID deve ser válido

### API /api/admin/lojas/minhas-lojas

- ✅ **Autenticada** — Requer JWT em cookie HttpOnly
- ✅ **Autorizada** — Retorna apenas lojas do admin
- ✅ **Validada** — Apenas admins podem acessar

## Troubleshooting

### useLojaAtiva

**"Nenhuma loja selecionada"**
- Verificar se cookie x-loja-uuid foi definido pelo backend
- Verificar se a API está retornando dados

**"Erro ao carregar loja"**
- Verificar status da API em GET /api/loja/tenante/:uuid
- Verificar se o UUID é válido
- Verificar permissões no backend

**Loja não persiste após reload**
- Verificar se redux-persist está configurado
- Verificar se localStorage está habilitado
- Verificar se 'loja' está na whitelist de persistência

### useSeletorLoja

**"Erro ao carregar lojas"**
- Verificar status da API em GET /api/admin/lojas/minhas-lojas
- Verificar se usuário é admin
- Verificar permissões no backend

**Página não recarrega ao trocar loja**
- Verificar se window.location.reload() está sendo chamado
- Verificar se há erros no console

## Próximos Passos

- [ ] Criar componente de seletor de loja (dropdown)
- [ ] Adicionar cache de lojas
- [ ] Adicionar validação de permissões no frontend
- [ ] Adicionar analytics de troca de loja
- [ ] Sincronizar estado entre abas (BroadcastChannel)
