# 📊 Estimativa PERT — LES E-commerce 2026

> Estimativa de esforço por atividade utilizando a técnica **PERT** (Program Evaluation and Review Technique).
> Fórmula usada: **E = (O + 4R + P) / 6**, onde O = Otimista, R = Realista, P = Pessimista.
>
> **Legenda de Status:**
>
> - 🟢 **Concluído** — funcionalidade implementada no projeto
> - 🟡 **Em andamento / Parcial** — implementação iniciada, integração pendente
> - 🔴 **Não iniciado** — planejado para próximas sprints

---

## 1. Planejamento e Documentação

| ID  | Atividade                                | Otimista (h) | Realista (h) | Pessimista (h) | Status | Descrição                                                                         |
| :-: | :--------------------------------------- | :----------: | :----------: | :------------: | :----: | :-------------------------------------------------------------------------------- |
|  1  | Levantamento e organização de requisitos |      4       |      8       |       12       |   🟢   | RFs, RNFs e RNs documentados para e-commerce de livros (livraria online)          |
|  2  | Documento de Visão (DVS)                 |      4       |      8       |       12       |   🟢   | DVS baseado no template do professor; escopo, stakeholders e riscos definidos     |
|  3  | Estimativa detalhada                     |      2       |      4       |       6        |   🟢   | Estimativa PERT (otimista / realista / pessimista) por atividade                  |
|  4  | Criação do Kanban                        |      1       |      2       |       3        |   🟢   | Kanban configurado localmente (`PROJECT-BOARD.md`) — colunas To Do / Doing / Done |
|  5  | Preparação de Slides (por entrega)       |      4       |      8       |       12       |   🟢   | Slides da 1ª entrega: tema, tecnologias, requisitos, estimativa e Kanban          |

**Subtotal: O=15h | R=30h | P=45h**

---

## 2. Banco de Dados

| ID  | Atividade                             | Otimista (h) | Realista (h) | Pessimista (h) | Status | Descrição                                                                     |
| :-: | :------------------------------------ | :----------: | :----------: | :------------: | :----: | :---------------------------------------------------------------------------- |
|  1  | Modelagem do banco (DER + regras)     |     3,5      |      7       |      10,5      |   🟡   | DER planejado com entidades: Cliente, Livro, Pedido, Estoque, Cupom, Endereço |
|  2  | Criação das tabelas e migrations      |      3       |      6       |       9        |   🔴   | Não iniciado — mocks JSON usados no frontend até integração com banco real    |
|  3  | Scripts iniciais (categorias, grupos) |      2       |      4       |       6        |   🔴   | Não iniciado — categorias e grupos já definidos nos mocks do frontend         |

**Subtotal: O=8,5h | R=17h | P=25,5h**

---

## 3. Backend

| ID  | Atividade                               | Otimista (h) | Realista (h) | Pessimista (h) | Status | Descrição                                                                      |
| :-: | :-------------------------------------- | :----------: | :----------: | :------------: | :----: | :----------------------------------------------------------------------------- |
|  1  | Configuração do ambiente                |      3       |      6       |       9        |   🔴   | Não iniciado — definido uso de Java/Spring Boot ou Node.js + Express           |
|  2  | Autenticação (login, JWT, criptografia) |     4,5      |      9       |      13,5      |   🔴   | Não iniciado — frontend com `useApi.ts` pronto para consumir endpoint de login |
|  3  | API CRUD Cliente                        |     4,5      |      9       |      13,5      |   🔴   | Não iniciado — interfaces TypeScript do Cliente já definidas no frontend       |
|  4  | API CRUD Produto                        |     4,5      |      9       |      13,5      |   🔴   | Não iniciado — `LivroService.ts` com endpoints mapeados aguardando API real    |
|  5  | Carrinho e Checkout                     |     9,5      |      19      |      28,5      |   🔴   | Não iniciado — `CarrinhoService` e `CheckoutService` criados; aguardam API     |
|  6  | Regras de pagamento e cupons            |     6,5      |      13      |      19,5      |   🔴   | Não iniciado — regras de negócio documentadas nos requisitos                   |
|  7  | Controle de estoque e lote              |      5       |      10      |       15       |   🔴   | Não iniciado — interface `IDashboardAdmin` define estrutura de estoque         |
|  8  | Testes básicos backend                  |     5,5      |      11      |      16,5      |   🔴   | Não iniciado                                                                   |

**Subtotal: O=43h | R=86h | P=129h**

---

## 4. Frontend

| ID  | Atividade                       | Otimista (h) | Realista (h) | Pessimista (h) | Status | Descrição                                                                                                                                                                                                                |
| :-: | :------------------------------ | :----------: | :----------: | :------------: | :----: | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
|  1  | Protótipos (Figma/HTML)         |     4,5      |      9       |      13,5      |   🟢   | Protótipos em React gerados para as principais visões de cliente e dashboard admin. Fluxo principal validado visualmente.                                                                                                |
|  2  | Estrutura base e layout         |     4,5      |      9       |      13,5      |   🟢   | Criados `src/components/comum/` (BaseLayout, Header, Footer, ProtectedRoute). Implementados estados de `ErrorBoundary`, `Empty` e `Loading`.                                                                             |
|  3  | Front CRUD Cliente              |     5,5      |      11      |      16,5      |   🟢   | Login/cadastro (wizard 2 etapas com validação CPF, senha, telefone). Sucesso no cadastro redireciona para Home com auth context.                                                                                         |
|  4  | Front CRUD Produto              |     5,5      |      11      |      16,5      |   🟢   | Falhas: mensagens de erro de validação (CPF inválido, senha fraca) e erro 401 de credenciais inválidas já funcionam. Cenário Feliz: listagem dos livros mockados, busca funcional e admin adiciona novo livro sem erros. |
|  5  | Tela Carrinho e Checkout        |     8,5      |      17      |      25,5      |   🟢   | Cenário Feliz: adiciona itens, calcula total de moedas, preenche frete/cartão, redireciona ao resumo de sucesso. Falha: fechar pedido vazio apresenta mensagem.                                                          |
|  6  | Painel Admin (Pedidos/Estoque)  |     6,5      |      13      |      19,5      |   🟡   | Autenticado, visualiza gráficos de desempenho geral com loading. Falhas: acesso de login e cart. Adequação de cenários de edge cases e mobile (layout responsivo).                                                       |
|  7  | Responsividade e ajustes finais |     6,5      |      13      |      19,5      |   🟡   | Em andamento — ajustes de layout mobile e edge cases identificados nos testes                                                                                                                                            |

**Subtotal: O=41,5h | R=83h | P=124,5h**

---

## 5. Deploy e Integração

| ID  | Atividade                           | Otimista (h) | Realista (h) | Pessimista (h) | Status | Descrição                                                              |
| :-: | :---------------------------------- | :----------: | :----------: | :------------: | :----: | :--------------------------------------------------------------------- |
|  1  | Configuração CI/CD                  |     4,5      |      9       |      13,5      |   🔴   | Não iniciado — Pipeline Automatizado planejado para pipeline de deploy |
|  2  | Deploy (frontend + backend + banco) |      3       |      6       |       9        |   🔴   | Não iniciado — Vercel (frontend) e Railway/Render (backend) planejados |

**Subtotal: O=7,5h | R=15h | P=22,5h**

---

## 📈 Totais Consolidados

| Categoria                   | Otimista (h) | Realista (h) | Pessimista (h) |
| :-------------------------- | :----------: | :----------: | :------------: |
| Planejamento e Documentação |      15      |      30      |       45       |
| Banco de Dados              |     8,5      |      17      |      25,5      |
| Backend                     |      43      |      86      |      129       |
| Frontend                    |     41,5     |      83      |     124,5      |
| Deploy e Integração         |     7,5      |      15      |      22,5      |
| **Total**                   |  **115,5**   |   **231**    |   **346,5**    |

---

## 📋 Como Atualizar Este Arquivo

Este arquivo deve ser atualizado **exclusivamente** com base em alterações nas [Regras de Negócio](./REGRAS-NEGOCIOS.md), [Requisitos Funcionais](./REQUISITOS-FUNCIONAIS.md) ou [Requisitos Não-Funcionais](./REQUISITOS-NAO-FUNCIONAIS.md).

1. **Vincular a Requisito/Regra** → Toda nova estimativa ou alteração de status deve estar diretamente ligada a um ID de RF, RN ou RNF.
2. **Atualizar Status** → Alterar o ícone de status de 🔴 ou 🟡 para 🟢 somente após a implementação completa da regra/requisito.
3. **Refletir no Board** → Após atualizar este arquivo, os detalhes técnicos do que foi feito devem ser registrados em tópicos e subtópicos no card correspondente em [`docs/PROJECT-BOARD.md`](./PROJECT-BOARD.md).
4. **Recalcular Totais** → Ajustar os valores da categoria e a tabela de totais consolidados sempre que houver mudança nas horas.

> 📌 **Referência cruzada:**
>
> - Requisitos Funcionais: [`docs/REQUISITOS-FUNCIONAIS.md`](./REQUISITOS-FUNCIONAIS.md)
> - Requisitos Não-Funcionais: [`docs/REQUISITOS-NAO-FUNCIONAIS.md`](./REQUISITOS-NAO-FUNCIONAIS.md)
> - Regras de Negócio: [`docs/REGRAS-NEGOCIOS.md`](./REGRAS-NEGOCIOS.md)
> - Detalhes do Protótipo: [`prototipo/DETALHES_PROTOTIPO.md`](../prototipo/DETALHES_PROTOTIPO.md)
