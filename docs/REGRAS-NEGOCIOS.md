# 🛡️ Regras de Negócio (RNs)

Este documento contém todas as regras de negócio do projeto **LES E-commerce 2026**. Toda nova regra deve ser registrada aqui com seu respectivo ID e descrição.

> **Como atualizar:** Ao implementar ou alterar uma lógica de negócio, validação ou restrição de fluxo, registre aqui com ID sequencial, status e evidência no código.

---

## 👤 Cadastro de Cliente

| ID           | Regra                            | Tipo        | Descrição                                                                                                              | Status          | Evidência no Código                                                                |
| :----------- | :------------------------------- | :---------- | :--------------------------------------------------------------------------------------------------------------------- | :-------------- | :--------------------------------------------------------------------------------- |
| **[RN0021]** | Endereço de Cobrança Obrigatório | Obrigatório | Todo cliente deve ter ao menos um endereço de cobrança no cadastro.                                                    | ✅ Implementado | `useLoginArea.ts` — validação na etapa 2 do wizard de cadastro                     |
| **[RN0022]** | Endereço de Entrega Obrigatório  | Obrigatório | Todo cliente deve ter ao menos um endereço de entrega no cadastro.                                                     | ✅ Implementado | `useLoginArea.ts` — checkbox "usar mesmo endereço" cria ambos automaticamente      |
| **[RN0023]** | Composição de Endereços          | Obrigatório | Endereço composto por: Tipo Residência, Tipo Logradouro, Logradouro, Número, Complemento, Bairro, CEP, Cidade, Estado. | ✅ Implementado | `IEnderecoCliente` em `ICliente.ts`                                                |
| **[RN0024]** | Registro de Cartões              | Obrigatório | Cartão composto por: Nº do Cartão, Nome Impresso, Bandeira, Data de Validade, Código de Segurança.                     | ✅ Implementado | `ICartaoCredito` em `ICliente.ts`                                                  |
| **[RN0025]** | Bandeiras Permitidas             | Obrigatório | Bandeiras válidas: Visa, Mastercard, Elo, American Express, Hipercard.                                                 | ✅ Implementado | `clientesMock.json` + `Checkout.tsx` — validação visual por bandeira               |
| **[RN0026]** | Dados Obrigatórios no Cadastro   | Obrigatório | Coleta padronizada de: Nome, CPF, Email, Gênero, Data de Nascimento e Telefone.                                        | ✅ Implementado | `LoginArea.tsx` + `useLoginArea.ts` — campos obrigatórios com validação de formato |
| **[RN0027]** | Ranking de cliente               | Obrigatório | O cliente recebe um ranking numérico com base no seu perfil de compra.                                                 | ⏳ Previsto     | -                                                                                  |
| **[RN0028]** | Validação da operadora           | Obrigatório | Baixa no estoque apenas após efetivação da compra (Status != EM PROCESSAMENTO). Itens reprovados retornam ao estoque.  | ⏳ Previsto     | -                                                                                  |

---

## 🛒 Carrinho e Compra

| ID           | Regra                             | Tipo        | Descrição                                                                                                             | Status          | Evidência no Código                                                                      |
| :----------- | :-------------------------------- | :---------- | :-------------------------------------------------------------------------------------------------------------------- | :-------------- | :--------------------------------------------------------------------------------------- |
| **[RN0031]** | Estoque no Carrinho               | Obrigatório | Quantidade de itens no carrinho não pode ultrapassar o estoque disponível.                                            | ⏳ Parcial      | `carrinhoSlice.ts` — verificação de item duplicado; validação de limite pendente backend |
| **[RN0032]** | Mudança de estoque na compra      | Obrigatório | Notificar usuário se o estoque mudar entre adição ao carrinho e finalização; atualizar quantidade ou remover item.    | ⏳ Previsto     | -                                                                                        |
| **[RN0033]** | Cupom Promocional Único           | Obrigatório | Apenas 1 cupom promocional por compra. Cupons de troca não possuem essa limitação.                                    | ✅ Implementado | `Checkout.tsx` — lógica de aplicação de cupom único                                      |
| **[RN0034]** | Múltiplos Cartões                 | Obrigatório | Pagamento permitido em mais de um cartão; valor mínimo por cartão: R$ 10,00.                                          | ✅ Implementado | `Checkout.tsx` — campo "Pagar valor parcial com este cartão (Múltiplos Cartões)"         |
| **[RN0035]** | Cupons Prioritários               | Obrigatório | O valor dos cupons é descontado primeiro. Com cupom, o saldo mínimo em cartão pode ser inferior a R$ 10,00.           | ✅ Implementado | `CheckoutService.ts` — lógica de desconto prioriza cupom antes do cartão                 |
| **[RN0036]** | Cupom de Troca Excedente          | Obrigatório | Se o valor dos cupons superar o total da compra, o sistema gera um novo cupom de troca para o excedente.              | ✅ Implementado | `CheckoutService.ts` — geração de cupom excedente no fechamento do pedido                |
| **[RN0037]** | Validar Pagamento Final           | Obrigatório | Verificação da validade dos cupons e autorização simulada da operadora de cartão antes de finalizar.                  | ✅ Implementado | `Checkout.tsx` — simulação de validação antes da tela de sucesso                         |
| **[RN0038]** | Status Pós-Pagamento              | Obrigatório | Sucesso: status **APROVADA**. Falha: status **REPROVADA**. Pedido inicia como **EM PROCESSAMENTO**.                   | ✅ Implementado | `pedidoSlice.ts` — gerenciamento de status do pedido via Redux                           |
| **[RN0039]** | Status para transporte            | Obrigatório | Selecionado para entrega: EM TRANSPORTE.                                                                              | ✅ Implementado | `PedidoService.ts` — status Em Trânsito                                                  |
| **[RN0040]** | Status após entrega               | Obrigatório | Confirmado pelo administrador: ENTREGUE.                                                                              | ✅ Implementado | `PedidoService.ts` — status Entregue                                                     |
| **[RN0041]** | Gerar pedido de troca             | Obrigatório | Itens selecionados para troca geram pedido com status EM TROCA.                                                       | ✅ Implementado | `PedidoService.ts` (`solicitarTroca` altera status para 'Em Troca')                      |
| **[RN0042]** | Status pós-recebimento troca      | Obrigatório | Quando recebido pelo administrador: TROCADO.                                                                          | ✅ Implementado | `PedidoService.ts` (`confirmarRecebimentoTroca` muda status para 'Trocado')              |
| **[RN0043]** | Validação de solicitação de troca | Obrigatório | Somente itens com status ENTREGUE podem ser trocados.                                                                 | ✅ Implementado | `SolicitarTroca.tsx` e `PedidoService.ts` — valida se `status === 'Entregue'`            |
| **[RN0044]** | Bloqueio de produtos              | Obrigatório | Itens no carrinho ficam bloqueados temporariamente. Notificar 5min antes de expirar. Se expirar, itens são removidos. | ⏳ Previsto     | -                                                                                        |
| **[RN0045]** | Retirar item do carrinho          | Obrigatório | Quando o bloqueio expira, todos os itens daquele produto são retirados do carrinho.                                   | ⏳ Previsto     | -                                                                                        |
| **[RN0046]** | Notificação de troca              | Obrigatório | Sistema notifica o cliente quando o administrador autoriza a troca.                                                   | ⏳ Previsto     | -                                                                                        |
| **[RN0069]** | Parcelamento Mínimo               | Novo        | Compras abaixo de R$ 80,00 não são elegíveis para parcelamento. Acima desse valor, parcelas sem juros disponíveis.    | ✅ Implementado | `Checkout.tsx` + `CheckoutService.ts` — lógica de parcelas com limite mínimo             |

---

## 📦 Estoque e Catálogo

| ID           | Regra                            | Tipo        | Descrição                                                                                                              | Status          | Evidência no Código                                                                           |
| :----------- | :------------------------------- | :---------- | :--------------------------------------------------------------------------------------------------------------------- | :-------------- | :-------------------------------------------------------------------------------------------- |
| **[RN0011]** | Dados obrigatórios (Livro)       | Obrigatório | Autor, categoria, ano, título, editora, edição, ISBN, páginas, sinopse, dimensões, precificação, barras.               | ✅ Implementado | `CadastrarLivroAdmin.tsx` — wizard de cadastro                                                |
| **[RN0012]** | Associação com categorias        | Obrigatório | Um livro pode estar associado com mais de uma categoria.                                                               | ✅ Implementado | `ILivro.ts` — array de `categorias`                                                           |
| **[RN0013]** | Definindo valor de venda         | Obrigatório | Valor baseado na margem de lucro parametrizada para o grupo de precificação definido no cadastro.                      | ✅ Implementado | `CadastrarLivroAdmin.tsx` — `calcularPrecoVenda(custo, grupo)` aplica margem por grupo        |
| **[RN0014]** | Validar margem de lucro          | Obrigatório | Mudanças abaixo da margem exigem autorização de um gerente de vendas.                                                  | ⏳ Previsto     | -                                                                                             |
| **[RN0015]** | Associar motivo de inativação    | Obrigatório | Inativação manual exige justificativa e categoria de inativação.                                                       | ✅ Implementado | `ListaLivrosAdmin.tsx` — Modal com `categoriaInativacao` + texto; Redux `alternarStatusLivro` |
| **[RN0016]** | Motivo de inativação automática  | Obrigatório | Inativações automáticas devem ser categorizadas como FORA DE MERCADO.                                                  | ⏳ Previsto     | -                                                                                             |
| **[RN0017]** | Associar motivo de ativação      | Obrigatório | Ativação exige justificativa e categoria de ativação.                                                                  | ✅ Implementado | `ListaLivrosAdmin.tsx` — mesmo Modal de justificativa reutilizado p/ ativação                 |
| **[RN0051]** | Validar dados de estoque         | Obrigatório | Produto, quantidade, valor de custo, fornecedor e data de entrada são obrigatórios.                                    | ✅ Implementado | `CadastrarLivroAdmin.tsx`                                                                     |
| **[RN0052]** | Custos diferentes                | Novo        | Se houver custos diferentes, o valor de venda considera o maior custo para manter preços iguais.                       | ⏳ Previsto     | -                                                                                             |
| **[RN0061]** | Quantidade mínima                | Obrigatório | Não permite entrada de itens com quantidade zero.                                                                      | ✅ Implementado | `CadastrarLivroAdmin.tsx`                                                                     |
| **[RN0062]** | Valor de custo                   | Obrigatório | Obrigatório haver um valor de custo para todo item.                                                                    | ✅ Implementado | `CadastrarLivroAdmin.tsx`                                                                     |
| **[RN0064]** | Data de entrada                  | Obrigatório | Obrigatório registrar a data de entrada dos itens.                                                                     | ✅ Implementado | `CadastrarLivroAdmin.tsx`                                                                     |
| **[RN0066]** | Indicador de Estoque Crítico     | Novo        | Livros com estoque ≤ 5 unidades são sinalizados com badge visual diferenciado na lista e contados no KPI do Dashboard. | ✅ Implementado | `ListaLivrosAdmin.tsx` + `DashboardAdmin.tsx`                                                 |
| **[RN0067]** | Recálculo Automático do Carrinho | Novo        | A cada adição, remoção ou alteração de quantidade, o subtotal, total e frete são recalculados automaticamente.         | ✅ Implementado | `carrinhoSlice.ts` — recalcula `resumo` em todos os reducers                                  |
| **[RN0068]** | Avaliação por Estrelas           | Novo        | Os livros possuem avaliação (1–5 estrelas) e número de avaliações exibidos no catálogo e na página de detalhes.        | ✅ Implementado | `DetalhesLivro.tsx` + `HomeCatalogo.tsx`                                                      |

---

## 🔑 Administração e Segurança

| ID           | Regra                                   | Tipo | Descrição                                                                                           | Status          | Evidência no Código                                                            |
| :----------- | :-------------------------------------- | :--- | :-------------------------------------------------------------------------------------------------- | :-------------- | :----------------------------------------------------------------------------- |
| **[RN0065]** | Restrição de Criação de Admin           | Novo | Apenas um administrador autenticado pode criar outro. Não existe rota pública de cadastro de admin. | ✅ Implementado | `GerenciarAdmins.tsx` — acesso via `ProtectedRoute` com `requiredRole="admin"` |
| **[RN0070]** | Token de Sessão com Prefixo de Ambiente | Novo | Tokens mockados utilizam o prefixo `MOCK_TOKEN_` para diferenciação do ambiente de produção.        | ✅ Implementado | `apiConfig.ts` — constante `MOCK_TOKEN_PREFIX`                                 |

---

## 🏛️ Padrões Arquiteturais (Obrigatórios)

| ID            | Regra                             | Tipo        | Descrição                                                                                                              | Status    | Evidência no Código                                    |
| :------------ | :-------------------------------- | :---------- | :--------------------------------------------------------------------------------------------------------------------- | :-------- | :----------------------------------------------------- |
| **[RES0001]** | Documentação Obrigatória          | Obrigatório | Registro compulsório de mudanças em `docs/CHANGES.md`, `docs/REGRAS-NEGOCIOS.md` e requisitos após cada implementação. | ✅ Padrão | `docs/` — todos os arquivos de documentação do projeto |
| **[RES0002]** | Early Return (sem else)           | Obrigatório | Proibido usar `else` ou `else if`. Todas as condicionais devem usar Guard Clauses (retorno antecipado).                | ✅ Padrão | Todos os hooks e serviços do projeto                   |
| **[RES0003]** | Proibição de Estilo Inline        | Obrigatório | Estilização deve estar em `.module.css`. Exceção aceita apenas para props 100% dinâmicas (ex: `width: ${val}%`).       | ✅ Padrão | Todos os componentes React do projeto                  |
| **[RES0004]** | Uso de Mocks para Desenvolvimento | Obrigatório | Utilizar os mocks em `src/mocks/` para desenvolvimento desacoplado do backend.                                         | ✅ Padrão | `src/mocks/*.json` — todos os domínios mockados        |

---

> 📌 **Referência cruzada:**
>
> - Requisitos Funcionais: [`docs/REQUISITOS-FUNCIONAIS.md`](./REQUISITOS-FUNCIONAIS.md)
> - Requisitos Não-Funcionais: [`docs/REQUISITOS-NAO-FUNCIONAIS.md`](./REQUISITOS-NAO-FUNCIONAIS.md)
> - Estimativas PERT: [`docs/ESTIMATIVAS.md`](./ESTIMATIVAS.md)
