# Project Board — LES Frontend React

> Atualizado em: 9 de março de 2026  
> Status: Gestão local das atividades do projeto.

---

## Board Kanban

| 📋 Todo (0)                                 | 🔄 In Progress (0)                         | ✅ Done (29)                                            |
| ------------------------------------------- | ------------------------------------------ | ------------------------------------------------------- |
|                                             |                                            | A1 · [FRONTEND] Configurar GIT e Repositório Remoto     |
|                                             |                                            | A2 · [FRONTEND] Configurar Redux para Auth              |
|                                             |                                            | A3 · [BACKEND] Implementar API de Livros                |
|                                             |                                            | A4 · [FRONTEND] Criar Tela de Carrinho                  |
|                                             |                                            | A5 · [FRONTEND] Refatoração do Mock Data e Serviços     |
|                                             |                                            | A6 · [FRONTEND] Extrair CSS para Arquivos               |
|                                             |                                            | A7 · [FRONTEND] Design System com Variáveis CSS         |
|                                             |                                            | A8 · [FRONTEND] Adicionar Testes E2E (Cypress)          |
|                                             |                                            | A9 · [FRONTEND] Melhorar Layout do Home e Catálogo      |
|                                             |                                            | A10 · [FRONTEND] Responsividade no Footer               |
|                                             |                                            | A11 · [FRONTEND] Componentizar Breadcrumbs e Buscador   |
|                                             |                                            | A12 · [FRONTEND] Tipagem Forte e Interfaces             |
|                                             |                                            | A13 · [FRONTEND] Gestão de Estado de UI (Loading/Error) |
|                                             |                                            | A14 · [FRONTEND] Centralizar URLs de Base               |
|                                             |                                            | A15 · [FRONTEND] Governança de Regras e Requisitos      |
|                                             |                                            | A16 · [FRONTEND] Busca Dinâmica e Filtros Avançados     |
|                                             |                                            | A17 · [FRONTEND] Refinamento Visual do Header/Catálogo  |
|                                             |                                            | A18 · [FRONTEND] Painel Administrativo e Estado         |
|                                             |                                            | A19 · [FRONTEND] Gaps Críticos: Pedidos e Clientes      |
|                                             |                                            | A20 · [FRONTEND] Precificação e Justificativa de Status |
|                                             |                                            | A21 · [FRONTEND] Configuração para API Local            |
|                                             |                                            | A22 · [FRONTEND] Sincronização API Clientes             |
|                                             |                                            | A23 · [FRONTEND] Persistência de Sessão Auth            |
|                                             |                                            | A24 · [FRONTEND] Revarredura de Contratos API Auth/Perfil |
|                                             |                                            | A25 · [BACKEND] Esquema de Dados e Normalização de Endereços |
|                                             |                                            | A26 · [BACKEND] Gestão de Cartões e Perfil Expandido    |
|                                             |                                            | A27 · [BACKEND] Painel Admin: Listagem e Status          |
|                                             |                                            | A28 · [FRONTEND] Separação Lógica Mock/API nos Services  |
|                                             |                                            | A29 · [FRONTEND] Governança: Decomposição de Atividades |

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
| A21  | FRONTEND | Configuração para API Local              | Alterar VITE_USE_MOCK=false e BASE_URL para http://localhost:3000, permitindo uso de dados reais em vez de mocks                                |
| A22  | FRONTEND | Sincronização API Clientes               | Ajuste de rotas, payloads e métodos (PATCH/PUT) e correção de `ReferenceError` na Store do ApiClient                                            |
| A23  | FRONTEND | Persistência de Sessão Auth              | **Contexto:** Estado Redux é in-memory; ao recarregar a página o usuário era deslogado mesmo com token válido. **Arquivos alterados:** `authSlice.ts` · `AuthService.ts` · `apiConfig.ts` · `App.tsx` · `ProtectedRoute.tsx`. **Detalhes:** - `authSlice`: `sessionLoading` (evita redirect prematuro) + `restoreSession` thunk + `loginSuccess`/`logout` salvam e limpam `sessionStorage` - `AuthService.me()`: lê `sessionStorage` (mock) ou chama `GET /auth/me` (real backend via cookie HttpOnly) - `App.tsx`: `dispatch(restoreSession())` antes dos demais fetches - `ProtectedRoute`: retorna `null` enquanto `sessionLoading === true` **Segurança (U7):** token nunca vai para `localStorage`; `sessionStorage` é limpo ao fechar a aba. |
| A24  | FRONTEND | Revarredura de Contratos API Auth/Perfil | **Contexto:** comparação direta entre `backend/exports/test_results.txt` + controladores/serviços do backend e o consumo do frontend. **Arquivos alterados:** `src/interfaces/IAuth.ts` · `src/store/slices/authSlice.ts` · `src/services/AuthService.ts` · `src/services/ClienteService.ts` · `src/pages/cadastro_clientes/MeuPerfil/useMeuPerfil.ts` · `src/pages/cadastro_clientes/MeuPerfil/MeuPerfil.tsx` · `cypress/e2e/auth/auth_registro_crud.cy.ts` · `docs/API-CLIENT-SPEC.md`. **Detalhes:** - login agora tolera ausência de `cpf` e de `token` no corpo, priorizando cookie HttpOnly - restauração de sessão faz fallback para snapshot do `user` sem persistir JWT em storage - perfil do cliente é normalizado quando o backend retorna payload parcial - atualização de perfil foi alinhada de `PUT` para `PATCH` - teste Cypress e documentação da API foram sincronizados com o contrato real observado no backend. |

---

> **Nota:** Este board é mantido localmente e serve como a fonte de verdade para o status das atividades de desenvolvimento.
| A25 | BACKEND | Esquema de Dados e Normalização de Endereços | **Contexto:** Necessidade de normalizar endereços e telefones para múltiplos registros por cliente. `commits cb2b2be, babeaed`. **Detalhes:** - Criação de tabelas `ecm_perfil_cliente`, `ecm_telefone_usuario` e `ecm_endereco_usuario`. - Normalização geográfica com tabelas de Cidade, Bairro, País, CEP e Logradouro. - Implementação de seeds para estados brasileiros e tipos de endereço. |
| A26 | BACKEND | Gestão de Cartões e Perfil Expandido | **Contexto:** Suporte a múltiplos cartões e dados de perfil (gênero, data nascimento). `commits cb2b2be, c6019be`. **Detalhes:** - Criação de tabelas `ecm_bandeira_cartao` e `ecm_cartao_usuario`. - Implementação de Repository, Service e Controller para Cartão. - Padronização de DTOs para camelCase e uso de PATCH para atualizações parciais. |
| A27 | BACKEND | Painel Admin: Listagem e Status | **Contexto:** Funcionalidades de governança administrativa de usuários. `commit 1ae9b12`. **Detalhes:** - Implementação de listagem de administradores com filtros. - Funcionalidade de ativação/inativação (soft delete) de contas administrativas. - Atualização de DTOs de resposta e testes de integração de fluxo admin. |
| A28 | FRONTEND | Separação Lógica Mock/API nos Services | **Contexto:** As implementações mock e real estavam misturadas nos mesmos arquivos de serviço com `if (USE_MOCK)` espalhados, dificultando manutenção e desenvolvimento paralelo. **Arquivos criados:** `src/services/contracts/I*.ts` (8 interfaces de contrato) · `src/services/mock/*ServiceMock.ts` (8 implementações mock) · `src/services/api/*ServiceApi.ts` (8 implementações reais) · **Arquivos atualizados:** `src/services/*Service.ts` (8 factories) · `src/config/apiConfig.ts`. **Detalhes:** - Padrão Strategy + Factory: interfaces TypeScript definem o contrato, duas implementações concretas (Mock e Api) atendem o contrato sem se conhecer. - Factories nos arquivos raiz (`AuthService.ts`, `LivroService.ts`, etc.) encapsulam a selection via `VITE_USE_MOCK`. - Chamadores (hooks, slices, pages) **não precisaram de nenhuma mudança** — a API de uso é idêntica. - `apiConfig.ts` corrigido: `throw` só ocorre quando `USE_MOCK=false` e `BASE_URL` está ausente (modo mock não requer backend configurado). - `tsc --noEmit` sem erros após a refatoração. |
| A29 | FRONTEND | Governança: Decomposição de Atividades | **Contexto:** Necessidade de garantir rastreabilidade granular de tarefas complexas através de sua quebra em sub-etapas. **Arquivos alterados:** `AGENTS.md`, `SKILL.md` (business-rules), `ESTIMATIVAS.md`, `REGRAS-NEGOCIOS.md`, `REQUISITOS-FUNCIONAIS.md`, `REQUISITOS-NAO-FUNCIONAIS.md`. **Detalhes:** - Inclusão da Regra Universal **U10** em `AGENTS.md`. - Atualização da skill `business-rules-requirements` com processo de decomposição obrigatória. - Padronização dos cabeçalhos dos documentos em `/entregas/docs/` instruindo sobre a quebra de linhas para atividades complexas. |
