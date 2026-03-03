# 🛠️ Requisitos Funcionais (RFs)

Este documento contém todos os requisitos funcionais do projeto **LES E-commerce 2026**. Toda nova funcionalidade deve ser registrada aqui para rastreabilidade.

> **Como atualizar:** Ao implementar ou alterar uma funcionalidade, atualize a coluna `Status` e a coluna `Evidência no Código`. Use os IDs existentes ou crie novos de forma sequencial.

---

## 📚 Catálogo de Livros

| ID           | Requisito                          | Tipo        | Descrição                                                                                            | Status          | Evidência no Código                                                                       |
| :----------- | :--------------------------------- | :---------- | :--------------------------------------------------------------------------------------------------- | :-------------- | :---------------------------------------------------------------------------------------- |
| **[RF0011]** | Cadastrar livro                    | Obrigatório | Formulário de cadastro com título, autor, ISBN, preço, estoque, categoria e sinopse.                 | ✅ Implementado | `CadastrarLivroAdmin.tsx` — dispara `adicionarLivro` no Redux                             |
| **[RF0012]** | Inativar cadastro de livro         | Obrigatório | Botão para desativar um livro do catálogo sem deletar definitivamente.                               | ✅ Implementado | `ListaLivrosAdmin.tsx` — botão "Desativar" chama `alternarStatusLivro` no `livroSlice.ts` |
| **[RF0013]** | Inativar livro de forma automática | Obrigatório | O sistema deve inativar livros sem estoque e que não possuem venda com valor inferior a parâmetro... | ⏳ Previsto     | -                                                                                         |
| **[RF0014]** | Alterar cadastro de livro          | Obrigatório | Edição de todos os campos do livro cadastrado.                                                       | ⏳ Parcial      | `ListaLivrosAdmin.tsx` — botão "Editar" presente (UI); Redux possui `atualizarLivro`      |
| **[RF0015]** | Consultar livros com filtro        | Obrigatório | Busca por título, autor, ISBN, sinopse e filtro de status Ativo/Inativo.                             | ✅ Implementado | `ListaLivrosAdmin.tsx` — busca em tempo real por múltiplos campos                         |
| **[RF0016]** | Ativar cadastro de livro           | Obrigatório | Botão para reativar um livro previamente desativado.                                                 | ✅ Implementado | `ListaLivrosAdmin.tsx` — botão "Ativar" quando status = Inativo                           |

---

## 👤 Cadastro e Gestão de Clientes

| ID           | Requisito                       | Tipo        | Descrição                                                                                                              | Status          | Evidência no Código                                                                                        |
| :----------- | :------------------------------ | :---------- | :--------------------------------------------------------------------------------------------------------------------- | :-------------- | :--------------------------------------------------------------------------------------------------------- |
| **[RF0021]** | Cadastrar cliente               | Obrigatório | Cadastro completo com wizard de 2 etapas: dados pessoais (Nome, CPF, Email, Gênero, Nascimento, Telefone) + endereços. | ✅ Implementado | `LoginArea.tsx` + `useLoginArea.ts` — wizard com validações CPF, senha forte, endereço cobrança/entrega    |
| **[RF0022]** | Alterar dados do cliente        | Obrigatório | Atualização de dados cadastrais via perfil (Nome, Gênero, Data de Nascimento, Telefone).                               | ✅ Implementado | `MeuPerfil.tsx` + `useMeuPerfil.ts` — aba de dados pessoais editáveis                                      |
| **[RF0023]** | Inativar cadastro de cliente    | Obrigatório | Botão de inativação da conta com modal de confirmação.                                                                 | ✅ Implementado | `MeuPerfil.tsx` — aba "Zona de Perigo" com confirmação; chama `inativarCliente` no `ClienteService`        |
| **[RF0024]** | Consulta de clientes            | Obrigatório | O sistema deve possibilitar que um cliente seja consultado com base em um filtro.                                      | ✅ Implementado | `GestaoClientes.tsx` — layout admin com filtros                                                            |
| **[RF0025]** | Consultar transações do cliente | Obrigatório | Histórico de pedidos com status, datas e detalhes do pedido.                                                           | ⏳ Parcial      | `MeusPedidos.tsx` — 7 pedidos com status variados (Entregue, Em Trânsito, Pendente, Preparando, Devolução) |
| **[RF0026]** | Cadastrar endereços de entrega  | Obrigatório | CRUD completo de endereços na aba "Endereços" do perfil.                                                               | ✅ Implementado | `MeuPerfil.tsx` — aba "Endereços" com formulário e listagem seguindo RN0023                                |
| **[RF0027]** | Cadastrar cartões de crédito    | Obrigatório | CRUD de cartões com seleção de cartão preferencial.                                                                    | ✅ Implementado | `MeuPerfil.tsx` — aba "Cartões" com bandeira, código de segurança e definição de preferencial              |
| **[RF0028]** | Alteração de senha              | Obrigatório | Aba isolada de troca de senha com validação de senha forte.                                                            | ✅ Implementado | `MeuPerfil.tsx` — aba "Segurança" independente dos demais dados pessoais; segue RNF0031                    |

---

## 🛒 Carrinho e Checkout

| ID           | Requisito                                 | Tipo        | Descrição                                                                                                    | Status          | Evidência no Código                                                                    |
| :----------- | :---------------------------------------- | :---------- | :----------------------------------------------------------------------------------------------------------- | :-------------- | :------------------------------------------------------------------------------------- |
| **[RF0031]** | Gerenciar carrinho de compra              | Obrigatório | Adicionar, atualizar quantidade e remover itens do carrinho.                                                 | ✅ Implementado | `Carrinho.tsx` + `carrinhoSlice.ts` — controles completos de CRUD no carrinho          |
| **[RF0032]** | Definir quantidade de itens               | Obrigatório | Input de quantidade por item no carrinho e botões +/- nos cards de produto.                                  | ✅ Implementado | `Carrinho.tsx` — input de quantidade; `ControlesCompra.tsx` — botões `+/-` nos cards   |
| **[RF0033]** | Realizar compra                           | Obrigatório | Fluxo de compra com wizard de 3 etapas: Identificação → Entrega → Pagamento.                                 | ✅ Implementado | `Checkout.tsx` — wizard completo com botão "Concluir Pedido"                           |
| **[RF0034]** | Calcular frete                            | Obrigatório | Opções de frete (Padrão, Expresso, Retirada) com valores e prazos estimados.                                 | ✅ Implementado | `Carrinho.tsx` + `CheckoutService.ts` — campo de CEP e exibição de frete via mock      |
| **[RF0035]** | Selecionar endereço de entrega            | Obrigatório | Cliente seleciona entre endereços cadastrados no perfil para entrega durante o checkout.                     | ✅ Implementado | `Checkout.tsx` — seleção de endereço cadastrado via mock; integra com perfil           |
| **[RF0036]** | Selecionar forma de pagamento             | Obrigatório | Seleção de cartões salvos, novo cartão e aplicação de cupons (troca/promocional). Suporta múltiplos cartões. | ✅ Implementado | `Checkout.tsx` — pagamento parcial com múltiplos cartões + cupons                      |
| **[RF0037]** | Finalizar compra                          | Obrigatório | Compra finalizada com status EM PROCESSAMENTO após validação simulada de pagamento.                          | ✅ Implementado | `Checkout.tsx` — pedido criado no Redux com status "EM_PROCESSAMENTO" após confirmação |
| **[RF0038]** | Despachar produtos para entrega           | Obrigatório | Administrador selecionar vendas para EM TRÂNSITO.                                                            | ✅ Implementado | `GerenciarPedidos.tsx` — despachar                                                     |
| **[RF0039]** | Produtos entregues                        | Obrigatório | Administrador confirmar entrega (ENTREGUE).                                                                  | ✅ Implementado | `GerenciarPedidos.tsx` — entregar                                                      |
| **[RF0040]** | Solicitar troca/devolução                 | Obrigatório | Funcionalidade de solicitação de troca integrada ao histórico de pedidos.                                    | ✅ Implementado | `SolicitarTroca.tsx` — seleção de itens e validação de RN0043                          |
| **[RF0041]** | Autorizar trocas                          | Obrigatório | Administrador autoriza (TROCA AUTORIZADA).                                                                   | ✅ Implementado | `GerenciarTrocas.tsx` e `PedidoService.ts` (`autorizarTroca`)                          |
| **[RF0042]** | Visualização de trocas                    | Obrigatório | Administrador visualiza pedidos EM TROCA.                                                                    | ✅ Implementado | `GerenciarTrocas.tsx` — lista filtrada de pedidos                                      |
| **[RF0043]** | Confirmar recebimento de itens para troca | Obrigatório | Administrador confirma recebimento.                                                                          | ✅ Implementado | `GerenciarTrocas.tsx` — botão e Modal de confirmação                                   |
| **[RF0044]** | Gerar cupom de troca após recebimento     | Obrigatório | Gerar cupom para o cliente.                                                                                  | ✅ Implementado | `PedidoService.ts` (`confirmarRecebimentoTroca`)                                       |

---

## 📦 Estoque e Análise

| ID           | Requisito                     | Tipo        | Descrição                                                                               | Status          | Evidência no Código                                                                                               |
| :----------- | :---------------------------- | :---------- | :-------------------------------------------------------------------------------------- | :-------------- | :---------------------------------------------------------------------------------------------------------------- |
| **[RF0051]** | Realizar entrada em estoque   | Obrigatório | Registro de estoque inicial ao cadastrar livro e entrada administrativa de novos lotes. | ✅ Implementado | `CadastrarLivroAdmin.tsx` — campo "Estoque Inicial"; Redux `adicionarLivro` registra quantidade                   |
| **[RF0052]** | Calcular valor de venda       | Obrigatório | Custo + % margem de lucro.                                                              | ✅ Implementado | `CadastrarLivroAdmin.tsx` — campo `grupoPrecificacao` + `calcularPrecoVenda(custo, grupo)` (read-only automático) |
| **[RF0053]** | Dar baixa em estoque          | Obrigatório | Reduzir itens vendidos.                                                                 | ✅ Implementado | `LivroService.ts` — baixa de estoque                                                                              |
| **[RF0054]** | Realizar reentrada em estoque | Obrigatório | Reentrada na troca se autorizado.                                                       | ✅ Implementado | `GerenciarTrocas.tsx` — checkbox para retornar itens na confirmação                                               |
| **[RF0055]** | Analisar histórico de vendas  | Obrigatório | Visualização gráfica de métricas de receita e volume por período.                       | ✅ Implementado | `DashboardAdmin.tsx` — gráfico de linha (Receita Anual), rosca (Status dos Pedidos) e barras (Vendas/Categoria)   |

---

## 🆕 Novos — Não Previstos no Documento Oficial

| ID           | Requisito                               | Tipo | Descrição                                                                                                                      | Status          | Evidência no Código                                                         |
| :----------- | :-------------------------------------- | :--- | :----------------------------------------------------------------------------------------------------------------------------- | :-------------- | :-------------------------------------------------------------------------- |
| **[RF0056]** | Sincronização entre Abas                | Novo | Redux + Storage Events para atualização em tempo real do estado global entre abas do navegador.                                | ✅ Implementado | `carrinhoSlice.ts` — estado gerenciado no Redux (base para sync entre abas) |
| **[RF0057]** | Dashboard KPIs em Tempo Real            | Novo | Painel de KPIs com total de livros no catálogo, livros com estoque crítico (≤ 5 un) e total de administradores ativos.         | ✅ Implementado | `DashboardAdmin.tsx` — `useAppSelector` para livros e admins                |
| **[RF0058]** | Busca Global Dinâmica no Header         | Novo | Barra de busca no cabeçalho que filtra por título, autor e sinopse em tempo real, com sincronização entre input e Redux Store. | ✅ Implementado | `Header.tsx` + `livroSlice.ts` (`termoBusca`) + `HomeCatalogo.tsx`          |
| **[RF0059]** | Badge Visual de Quantidade no Carrinho  | Novo | Indicador numérico no ícone do carrinho no header e badge na capa do card do produto.                                          | ✅ Implementado | `Header.tsx` + `HomeCatalogo.tsx`                                           |
| **[RF0060]** | Gerenciamento de Administradores (CRUD) | Novo | Interface completa para criar, editar e excluir administradores; exclusiva para admins autenticados.                           | ✅ Implementado | `GerenciarAdmins.tsx` + `useGerenciarAdmins.ts` + `adminSlice.ts`           |
| **[RF0061]** | Rota Protegida por Perfil               | Novo | Sistema de rotas com `ProtectedRoute` que redireciona usuários não autorizados com base em `role` (admin/cliente).             | ✅ Implementado | `ProtectedRoute.tsx` + `App.tsx`                                            |
| **[RF0062]** | Página de Detalhes do Livro             | Novo | Tela dedicada com capa ampliada, avaliação por estrelas, sinopse completa, breadcrumb de categoria e controles de compra.      | ✅ Implementado | `DetalhesLivro.tsx`                                                         |
| **[RF0063]** | Navegação por Categorias                | Novo | Menu de categorias no header navegável por gênero literário (Ficção, Romance, Fantasia, Técnico, etc.).                        | ✅ Implementado | `Header.tsx` — nav secundária com categorias                                |
| **[RF0064]** | Painel de Atividades Recentes           | Novo | Log das últimas atividades do sistema no Dashboard Administrativo.                                                             | ✅ Implementado | `DashboardAdmin.tsx` — seção `atividadesRecentes`                           |
| **[RF0065]** | Visibilidade de Senha (Toggle)          | Novo | Ícone para alternar exibição da senha nos formulários de login, cadastro e perfil.                                             | ✅ Implementado | `LoginArea.tsx` + `MeuPerfil.tsx` — ícone Eye/EyeOff (Lucide React)         |
| **[RF0066]** | Parcelamento no Checkout                | Novo | Compras acima de R$ 80,00 podem ser parceladas sem juros; o número de parcelas varia conforme o valor total.                   | ✅ Implementado | `Checkout.tsx` + `CheckoutService.ts` — lógica de parcelas via RN0069       |
| **[RF0067]** | Meus Pedidos                            | Novo | Listagem dos pedidos do cliente autenticado com status, data, valor e link para detalhes e solicitação de troca.               | ✅ Implementado | `MeusPedidos.tsx` — conectado ao `pedidoSlice.ts` via `clienteUuid`         |

---

> 📌 **Referência cruzada:**
>
> - Regras de Negócio: [`docs/REGRAS-NEGOCIOS.md`](./REGRAS-NEGOCIOS.md)
> - Requisitos Não-Funcionais: [`docs/REQUISITOS-NAO-FUNCIONAIS.md`](./REQUISITOS-NAO-FUNCIONAIS.md)
> - Estimativas PERT: [`docs/ESTIMATIVAS.md`](./ESTIMATIVAS.md)
