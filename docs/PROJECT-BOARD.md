# Project Board — LES Frontend React

> Atualizado em: 4 de março de 2026  
> Status: Gestão local das atividades do projeto.

---

## Board Kanban

| 📋 Todo (2)                              | 🔄 In Progress (1)                         | ✅ Done (17)                                            |
| ---------------------------------------- | ------------------------------------------ | ------------------------------------------------------- |
| A3 · [BACKEND] Implementar API de Livros | A2 · [FRONTEND] Configurar Redux para Auth | A1 · [FRONTEND] Configurar GIT e Repositório Remoto     |
| A4 · [FRONTEND] Criar Tela de Carrinho   |                                            | A5 · [FRONTEND] Refatoração do Mock Data e Serviços     |
|                                          |                                            | A6 · [FRONTEND] Extrair CSS para Arquivos               |
|                                          |                                            | A7 · [FRONTEND] Design System com Variáveis CSS         |
|                                          |                                            | A8 · [FRONTEND] Adicionar Testes E2E (Cypress)          |
|                                          |                                            | A9 · [FRONTEND] Melhorar Layout do Home e Catálogo      |
|                                          |                                            | A10 · [FRONTEND] Responsividade no Footer               |
|                                          |                                            | A11 · [FRONTEND] Componentizar Breadcrumbs e Buscador   |
|                                          |                                            | A12 · [FRONTEND] Tipagem Forte e Interfaces             |
|                                          |                                            | A13 · [FRONTEND] Gestão de Estado de UI (Loading/Error) |
|                                          |                                            | A14 · [FRONTEND] Centralizar URLs de Base               |
|                                          |                                            | A15 · [FRONTEND] Governança de Regras e Requisitos      |
|                                          |                                            | A16 · [FRONTEND] Busca Dinâmica e Filtros Avançados     |
|                                          |                                            | A17 · [FRONTEND] Refinamento Visual do Header/Catálogo  |
|                                          |                                            | A18 · [FRONTEND] Painel Administrativo e Estado         |
|                                          |                                            | A19 · [FRONTEND] Gaps Críticos: Pedidos e Clientes      |
|                                          |                                            | A20 · [FRONTEND] Precificação e Justificativa de Status |

---

## Detalhamento dos Cards

| Card | Tipo     | Título                                   | Tarefas / Descrição                                                                                                                             |
| ---- | -------- | ---------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| A1   | FRONTEND | Configurar GIT e Repositório Remoto      | Inicializar git local; vincular ao origin (GitHub); criar branch master; realizar primeiro push                                                 |
| A2   | FRONTEND | Configurar Redux para Autenticação       | Instalar @reduxjs/toolkit e react-redux; configurar Store; criar AuthSlice; integrar com formulário de login                                    |
| A3   | BACKEND  | Implementar API de Livros                | Criar rota GET /livros; implementar busca e filtragem; configurar banco de dados; retornar DTOs formatados                                      |
| A4   | FRONTEND | Criar Tela de Carrinho de Compras        | Desenvolver layout responsivo; listar itens; calcular totais/frete; persistir no Redux/localStorage                                             |
| A5   | FRONTEND | Refatoração do Mock Data e Serviços      | Mudar IDs fixos para UUIDs; criar CarrinhoService e LivroService; aplicar SOLID na tipagem                                                      |
| A6   | FRONTEND | Extrair CSS para Arquivos                | Remover CSS inline de arquivos `.tsx`; criar arquivos `.css` por componente                                                                     |
| A7   | FRONTEND | Design System com Variáveis CSS          | Mapear paleta de cores e espaçamentos no `:root`; aplicar variáveis de cor aos componentes                                                      |
| A8   | FRONTEND | Adicionar Testes E2E (Cypress)           | Configurar spec templates; testar fluxos Home/Catálogo, Carrinho e Listagem de Livros                                                           |
| A9   | FRONTEND | Melhorar Layout do Home e Catálogo       | Alinhar dados e números dos livros; modernizar o look; TDD com Cypress                                                                          |
| A10  | FRONTEND | Implementar Responsividade no Footer     | Layout de duas colunas para mobile; testes E2E Cypress para footer                                                                              |
| A11  | FRONTEND | Componentizar Breadcrumbs e Buscador     | Transformar breadcrumbs em links clicáveis; trocar ícone do buscador e atualizar estilos                                                        |
| A12  | FRONTEND | Tipagem Forte e Interfaces               | Prefixar com `I` as interfaces globais; refatorar propriedades em todo o sistema                                                                |
| A13  | FRONTEND | Gestão de Estado de UI (Loading/Error)   | Implementar UI de Loading e Empty State; ajustar transições entre páginas                                                                       |
| A14  | FRONTEND | Centralizar URLs de Base                 | Mover URLs fixas para constantes/ambiente; criar serviço centralizado de requests                                                               |
| A15  | FRONTEND | Governança de Regras e Requisitos        | `commit 15053f3` — Atualizar REGRAS-NEGOCIOS.md e CHANGES.md com regra de documentação obrigatória                                              |
| A16  | FRONTEND | Busca Dinâmica e Filtros Avançados       | `commit 1a9351b` — Busca no Header/Home e filtros em ListaLivrosAdmin                                                                           |
| A17  | FRONTEND | Refinamento Visual do Header e Catálogo  | `commit 56aa02a` — Ajustes de padding, alinhamento e consistência visual no layout principal                                                    |
| A18  | FRONTEND | Painel Administrativo e Gestão de Estado | `commit 93c2db6` — AdminLayout, CapaLivro, Slices de Livros/Admin e AuthService com Hooks                                                       |
| A19  | FRONTEND | Gaps Críticos: Pedidos e Clientes        | Funcionalidades de despachar/entregar pedidos, com baixa de estoque, e Consulta de Clientes (RF0024-RF0053)                                     |
| A20  | FRONTEND | Precificação e Justificativa de Status   | Grupo de precificação com cálculo automático (RN0013, RF0052) + Modal obrigatório de justificativa ao alterar status de livros (RN0015, RN0017) |
| A21  | FRONTEND | Configuração para API Local              | Alterar VITE_USE_MOCK=false e BASE_URL para http://localhost:3000, permitindo uso de dados reais em vez de mocks                              |

---

> **Nota:** Este board é mantido localmente e serve como a fonte de verdade para o status das atividades de desenvolvimento.
