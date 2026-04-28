# Project Board — LES Frontend React

> Atualizado em: 28 de abril de 2026  
> Status: Gestão local das atividades do projeto.

---

## Board Kanban

| 📋 Todo (3)                                 | 🔄 In Progress (0)                         | ✅ Done (42)                                            |
| ------------------------------------------- | ------------------------------------------ | ------------------------------------------------------- |
| T3 · [FRONTEND] Reserva Estoque (RN0044/45) |                                            | A1 · [FRONTEND] Configurar GIT e Repositório            |
|                                             |                                            | A2 · [FRONTEND] Configurar Redux para Auth              |
|                                             |                                            | A3 · [BACKEND] Implementar API de Livros                |
|                                             |                                            | A4 · [FRONTEND] Criar Tela de Carrinho                  |
|                                             |                                            | A5 · [FRONTEND] Refatoração Mock Data e Serviços        |
|                                             |                                            | A6 · [FRONTEND] Extrair CSS para Arquivos               |
|                                             |                                            | A7 · [FRONTEND] Design System com Variáveis             |
|                                             |                                            | A8 · [FRONTEND] Adicionar Testes E2E (Cypress)          |
|                                             |                                            | A9 · [FRONTEND] Melhorar Layout Home e Catálogo         |
|                                             |                                            | A10 · [FRONTEND] Responsividade no Footer               |
|                                             |                                            | A11 · [FRONTEND] Componentizar Breadcrumbs              |
|                                             |                                            | A12 · [FRONTEND] Tipagem Forte e Interfaces             |
|                                             |                                            | A13 · [FRONTEND] Gestão de Estado de UI (Loading)       |
|                                             |                                            | A14 · [FRONTEND] Centralizar URLs de Base               |
|                                             |                                            | A15 · [FRONTEND] Governança de Regras e Requisitos      |
|                                             |                                            | A16 · [FRONTEND] Busca Dinâmica e Filtros               |
|                                             |                                            | A17 · [FRONTEND] Refinamento Visual Header              |
|                                             |                                            | A18 · [FRONTEND] Painel Admin e Gestão de Estado        |
|                                             |                                            | A19 · [FRONTEND] Fluxo de Pedidos (RF0038/39)           |
|                                             |                                            | A20 · [FRONTEND] Precificação e Justificativa Status    |
|                                             |                                            | A21 · [FRONTEND] Configuração para API Local            |
|                                             |                                            | A22 · [FRONTEND] Sincronização API Clientes             |
|                                             |                                            | A23 · [FRONTEND] Persistência de Sessão Auth            |
|                                             |                                            | A24 · [FRONTEND] Revarredura Contratos API Auth/Perfil  |
|                                             |                                            | A25 · [BACKEND] Esquema de Dados e Endereços            |
|                                             |                                            | A26 · [BACKEND] Gestão de Cartões e Perfil              |
|                                             |                                            | A27 · [BACKEND] Painel Admin: Listagem e Status          |
|                                             |                                            | A28 · [FRONTEND] Separação Lógica Mock/API              |
|                                             |                                            | A29 · [FRONTEND] Governança: Decomposição Atividades    |
|                                             |                                            | A30 · [FRONTEND] Autorização por Capacidades            |
|                                             |                                            | A31 · [FRONTEND] Estabilização de Testes e UX Perfil    |
|                                             |                                            | A32 · [FRONTEND] Alinhamento Documentação Entrega       |
|                                             |                                            | A33 · [FRONTEND] Atualização de BDD e Governança        |
|                                             |                                            | A36 · [FRONTEND] Otimização da Jornada de Compra        |
|                                             |                                            | A37 · [FRONTEND] Novas Features de Checkout e PIX       |
|                                             |                                            | A38 · [FRONTEND] Módulo de Trocas e Devoluções          |
|                                             |                                            | A39 · [FRONTEND] Segurança: Dados Críticos (RF0077/78)  |
|                                             |                                            | A40 · [FRONTEND] Gestão de Papéis e Promoção Admin      |
|                                             |                                            | A41 · [FRONTEND] Refino do Dashboard e KPIs (RF0057/64) |
|                                             |                                            | A42 · [FRONTEND] Refatoração Lint e Performance React 18 |
|                                             |                                            | A34 · [FRONTEND] Checkout ↔ Intenção (API)              |
|                                             |                                            | A35 · [FRONTEND] Frete ↔ Cotação Checkout               |
|                                             |                                            | A43 · [FRONTEND] Refino Mocks de Pagamento              |
|                                             |                                            | A44 · [FRONTEND] Sandbox de Falhas e Estabilização E2E  |

---

## Detalhamento dos Cards

| Card | Tipo     | Título                                   | Tarefas / Descrição                                                                                                                             |
| ---- | -------- | ---------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| A38  | FRONTEND | Módulo de Trocas e Devoluções          | **Concluído:** Implementação do fluxo completo de trocas no perfil do cliente (`SolicitarTroca`) e painel administrativo (`GerenciarTrocas`). Inclui seleção granular de itens, justificativa obrigatória e geração de cupom de troca (RF0040-RF0044). |
| A39  | FRONTEND | Segurança: Dados Críticos (RF0077/78)  | **Negócio:** Protege a identidade do cliente exigindo re-autenticação para alterações sensíveis (E-mail/CPF) e confirmações explícitas para evitar perda acidental de dados. **Arquivos:** `useMeuPerfil.ts`, `ConfirmacaoSenhaModal.tsx`, `MeuPerfil.tsx`. |
| A40  | FRONTEND | Gestão de Papéis e Promoção Admin      | **Negócio:** Flexibiliza a gestão administrativa permitindo que clientes se tornem gestores sem perder o histórico, com controle de acesso dual por e-mail. **Arquivos:** `GerenciarUsuarios.tsx`, `adminService.ts`, `authSlice.ts`. |
| A41  | FRONTEND | Refino do Dashboard e KPIs (RF0057/64) | **Negócio:** Oferece visão estratégica imediata sobre a saúde do estoque e transparência nas ações do sistema para auditoria. **Arquivos:** `DashboardHome.tsx`, `KpiCard.tsx`, `AtividadeRecenteList.tsx`. |
| A42  | FRONTEND | Refatoração Lint e React 18          | **Negócio:** Garante uma interface fluida e sem travamentos ao eliminar renderizações redundantes, aumentando a retenção do usuário. **Arquivos:** `ANALISE-TECNICA-LINT-REACT.md`, `FreteCalculo.tsx`, `MeusPedidos.tsx`. |
| A43  | FRONTEND | Refino Mocks de Pagamento (In Progress) | **Negócio:** Validação antecipada dos fluxos de pagamento e frete para garantir que as regras de cobrança e prazos sejam respeitadas antes da integração real. **Arquivos:** `pagamentoServiceMock.ts`, `pagamentoMock.json`. |
| A36  | FRONTEND | Otimização da Jornada de Compra          | **Negócio:** Reduz a fricção no checkout e melhora a experiência de acompanhamento pós-venda, impactando diretamente na satisfação do cliente. **Arquivos:** `Checkout.tsx`, `MeusPedidos.tsx`, `meusPedidosHelpers.ts`. |
| A37  | FRONTEND | Novas Features de Checkout e PIX       | **Negócio:** Diversifica as opções de pagamento para aumentar a conversão, incluindo PIX com confirmação dinâmica. **Arquivos:** `CheckoutSplitPagamento.tsx`, `PixPagamento.tsx`. |
| A34  | FRONTEND | Checkout ↔ Intenção (API)              | **Negócio:** Implementa o rastreio financeiro ponta a ponta, vinculando a intenção de gasto à venda final para prevenir fraudes. **Arquivos:** `PagamentoServiceApi.ts`, `checkoutExtracao.ts`. |
| A35  | FRONTEND | Frete ↔ Cotação Checkout               | **Negócio:** Garante que o valor de frete exibido ao cliente seja o mesmo processado na logística, evitando prejuízos operacionais. **Arquivos:** `EntregaServiceApi.ts`, `FreteCalculo.tsx`. |
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
| A15  | FRONTEND | Governança de Regras e Requisitos        | `commit 15053f3` — Atualizar REGRAS-NEGOCIOS.md e registro de mudanças com regra de documentação obrigatória                                   |
| A16  | FRONTEND | Busca Dinâmica e Filtros Avançados       | `commit 1a9351b` — Busca no Header/Home e filtros em ListaLivrosAdmin                                                                           |
| A17  | FRONTEND | Refinamento Visual do Header e Catálogo  | `commit 56aa02a` — Ajustes de padding, alinhamento e consistência visual no layout principal                                                    |
| A18  | FRONTEND | Painel Administrativo e Gestão de Estado | `commit 93c2db6` — AdminLayout, CapaLivro, Slices de Livros/Admin e AuthService com Hooks                                                       |
| A19  | FRONTEND | Fluxo de Pedidos (RF0038/39)             | **Concluído:** Funcionalidades de despachar/entregar pedidos no painel administrativo e visualização de status pelo cliente.                    |
| A20  | FRONTEND | Precificação e Justificativa de Status   | Grupo de precificação com cálculo automático (RN0013, RF0052) + Modal obrigatório de justificativa ao alterar status de livros (RN0015, RN0017) |
| A21  | FRONTEND | Configuração para API Local              | Alterar VITE_USE_MOCK=false e BASE_URL para http://localhost:3000, permitindo uso de dados reais em vez de mocks                                |
| A22  | FRONTEND | Sincronização API Clientes               | Ajuste de rotas, payloads e métodos (PATCH/PUT) e correção de `ReferenceError` na Store do ApiClient                                            |
| A23  | FRONTEND | Persistência de Sessão Auth              | Implementação de `restoreSession` para evitar deslogue indesejado no refresh, mantendo token seguro em cookie/sessão volátil.                   |
| A24  | FRONTEND | Revarredura de Contratos API Auth/Perfil | Sincronização final do frontend com o contrato real do backend para Auth e Perfil (login tolerante, normalização de payload).                   |
| A25  | BACKEND  | Esquema de Dados e Endereços            | Criação de tabelas normalizadas e gestão de múltiplos endereços/telefones por cliente.                                                          |
| A26  | BACKEND  | Gestão de Cartões e Perfil              | Suporte a múltiplos cartões tokenizados e campos expandidos de perfil no banco de dados.                                                        |
| A27  | BACKEND  | Painel Admin: Listagem e Status          | Listagem administrativa de usuários e funcionalidade de ativação/inativação de contas.                                                          |
| A28  | FRONTEND | Separação Lógica Mock/API nos Services  | Refatoração usando Strategy + Factory para isolar implementações Mock e API real, facilitando o desenvolvimento paralelo.                       |
| A29  | FRONTEND | Governança: Decomposição de Atividades | Inclusão de regras de rastreabilidade granular e decomposição obrigatória de atividades complexas.                                             |
| A30  | FRONTEND | Autorização por Capacidades            | Transição para modelo de permissões baseadas em `actions` (PermissionGuard/useAuthorization) para maior flexibilidade.                          |
| A31  | FRONTEND | Estabilização de Testes e UX no Perfil | Injeção de `data-cy`, uso de Page Objects (POM) e modais de confirmação para ações críticas no perfil.                                          |
| A32  | FRONTEND | Alinhamento de Documentação de Entrega | Sincronização final dos requisitos RF/RNF/RN com a implementação técnica atual.                                                                 |
| A33  | FRONTEND | Atualização de BDD e Governança        | Garantia de que os cenários de comportamento reflitam as novas regras de segurança e fluxos de API.                                             |
| A44  | FRONTEND | Sandbox de Falhas e Estabilização E2E  | **Concluído:** Implementação de testes E2E resilientes para cenários de falha (Pagamento Recusado, CEP Inválido) usando injeção determinística de sandbox no backend. |

---

> **Nota:** Este board é mantido localmente e serve como a fonte de verdade para o status das atividades de desenvolvimento.
