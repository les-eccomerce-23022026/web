# 🏗️ Requisitos Não-Funcionais (RNFs)

Este documento contém todos os requisitos não-funcionais do projeto **LES E-commerce 2026**.

> **Como atualizar:** Ao adicionar ou alterar um pilar tecnológico, restrição de desempenho, segurança ou arquitetura, registre aqui com um ID sequencial e evidência no código.

---

## 🔐 Segurança e Autenticação

| ID | Requisito | Tipo | Descrição | Status | Evidência no Código |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **[RNF0031]** | Senha Forte | Obrigatório | Mínimo 8 caracteres, letras maiúsculas/minúsculas, números e caracteres especiais. | ✅ Implementado | `AuthService.ts` + `useLoginArea.ts` — validação de complexidade de senha |
| **[RNF0032]** | Confirmação de Senha | Obrigatório | O usuário deve digitar a senha duas vezes no registro e na alteração. | ✅ Implementado | `LoginArea.tsx` + `MeuPerfil.tsx` (aba Segurança) |
| **[RNF0033]** | Senha Criptografada | Obrigatório | Armazenamento via BCrypt no backend; mock não armazena senha em texto puro. | ⏳ Previsto | `AuthService.ts` — arquitetura preparada para BCrypt; mock usa token local |
| **[RNF0035]** | Código Único de Cliente (UUID) | Obrigatório | Todo cliente recebe um UUID único gerado pelo sistema. | ✅ Implementado | `authUsersMock.json` + `clientesMock.json` — campo `uuid` em todos os perfis |
| **[RNF0037]** | Rota Protegida por Role | Novo | Rotas administrativas e de cliente são protegidas por `ProtectedRoute` com verificação de `role`. | ✅ Implementado | `ProtectedRoute.tsx` — redireciona usuários não autorizados |
| **[RNF0038]** | Zero dados sensíveis no Storage | Novo | Senhas, CVV de cartão e tokens de produção não são armazenados em `localStorage` ou `sessionStorage`. | ✅ Implementado | `AuthService.ts` — tokens mock prefixados; CVV nunca persiste |

---

## 🎨 Interface e Experiência do Usuário


| ID | Requisito | Tipo | Descrição | Status | Evidência no Código |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **[RNF0021]** | Código de livro | Obrigatório | Todo livro cadastrado deve receber um código único no sistema. | ✅ Implementado | `ILivro.ts` — campo `uuid` |
| **[RNF0034]** | Endereços Independentes | Obrigatório | Endereços podem ser adicionados/editados/removidos sem alterar demais dados cadastrais (aba isolada no perfil). | ✅ Implementado | `MeuPerfil.tsx` — aba "Endereços" com CRUD independente. |
| **[RNF0039]** | Zero CSS Inline | Novo | Toda estilização deve seguir o padrão de CSS Modules (`.module.css`). Exceção: props 100% dinâmicas. | ✅ Implementado | Todos os componentes utilizam `styles.className` via CSS Modules |
| **[RNF0040]** | Fluxo Distraction-free no Checkout | Novo | Layout de checkout sem menus de navegação e banners promocionais para foco na conversão. | ✅ Implementado | `Checkout.tsx` — layout limpo sem header de navegação lateral |
| **[RNF0041]** | Feedback de Progresso no Checkout | Novo | Indicador visual de etapas: `1. Identificação → 2. Entrega → 3. Pagamento`. | ✅ Implementado | `Checkout.tsx` — breadcrumb de etapas com estado ativo |
| **[RNF0042]** | Apresentar itens retirados do carrinho | Obrigatório | Apresentar produtos removidos; opção comprar desabilitada. | ⏳ Previsto | - |
| **[RNF0043]** | Gráfico de Linhas (Dashboard) | Obrigatório | Gráfico de linhas para Receita Anual e Vendas por Categoria no dashboard administrativo. | ✅ Implementado | `DashboardAdmin.tsx` — `Line` (Chart.js) |
| **[RNF0044]** | Recomendação com IA Generativa | Obrigatório | IA generativa para recomendações, chatbot e modelo treinado. | ⏳ Previsto | - |
| **[RNF0055]** | Feedback Visual de Estado (Loading/Error/Empty) | Novo | Componentes reutilizáveis para estados assíncronos em todas as telas. | ✅ Implementado | `components/comum/LoadingState`, `ErrorState`, `EmptyState` |

---

## 🏛️ Arquitetura e Qualidade de Código


| ID | Requisito | Tipo | Descrição | Status | Evidência no Código |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **[RNF0011]** | Tempo de resposta para consultas | Obrigatório | Toda consulta de usuário deve ter resposta em no máximo 1 segundo. | ⏳ Previsto | - |
| **[RNF0012]** | Log de transação | Obrigatório | Para toda operação de escrita deve ser registrado data, hora, usuário responsável. | ⏳ Previsto | - |
| **[RNF0013]** | Cadastro de domínios | Obrigatório | Script de implantação do sistema que insere registros de tabelas de domínio. | ⏳ Previsto | - |
| **[RNF0045]** | React 19 com Hooks Modernos | Novo | Uso das funcionalidades modernas do React (hooks, Context API, Suspense) para máxima performance. | ✅ Implementado | Todos os componentes utilizam functional components e hooks |
| **[RNF0046]** | TypeScript 5 com Tipagem Forte | Novo | Rigorosa tipagem no domínio para evitar bugs em tempo de execução. Interfaces definidas por domínio. | ✅ Implementado | `ICliente.ts`, `ILivro.ts`, `IAuth.ts`, `IPedido.ts` — interfaces por domínio |
| **[RNF0047]** | DDD (Domain-Driven Design) | Novo | Organização modular por domínios: `pages/vendas/`, `pages/cadastro_livros/`, `pages/cadastro_clientes/`, `pages/analise/`. | ✅ Implementado | Estrutura de pastas do projeto |
| **[RNF0048]** | Princípios SOLID | Novo | Separação de responsabilidades: serviços, hooks customizados, slices Redux e componentes de UI puros. | ✅ Implementado | `AuthService`, `LivroService`, `ClienteService`, hooks dedicados por página |
| **[RNF0049]** | Estado Global via Redux Toolkit | Novo | Carrinho, autenticação e catálogo gerenciados no Redux Toolkit com `createAsyncThunk` para integração futura com API real. | ✅ Implementado | `carrinhoSlice.ts`, `authSlice.ts`, `livroSlice.ts`, `pedidoSlice.ts` |
| **[RNF0050]** | Camada de Serviços com Toggle Mock/API | Novo | `USE_MOCK` em `apiConfig.ts` permite alternar entre dados mockados e API real sem alterar componentes. | ✅ Implementado | `config/apiConfig.ts` + services (`AuthService`, `LivroService`, `ClienteService`) |
| **[RNF0051]** | Early Return (sem else/else-if) | Novo | Código proibido de usar `else` ou `else if`. Todas as condicionais devem usar retorno antecipado (Guard Clauses). | ✅ Padrão | Todos os hooks e serviços do projeto |
| **[RNF0052]** | Documentação Obrigatória | Novo | Registro compulsório de mudanças em `docs/CHANGES.md`, `docs/REGRAS-NEGOCIOS.md` e requisitos após cada implementação. | ✅ Padrão | `docs/` — todos os arquivos de documentação do projeto |

---

## 🧪 Testes e Qualidade

| ID | Requisito | Tipo | Descrição | Status | Evidência no Código |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **[RNF0053]** | Cypress para Testes E2E | Novo | Cobertura dos fluxos críticos com testes automatizados funcionais (E2E e Componentes). | ⏳ Parcial | `cypress/` — estrutura e config criadas; testes em expansão |
| **[RNF0054]** | Mocks Desacoplados para Testes | Novo | Dados mockados em `src/mocks/*.json` para testes independentes do backend. | ✅ Implementado | `src/mocks/` — mocks para livros, clientes, pedidos, admins |

---

> 📌 **Referência cruzada:**
>
> - Regras de Negócio: [`docs/REGRAS-NEGOCIOS.md`](./REGRAS-NEGOCIOS.md)
> - Requisitos Funcionais: [`docs/REQUISITOS-FUNCIONAIS.md`](./REQUISITOS-FUNCIONAIS.md)
> - Estimativas PERT: [`docs/ESTIMATIVAS.md`](./ESTIMATIVAS.md)
