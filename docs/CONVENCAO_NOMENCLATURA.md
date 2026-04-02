# Convenção de nomenclatura (frontend `web/`)

**Data de adoção:** 2026-04-02

## Glossário ubíquo (código em português)

| Decisão | Termo no código |
|---------|-----------------|
| Tela inicial do catálogo | `CatalogoLivros` (antes `HomeCatalogo`) |
| Login e cadastro de cliente | `AutenticacaoCliente` (antes `LoginArea`) |
| Fechamento da compra (fluxo) | `FinalizarCompra` (antes `Checkout` em páginas) |
| Painel administrativo (pastas) | `PainelAdmin` (antes `analise`, depois `painel_admin`) |
| Hook do fluxo de fechamento | `useFinalizarCompra` (antes `useCheckout`) |

## Exceções

- **URLs** (`/checkout`, `/minha-conta`, etc.) permanecem por compatibilidade.

## Pastas em `pages/` e `components/`

- Nomes de **diretórios** em **PascalCase** (ex.: `CadastroLivros/`, `Vendas/`, `Comum/`, `FinalizarCompra/Entrega/`).
- Pastas raiz em `src/` (`hooks/`, `utils/`, `services/`, etc.) permanecem em **minúsculas**.

## Componentes compartilhados do fluxo de fechamento

- Pasta **`components/FinalizarCompra/`** com **`Entrega/`** (endereço, frete) e **`Pagamento/`** (cartão, cupom, etc.) — UI reutilizável alinhada ao glossário `FinalizarCompra`. Classes CSS e `data-cy` podem ainda usar o prefixo `checkout-*` por estabilidade de testes.

## Padrão

- Pastas em `src/pages/` refletem **contexto delimitado** em PascalCase (`Vendas/`, `CadastroLivros/`, `CadastroClientes/`, `PainelAdmin/`).
- Componentes de página: ficheiros **`.tsx`** em **PascalCase**; utilitários **`.ts`**: **camelCase**.
- Em `src/interfaces/` e `src/services/` (incl. `api/`, `contracts/`, `mock/`), ficheiros **`.ts`** em **camelCase** (ex.: `auth.ts`, `pagamentoServiceApi.ts`, `authService.ts`). Os tipos exportados podem manter prefixo `I` no nome do símbolo (`IAuth`, `IPagamento`, etc.).

## Caminhos principais (após refatoração)

| Página / hook | Caminho |
|---------------|---------|
| `CatalogoLivros` | `src/pages/CadastroLivros/CatalogoLivros/CatalogoLivros.tsx` |
| `AutenticacaoCliente` | `src/pages/CadastroClientes/AutenticacaoCliente/AutenticacaoCliente.tsx` |
| `useAutenticacaoCliente` | `src/pages/CadastroClientes/AutenticacaoCliente/useAutenticacaoCliente.ts` |
| `FinalizarCompra` | `src/pages/Vendas/FinalizarCompra/FinalizarCompra.tsx` |
| `useFinalizarCompra` | `src/hooks/useFinalizarCompra.ts` |
| UI entrega / pagamento (compartilhada) | `src/components/FinalizarCompra/Entrega/`, `.../Pagamento/` |
| `PagamentoRedirecionaFinalizarCompra` | `src/pages/Vendas/Pagamento/Pagamento.tsx` |
| Painel admin | `src/pages/PainelAdmin/` |
