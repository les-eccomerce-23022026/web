# Relatório Geral de Desenvolvimento

**Projeto:** LES E-commerce 2026

---

## 1. Tema e Identidade Visual

**Livraria Online Premium (Inspirada na Barnes & Noble)**
Interface sofisticada que combina a estética de uma livraria tradicional com a modernidade de um e-commerce de alta performance. Foco em legibilidade, identidade visual baseada em tons de Verde Floresta (`#0F4C3A`) e Off-white (`#FDFBF7`).

---

## 2. Stack Tecnológica

- **Frontend:** React 19 (Hooks, Context API) & Vite 7
- **Linguagem:** TypeScript 5 (Tipagem Forte e Escalabilidade)
- **Estado Global:** Redux Toolkit (Gerenciamento centralizado de fluxos)
- **Roteamento:** React Router Dom 7 (Navegação SPA fluida)
- **Estilização:** CSS Modules (padrão BEM, escopo isolado, zero CSS inline)
- **Visualização de Dados:** Chart.js & React-Chartjs-2 (Dashboards Analytics)
- **Ícones:** Lucide React (Biblioteca de vetores leves e modernos)
- **Testes:** Cypress 15 (E2E e Testes de Componentes determinísticos)

---

## 3. Mapeamento de Requisitos — Implementados vs. Novos

> As tabelas abaixo cruzam o documento oficial de requisitos da disciplina com o que foi efetivamente construído no protótipo React. Itens marcados como **✅ Implementado** existem no código. Itens marcados como **🆕 Novo** são funcionalidades adicionadas no protótipo que **não constam** no documento oficial.

---

### 3.1 Requisitos Funcionais (RF)

#### 3.1.1 Implementados — Previstos no Documento Oficial

| ID         | Nome                                    | Status          | Evidência no Código                                                                                                                               |
| :--------- | :-------------------------------------- | :-------------- | :------------------------------------------------------------------------------------------------------------------------------------------------ |
| **RF0011** | Cadastrar livro                         | ✅ Implementado | `CadastrarLivroAdmin.tsx` — formulário de cadastro com título, autor, ISBN, preço, estoque, categoria, sinopse; dispara `adicionarLivro` no Redux |
| **RF0012** | Inativar cadastro de livro              | ✅ Implementado | `ListaLivrosAdmin.tsx` — botão "Desativar" chama `alternarStatusLivro` no `livroSlice.ts`                                                         |
| **RF0014** | Alterar cadastro de livro               | ✅ Parcial      | `ListaLivrosAdmin.tsx` — botão "Editar" presente (UI); Redux possui `atualizarLivro`                                                              |
| **RF0015** | Consulta de livros com filtro           | ✅ Implementado | `ListaLivrosAdmin.tsx` — busca por título, autor, ISBN, sinopse + filtro de status                                                                |
| **RF0016** | Ativar cadastro de livro                | ✅ Implementado | `ListaLivrosAdmin.tsx` — botão "Ativar" quando status = Inativo                                                                                   |
| **RF0021** | Cadastrar cliente                       | ✅ Implementado | `LoginArea.tsx` — formulário de registro com nome, CPF, e-mail, senha e confirmação de senha                                                      |
| **RF0022** | Alterar dados do cliente                | ✅ Implementado | `MeuPerfil.tsx` — formulário de atualização de dados cadastrais                                                                                   |
| **RF0023** | Inativar cadastro de cliente            | ✅ Implementado | `MeuPerfil.tsx` — "Solicitar Exclusão da Conta" com confirmação; chama DELETE na API                                                              |
| **RF0025** | Consulta de transações do cliente       | ✅ Parcial      | `pedidosMock.json` — 7 pedidos com diferentes status (Entregue, Em Trânsito, Pendentes, Preparando, Devoluções)                                   |
| **RF0026** | Cadastro de endereços de entrega        | ✅ Parcial      | `Checkout.tsx` — exibe endereço e possui link "Alterar endereço"                                                                                  |
| **RF0028** | Alteração apenas de senha               | ✅ Implementado | `MeuPerfil.tsx` — seção "Alterar Senha" independente dos demais dados                                                                             |
| **RF0031** | Gerenciar carrinho de compra            | ✅ Implementado | `Carrinho.tsx` + `carrinhoSlice.ts` — adicionar, atualizar quantidade, remover itens                                                              |
| **RF0032** | Definir quantidade de itens no carrinho | ✅ Implementado | `Carrinho.tsx` — input de quantidade por item; `ControlesCompra.tsx` — botões `+/-` nos cards                                                     |
| **RF0033** | Realizar compra                         | ✅ Parcial      | `Checkout.tsx` — botão "Concluir Pedido" presente (mock)                                                                                          |
| **RF0034** | Calcular frete                          | ✅ Parcial      | `Carrinho.tsx` — campo de CEP e exibição de frete padrão via mock                                                                                 |
| **RF0035** | Selecionar endereço de entrega          | ✅ Parcial      | `Checkout.tsx` — endereço de entrega exibido via mock                                                                                             |
| **RF0036** | Selecionar forma de pagamento           | ✅ Implementado | `Checkout.tsx` — seleção de cartões salvos, novo cartão, cupons de troca/promocional e pagamento parcial com múltiplos cartões                    |
| **RF0040** | Solicitar troca                         | ✅ Parcial      | `pedidosMock.json` — pedido com status "Devoluções" presente no mock                                                                              |
| **RF0051** | Realizar entrada em estoque             | ✅ Implementado | `CadastrarLivroAdmin.tsx` — campo "Estoque Inicial"; Redux `adicionarLivro` registra a quantidade                                                 |
| **RF0055** | Analisar histórico de vendas            | ✅ Implementado | `DashboardAdmin.tsx` — gráfico de linha (Receita Anual), gráfico de rosca (Status dos Pedidos) e gráfico de vendas por categoria                  |

#### 3.1.2 Novos — Não Previstos no Documento Oficial

| ID         | Nome                                      | Descrição                                                                                                                                                | Evidência no Código                                                |
| :--------- | :---------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------- | :----------------------------------------------------------------- |
| **RF0056** | Sincronização entre Abas                  | Redux + Storage Events para atualização em tempo real do estado global entre abas do navegador                                                           | `carrinhoSlice.ts` — estado gerenciado no Redux (base para sync)   |
| **RF0057** | Dashboard KPIs em Tempo Real              | Painel de KPIs interligado ao estado Redux exibindo: total de livros no catálogo, livros com estoque crítico (≤ 5 un) e total de administradores ativos  | `DashboardAdmin.tsx` — `useAppSelector` para livros e admins       |
| **RF0058** | Busca Global Dinâmica no Header           | Barra de busca no cabeçalho que filtra por título, autor e sinopse em tempo real, com sincronização entre o input e o Redux Store                        | `Header.tsx` + `livroSlice.ts` (`termoBusca`) + `HomeCatalogo.tsx` |
| **RF0059** | Badge Visual de Quantidade no Carrinho    | Indicador numérico no ícone do carrinho no header e badge na capa do card do produto mostrando a quantidade em tempo real                                | `Header.tsx` + `HomeCatalogo.tsx`                                  |
| **RF0060** | Gerenciamento de Administradores (CRUD)   | Interface completa para criar, editar e excluir administradores do sistema, com modais de confirmação, exclusiva para admins autenticados                | `GerenciarAdmins.tsx` + `useGerenciarAdmins.ts` + `adminSlice.ts`  |
| **RF0061** | Rota Protegida por Perfil (Admin/Cliente) | Sistema de rotas com `ProtectedRoute` que redireciona usuários não autorizados com base em `role` (admin/cliente)                                        | `ProtectedRoute.tsx` + `App.tsx`                                   |
| **RF0062** | Página de Detalhes do Livro               | Tela dedicada com capa ampliada, avaliação por estrelas, número de avaliações, sinopse completa, breadcrumb de categoria navegável e controles de compra | `DetalhesLivro.tsx`                                                |
| **RF0063** | Navegação por Categorias                  | Menu de categorias no header navegável por gênero literário (Ficção, Romance, Fantasia, Técnico, etc.)                                                   | `Header.tsx` — nav secundária                                      |
| **RF0064** | Painel de Atividades Recentes             | Log de últimas atividades do sistema no Dashboard Administrativo                                                                                         | `DashboardAdmin.tsx` — `atividadesRecentes`                        |

---

### 3.2 Requisitos Não Funcionais (RNF)

#### 3.2.1 Implementados — Previstos no Documento Oficial

| ID          | Nome                 | Status          | Evidência no Código                                                                |
| :---------- | :------------------- | :-------------- | :--------------------------------------------------------------------------------- |
| **RNF0031** | Senha Forte          | ✅ Implementado | `AuthService.ts` + `useLoginArea.ts` — validação de complexidade de senha          |
| **RNF0032** | Confirmação de Senha | ✅ Implementado | `LoginArea.tsx` — campos "Senha" e "Confirmar Senha" no registro                   |
| **RNF0033** | Senha Criptografada  | ✅ Previsto     | Arquitetura preparada para BCrypt no backend; mock não armazena senha em produção  |
| **RNF0043** | Gráfico de Linhas    | ✅ Implementado | `DashboardAdmin.tsx` — `Line` (Chart.js) para Receita Anual e Vendas por Categoria |

#### 3.2.2 Novos — Não Previstos no Documento Oficial

| ID          | Nome                                            | Descrição                                                                                                                                                                 | Evidência no Código                                   |
| :---------- | :---------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | :---------------------------------------------------- |
| **RNF0045** | Fluxo Distraction-free no Checkout              | Layout de checkout sem menus e banners promocionais para foco total na conversão                                                                                          | `Checkout.tsx` — layout limpo sem header de navegação |
| **RNF0046** | Feedback de Progresso no Checkout               | Indicador visual de etapas: `1. Identificação → 2. Entrega → 3. Pagamento`                                                                                                | `Checkout.tsx` — breadcrumb de etapas                 |
| **RNF0047** | DDD (Domain-Driven Design)                      | Organização modular por domínios: `pages/vendas/`, `pages/cadastro_livros/`, `pages/cadastro_clientes/`, `pages/analise/`                                                 | Estrutura de pastas do projeto                        |
| **RNF0048** | Princípios SOLID                                | Separação de responsabilidades: serviços (`AuthService`, `LivroService`), hooks customizados (`useCheckout`, `useDashboardAdmin`), slices Redux e componentes de UI puros | Toda a arquitetura do projeto                         |
| **RNF0049** | Estado Global Persistente via Redux             | Carrinho e autenticação gerenciados no Redux Toolkit com `createAsyncThunk` para integração futura com API real                                                           | `carrinhoSlice.ts`, `authSlice.ts`, `livroSlice.ts`   |
| **RNF0050** | Camada de Serviços com Toggle Mock/API          | `USE_MOCK` em `apiConfig.ts` permite alternar entre dados mockados e API real sem alterar componentes                                                                     | `config/apiConfig.ts` + services                      |
| **RNF0051** | Feedback Visual de Estado (Loading/Error/Empty) | Componentes reutilizáveis `LoadingState`, `ErrorState`, `EmptyState` para todas as telas assíncronas                                                                      | `components/comum/`                                   |

---

### 3.3 Regras de Negócio (RN)

#### 3.3.1 Implementadas — Previstas no Documento Oficial

| ID         | Nome                          | Status          | Evidência no Código                                                                                                       |
| :--------- | :---------------------------- | :-------------- | :------------------------------------------------------------------------------------------------------------------------ |
| **RN0026** | Dados obrigatórios do cliente | ✅ Implementado | `LoginArea.tsx` — coleta Nome, CPF, E-mail, Senha; arquitetura inclui Gênero, Data de Nascimento e Telefone para extensão |
| **RN0031** | Estoque no carrinho           | ✅ Parcial      | `carrinhoSlice.ts` — lógica de adição verifica item já existente e acumula quantidade                                     |
| **RN0033** | Cupom promocional             | ✅ Implementado | `Checkout.tsx` — campo de cupom (troca/promocional) com botão "Aplicar"                                                   |
| **RN0034** | Cartões de crédito múltiplos  | ✅ Implementado | `Checkout.tsx` — campo "Pagar valor parcial com este cartão (Múltiplos Cartões)"                                          |

#### 3.3.2 Novas — Não Previstas no Documento Oficial

| ID         | Nome                             | Descrição                                                                                                                            | Evidência no Código                                                            |
| :--------- | :------------------------------- | :----------------------------------------------------------------------------------------------------------------------------------- | :----------------------------------------------------------------------------- |
| **RN0065** | Restrição de Criação de Admin    | Apenas um administrador autenticado pode criar outro; não existe rota pública para cadastro de admin                                 | `GerenciarAdmins.tsx` — acesso via `ProtectedRoute` com `requiredRole="admin"` |
| **RN0066** | Indicador de Estoque Crítico     | Livros com estoque ≤ 5 unidades são sinalizados com badge visual diferenciado na lista administrativa e contados no KPI do Dashboard | `ListaLivrosAdmin.tsx` + `DashboardAdmin.tsx`                                  |
| **RN0067** | Recalculo Automático do Carrinho | A cada adição, remoção ou alteração de quantidade, o subtotal, total e frete são recalculados automaticamente pelo Redux             | `carrinhoSlice.ts` — recalcula `resumo` em todos os reducers                   |
| **RN0068** | Avaliação por Estrelas           | Os livros possuem avaliação (1-5 estrelas) e número de avaliações exibidos na página de detalhes e no catálogo                       | `DetalhesLivro.tsx` + `HomeCatalogo.tsx`                                       |

---

## 4. Repositórios e Gestão

**Repositório Público do Protótipo:**
[https://github.com/les-eccomerce-23022026/web](https://github.com/les-eccomerce-23022026/web)

**Gestão do Projeto (Kanban):**
[https://github.com/orgs/les-eccomerce-23022026/projects/1](https://github.com/orgs/les-eccomerce-23022026/projects/1)
