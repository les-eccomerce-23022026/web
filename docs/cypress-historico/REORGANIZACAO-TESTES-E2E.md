# Proposta de Reorganização dos Testes E2E - Comportamento do Usuário

## Diagnóstico da Situação Atual

### Problemas Identificados

1. **Testes monolíticos**: Arquivos como `fluxo-ponta-a-ponta.cy.ts` (311 linhas), `multiplas-falhas-consecutivas.cy.ts` (33KB) tentam cobrir múltiplos cenários em um único teste
2. **Baixa taxa de sucesso**: 94% de falha em vendas, 100% em pagamentos, entregas e trocas
3. **Dificuldade de debug**: Quando um teste falha, é difícil isolar qual comportamento específico causou o problema
4. **Execução lenta**: Testes grandes levam muito tempo para executar mesmo quando apenas um comportamento precisa ser validado
5. **Manutenção complexa**: Alterações em uma parte do fluxo podem quebrar testes inteiros

### Padrões Atuais

**Estrutura existente em `vendas/caminho-feliz/`** (boa referência):
- ✅ Já separada em etapas pequenas (01-carrinho, 02-checkout-preparacao, etc.)
- ✅ README documentando como rodar
- ✅ Foco em um comportamento por arquivo

**Problemas nas outras pastas**:
- ❌ Mistura de cenários felizes, falhas e validações no mesmo arquivo
- ❌ Testes que cobrem múltiplos domínios (ex: `validacoes-de-formularios.cy.ts` cobre troca, endereço e perfil)
- ❌ Falta de padronização na nomenclatura

---

## Avaliação de Conteúdo dos Testes, Boas Práticas e Fidelidade ao Comportamento Real do Usuário

> Esta seção complementa o diagnóstico estrutural com uma análise **qualitativa do conteúdo** dos testes existentes. Ela responde às perguntas: os testes estão bem escritos? Seguem boas práticas? Eles realmente simulam **cenários reais de uso** próximos do que um usuário (cliente ou admin) faria na interface?

### Metodologia Aplicada

- Análise de ~55 arquivos `.cy.ts` (contagem de linhas, quantidade de `it()`/`describe()`, padrões de setup)
- Busca sistemática por anti-padrões documentados em [cypress-best-practices/SKILL.md](../.agents/skills/cypress-best-practices/SKILL.md) e [frontend-testing/SKILL.md](../.agents/skills/frontend-testing/SKILL.md)
- Leitura profunda de arquivos representativos:
  - **Monolíticos/problemáticos**: `multiplas-falhas-consecutivas.cy.ts` (930 linhas), `fluxo-ponta-a-ponta.cy.ts` (310 linhas), `tela-pagamento.cy.ts` (15 `it()` em um arquivo), `cotacao-de-frete-no-checkout.cy.ts`
  - **Estruturados (referência positiva)**: `vendas/caminho-feliz/*.cy.ts`
  - **Comportamento de senha/perfil**: `clientes/perfil-trocar-senha*.cy.ts`
  - **Uso de Page Objects**: `support/pages/user/ProfilePage.ts`, `LoginPage.ts`
  - **Muitos seletores de classe**: `responsividade/*.cy.ts` e `evidencias-visuais-compra.cy.ts`
- Cruzamento com comandos customizados existentes em `support/commands.ts` e helpers

### Síntese da Avaliação

A suíte atual apresenta **qualidade técnica mista**, com excelente infraestrutura de setup, porém **baixa consistência** em boas práticas, estrutura de testes e, principalmente, **fidelidade a cenários reais de comportamento do usuário**.

| Dimensão                        | Avaliação     | Principais Evidências |
|--------------------------------|---------------|-----------------------|
| **Conteúdo / Foco**            | Regular       | Muitos testes orquestram estado via API e fazem 1-2 asserções pontuais de UI |
| **Boas Práticas Cypress**      | Irregular     | Forte em comandos ViaApi; fraco em seletores, waits e isolamento |
| **Proximidade do Usuário Real**| Baixa-Média   | Alta em fluxos de checkout/pagamento; muito baixa em entregas, trocas admin e regras complexas |
| **Manutenibilidade**           | Baixa         | Arquivos >200-900 linhas, 10-15 its por arquivo, waits hard-coded |

### Pontos Fortes Identificados

- **Infraestrutura de setup excelente**: Comandos como `autenticarViaApi`, `criarVendaAprovadaViaApi`, `prepararCarrinhoSincronizado`, `garantirCartoesViaApi`, `despacharPedidoViaApi` etc. seguem perfeitamente a recomendação de "Login programático + controle de estado via API" (melhor prática do Cypress para velocidade e confiabilidade).
- **Uso crescente de `data-cy`**: 1323 ocorrências em 56 arquivos. Arquivos de pagamento, checkout, entregas e trocas já usam seletores resilientes de forma consistente (ex: `[data-cy="checkout-finish-button"]`, `[data-cy^="checkout-card-item-"]`).
- **Page Objects em domínios críticos**: `ProfilePage`, `LoginPage` e `RegisterPage` usam predominantemente `data-cy` e encapsulam interações — padrão recomendado.
- **Nomenclatura em português na maioria**: A maioria dos `it()` segue o padrão "deve [verbo] [contexto] [resultado]".
- **Alguns fluxos realmente user-centric**: Os testes de `pagamentos/tela-pagamento.cy.ts` (parte do processamento), `vendas/caminho-feliz/01-carrinho.cy.ts` (primeiro `it()`) e vários de `entregas/` executam cliques, preenchimentos de CEP, seleção de opções de frete/pagamento e validações de UI como um usuário faria.

### Problemas Críticos de Conteúdo e Boas Práticas

1. **Monolitismo de comportamento (viola princípio de 1 comportamento por arquivo)**
   - `tela-pagamento.cy.ts`: 15 `it()` misturando happy path, falhas, cupom, split e validações.
   - `multiplas-falhas-consecutivas.cy.ts`: 930 linhas, múltiplos cenários de 1ª/2ª/3ª falha + cancelamento em um único arquivo.
   - `fluxo-ponta-a-ponta.cy.ts`: 310 linhas com apenas **1 `it()` principal** (além de sub-fluxos).

2. **Esperas fixas com propósito visual (anti-padrão grave)**
   - `clientes/perfil-trocar-senha.cy.ts`: 10+ ocorrências de `cy.wait(1000)` / `cy.wait(2000)` com comentários explícitos:
     - `cy.wait(2000); // Pausa para ver preenchimento`
     - `cy.wait(2000); // Pausa para ver sucesso`
   - Mesmos padrões em `perfil-trocar-senha-admin.cy.ts`, `registro-cliente.cy.ts`, `gerenciarLojas.cy.ts` e `limite-enderecos.cy.ts`.
   - Viola diretamente "Evite Esperas Desnecessárias" do `cypress-best-practices`.

3. **Uso persistente de seletores frágeis**
   - Muitos arquivos ainda usam `.class`, `.dashboardGrid`, `.cartao-livro`, `.carrinho-page`, `.sidebarAdmin` etc.
   - `responsividade/jornadas-criticas-cliente.cy.ts` e `painel-administrativo.cy.ts` são quase inteiramente baseados em inspeção de CSS via `.invoke('css')` e `.should('have.css')` — mais testes de layout do que de jornada de usuário.
   - `evidencias-visuais-compra.cy.ts` também depende fortemente de `.cartao-livro`.

4. **Testes rotulados como "E2E" que são predominantemente orquestração de API (baixa fidelidade ao usuário)**
   - **`fluxo-ponta-a-ponta.cy.ts:273`** (it "deve executar fluxo parcial de compra até entrega via API"):
     ```ts
     cy.criarVendaAprovadaViaApi()...;
     cy.despacharPedidoViaApi(vendaUuid);
     cy.request(...GET status...);
     cy.confirmarEntregaViaApi(vendaUuid);
     cy.request(...GET status...);
     ```
     Zero interação real do administrador na UI de despacho/entrega. O teste verifica o backend, não o comportamento do usuário.
   - **`multiplas-falhas-consecutivas.cy.ts`**: Quase todo o arquivo é sequência de chamadas ViaApi + `cy.request` para mudar estado. Os `cy.visit('/admin/pedidos')` servem apenas para checar badges após o estado já ter sido alterado por API.
   - Vários testes de `entregas/`, `trocas/` e admin seguem o mesmo padrão: setup pesado via API → 1 visita → 1-2 asserções de UI.

5. **Inconsistências de nomenclatura e estrutura**
   - Mistura de `it('Deve ...')` (maiúsculo) vs `it('deve ...')`.
   - Alguns `before()` criando usuários (bom para isolamento), outros usando `cy.session` de forma inconsistente.
   - Ausência de `beforeEach` em vários arquivos antigos (testes acoplados).

6. **Validações finais frequentemente via API em vez de UI**
   - Após alterar senha no perfil, o teste faz `cy.request` de login em vez de simular o usuário fazendo logout + login pela UI (perde cobertura de fluxo real de reautenticação).

### Análise Específica: "São Testes E2E Escritos Dentro de Cenários Reais Próximos do Comportamento do Usuário?"

**Definição de referência (alinhada às skills do projeto):**
> Um teste E2E user-centric simula a sequência de ações que um **usuário real** executaria no navegador (visitar páginas, clicar em botões visíveis, preencher formulários, observar feedback imediato da UI) para atingir um objetivo de negócio, usando o mínimo possível de bypass via API dentro do próprio `it()`.

**Classificação por Domínio (amostra representativa):**

| Domínio          | Nível de Fidelidade ao Usuário | Justificativa |
|------------------|--------------------------------|---------------|
| **Vendas / Pagamentos (checkout)** | **Alta** | Muitos testes executam o fluxo real: selecionar endereço, digitar CEP, clicar "Calcular Frete", escolher PAC/PIX/cartão, clicar "Finalizar". Boa cobertura de interações. |
| **Clientes (perfil, endereços, cartões)** | **Média** | Uso bom de Page Objects e data-cy, mas prejudicado por waits visuais e validação final via API. |
| **Autenticação** | **Média-Alta** | Fluxos de login/registro usam Page Objects. Porém alguns testes de proteção de rotas ainda misturam request + UI. |
| **Entregas / Trocas (admin)** | **Baixa** | Predominantemente API-driven. O "usuário admin" raramente clica nos botões reais de "Despachar", "Marcar Falha", "Autorizar Troca" na UI. |
| **Responsividade** | **Muito Baixa** | Foco em propriedades CSS e media queries via `.invoke('css')`. Não simula jornadas de usuário em telas pequenas (toque, scroll, etc.). |
| **IA / Chatbot** | **Alta** | Testes de envio de mensagens naturais, histórico, loading states — interagem diretamente com a UI do assistente. |
| **Multi-falhas / Fluxo ponta-a-ponta** | **Muito Baixa** | Orquestração de regras de negócio via API com verificação pontual de UI. Não exercitam o comportamento do usuário que dispara essas regras. |

**Consequência prática:**
Quando um teste falha hoje, na maioria dos casos o problema está no **setup de dados** ou em timing de rede das chamadas ViaApi, e não no fluxo que o usuário executaria. Isso reduz drasticamente o valor de proteção contra regressões de experiência do usuário.

### Recomendações Obrigatórias para a Reorganização (além da estrutura de pastas)

A reorganização de pastas (`happy-path/`, `failure-scenarios/`, `validations/`) **deve vir acompanhada de refatoração de conteúdo**, caso contrário os problemas de qualidade serão apenas redistribuídos.

1. **Substituir todos os `cy.wait(número)`** por asserções automáticas ou `cy.intercept().as()` + `cy.wait('@alias')`.
2. **Exigir data-cy/data-testid** em todo componente que participa de E2E (auditoria + adição nos componentes React).
3. **Converter testes API-heavy em fluxos UI reais** sempre que a regra de negócio possuir gatilho na interface do usuário (ex: botões de despacho, marcar falha, autorizar troca). Manter helpers ViaApi apenas para pré-condições complexas.
4. **Separar explicitamente**:
   - Testes de **jornada de usuário** (E2E puro) → priorizar interações UI.
   - Testes de **regras de negócio complexas** (ex: 3 falhas → cancelamento) → podem usar API + assert de UI, mas devem ser claramente nomeados e documentados como tal.
5. **Expandir Page Objects** para admin, checkout, IA e entregas.
6. **Padronizar nomenclatura** de `it()` para iniciar sempre com "deve " (minúsculo) seguindo a regra das 3 partes do `frontend-testing`.
7. **Adicionar limite de tamanho** nos scripts de CI/lint: falhar se arquivo > 120 linhas ou > 3 `it()` sem justificativa no cabeçalho.

Essas melhorias de qualidade, combinadas com a estrutura proposta de pastas, transformarão a suíte de "testes que rodam em Cypress" em **verdadeiros testes E2E de comportamento do usuário**.

---

## Proposta de Nova Estrutura

### Princípios de Organização

1. **Separação por Tipo de Cenário**: Cada domínio terá 3 subpastas
   - `happy-path/` - Cenários felizes (usuário consegue completar a ação)
   - `failure-scenarios/` - Cenários de falha (sistema recusa ou erro esperado)
   - `validations/` - Validações de campos, formulários e regras de negócio

2. **Comportamentos Atômicos**: Cada arquivo `.cy.ts` deve testar **um único comportamento** do usuário
   - Máximo de 50-80 linhas por arquivo
   - Um `it()` principal por arquivo (com exceções justificadas)
   - Nome do arquivo descreve claramente o comportamento

3. **Hierarquia de Domínios**: Manter a separação por domínio de negócio
   - `vendas/` - Fluxo de compra
   - `pagamentos/` - Processamento de pagamento
   - `clientes/` - Gestão de conta
   - `entregas/` - Logística e frete
   - `trocas/` - Processo de troca/devolução

---

## Estrutura Proposta Detalhada

```
cypress/e2e/
├── vendas/
│   ├── happy-path/
│   │   ├── 01-adicionar-ao-carrinho.cy.ts
│   │   ├── 02-navegar-para-checkout.cy.ts
│   │   ├── 03-selecionar-endereco.cy.ts
│   │   ├── 04-calcular-frete.cy.ts
│   │   ├── 05-aplicar-cupom.cy.ts
│   │   ├── 06-selecionar-cartao.cy.ts
│   │   ├── 07-finalizar-compra.cy.ts
│   │   ├── 08-redirecionar-pedido-confirmado.cy.ts
│   │   └── README.md
│   ├── failure-scenarios/
│   │   ├── carrinho-vazio-finalizar.cy.ts
│   │   ├── sem-endereco-selecionado.cy.ts
│   │   ├── cep-invalido-calcular-frete.cy.ts
│   │   ├── cupom-inexistente.cy.ts
│   │   ├── sem-pagamento-selecionado.cy.ts
│   │   ├── teto-sandbox-excedido.cy.ts
│   │   ├── estoque-insuficiente.cy.ts
│   │   └── README.md
│   ├── validations/
│   │   ├── formulario-checkout-campos-obrigatorios.cy.ts
│   │   ├── limite-caracteres-cupom.cy.ts
│   │   ├── formato-cep.cy.ts
│   │   ├── validacao-quantidade-item.cy.ts
│   │   └── README.md
│   └── README.md
│
├── pagamentos/
│   ├── happy-path/
│   │   ├── pagamento-cartao-aprovado.cy.ts
│   │   ├── pagamento-pix-qr-code.cy.ts
│   │   ├── pagamento-pix-confirmado.cy.ts
│   │   ├── pagamento-parcial-cartao.cy.ts
│   │   ├── pagamento-parcial-pix.cy.ts
│   │   └── README.md
│   ├── failure-scenarios/
│   │   ├── cartao-recusado.cy.ts
│   │   ├── cartao-expirado.cy.ts
│   │   ├── saldo-insuficiente.cy.ts
│   │   ├── pix-timeout.cy.ts
│   │   ├── webhook-pix-falha.cy.ts
│   │   └── README.md
│   ├── validations/
│   │   ├── numero-cartao-luhn.cy.ts
│   │   ├── validade-cartao.cy.ts
│   │   ├── cvv-cartao.cy.ts
│   │   ├── nome-impresso-cartao.cy.ts
│   │   └── README.md
│   └── README.md
│
├── clientes/
│   ├── happy-path/
│   │   ├── cadastro-endereco.cy.ts
│   │   ├── cadastro-cartao.cy.ts
│   │   ├── atualizar-perfil.cy.ts
│   │   ├── alterar-senha.cy.ts
│   │   └── README.md
│   ├── failure-scenarios/
│   │   ├── endereco-sem-logradouro.cy.ts
│   │   ├── endereco-sem-numero.cy.ts
│   │   ├── cep-invalido.cy.ts
│   │   ├── cartao-invalido.cy.ts
│   │   ├── senha-incorreta.cy.ts
│   │   └── README.md
│   ├── validations/
│   │   ├── limite-caracteres-nome.cy.ts
│   │   ├── limite-caracteres-endereco.cy.ts
│   │   ├── formato-email.cy.ts
│   │   ├── forca-senha.cy.ts
│   │   └── README.md
│   └── README.md
│
├── entregas/
│   ├── happy-path/
│   │   ├── cotar-frete-pac.cy.ts
│   │   ├── cotar-frete-sedex.cy.ts
│   │   ├── cotar-frete-retira-loja.cy.ts
│   │   ├── selecionar-opcao-frete.cy.ts
│   │   ├── despachar-pedido.cy.ts
│   │   ├── confirmar-entrega.cy.ts
│   │   └── README.md
│   ├── failure-scenarios/
│   │   ├── cep-nao-encontrado.cy.ts
│   │   ├── servico-frete-indisponivel.cy.ts
│   │   ├── falha-despacho.cy.ts
│   │   ├── falha-confirmacao-entrega.cy.ts
│   │   └── README.md
│   ├── validations/
│   │   ├── formato-cep-frete.cy.ts
│   │   ├── peso-maximo.cy.ts
│   │   ├── regiao-entrega.cy.ts
│   │   └── README.md
│   └── README.md
│
├── trocas/
│   ├── happy-path/
│   │   ├── solicitar-troca.cy.ts
│   │   ├── autorizar-troca-admin.cy.ts
│   │   ├── confirmar-recebimento.cy.ts
│   │   ├── gerar-cupom-troca.cy.ts
│   │   ├── usar-cupom-troca.cy.ts
│   │   └── README.md
│   ├── failure-scenarios/
│   │   ├── troca-pedido-nao-entregue.cy.ts
│   │   ├── prazo-troca-expirado.cy.ts
│   │   ├── produto-sem-condicao.cy.ts
│   │   ├── rejeitar-troca-admin.cy.ts
│   │   └── README.md
│   ├── validations/
│   │   ├── motivo-obrigatorio.cy.ts
│   │   ├── limite-caracteres-motivo.cy.ts
│   │   ├── item-selecionado-obrigatorio.cy.ts
│   │   └── README.md
│   └── README.md
```

---

## Mapeamento: Testes Atuais → Nova Estrutura

### Vendas

**Arquivos atuais → Novos arquivos:**

| Arquivo Atual | Comportamentos | Destino |
|--------------|----------------|---------|
| `caminho-feliz-compra.cy.ts` | Fluxo completo de compra | Dividir em 8 arquivos em `vendas/happy-path/` |
| `caminho-feliz/01-carrinho.cy.ts` | Adicionar ao carrinho | `vendas/happy-path/01-adicionar-ao-carrinho.cy.ts` |
| `caminho-feliz/02-checkout-preparacao.cy.ts` | Acessar checkout + endereço | Dividir em 2 arquivos |
| `caminho-feliz/03-frete.cy.ts` | Calcular e selecionar frete | Dividir em 2 arquivos |
| `caminho-feliz/04-cupom.cy.ts` | Aplicar cupom | `vendas/happy-path/05-aplicar-cupom.cy.ts` |
| `caminho-feliz/05-pagamento-finalizacao.cy.ts` | Selecionar cartão + finalizar | Dividir em 2 arquivos |
| `caminho-feliz/06-pedido-confirmado.cy.ts` | Página de sucesso | `vendas/happy-path/08-redirecionar-pedido-confirmado.cy.ts` |
| `falhas-na-compra.cy.ts` | 4 cenários de falha | Mover para `vendas/failure-scenarios/` |
| `validacoes-de-formularios.cy.ts` | Validações de troca/endereço/cartão | Mover para domínios específicos |
| `etapas-do-checkout.cy.ts` | Verificar componentes checkout | `vendas/validations/formulario-checkout-campos-obrigatorios.cy.ts` |
| `fluxo-ponta-a-ponta.cy.ts` | Fluxo cross-domain | Criar suite de integração separada |
| `multiplas-falhas-consecutivas.cy.ts` | Múltiplas falhas | Dividir em cenários individuais |
| `pedido-confirmado.cy.ts` | Validações página confirmação | `vendas/happy-path/08-redirecionar-pedido-confirmado.cy.ts` |
| `realizar-compra-completa.cy.ts` | Compra completa helper | Manter como helper/comando customizado |
| `evidencias-visuais-compra.cy.ts` | Screenshots | Manter separado em `visual/` |

### Pagamentos

| Arquivo Atual | Comportamentos | Destino |
|--------------|----------------|---------|
| `pagamento-aprovado.cy.ts` | Pagamento aprovado + status pedidos | `pagamentos/happy-path/pagamento-cartao-aprovado.cy.ts` |
| `tela-pagamento.cy.ts` | 11 cenários mistos | Dividir em happy/failure/validations |
| `cadastrar-endereco-no-checkout.cy.ts` | Endereço no checkout | Mover para `clientes/` |
| `combinacoes-de-pagamento.cy.ts` | Combinações de pagamento | `pagamentos/happy-path/pagamento-parcelado.cy.ts` |
| `falha-segundo-cartao-atomicidade.cy.ts` | Falha atomicidade | `pagamentos/failure-scenarios/atomicidade-falha.cy.ts` |
| `fluxo-completo-compra-complexa.cy.ts` | Fluxo complexo | Dividir em comportamentos |
| `pagamento-no-checkout.cy.ts` | Pagamento no checkout | `pagamentos/happy-path/pagamento-cartao-aprovado.cy.ts` |
| `tela-pagamento-pix.cy.ts` | Tela PIX | `pagamentos/happy-path/pagamento-pix-qr-code.cy.ts` |

### Clientes

| Arquivo Atual | Comportamentos | Destino |
|--------------|----------------|---------|
| `registrar-cartao-e-endereco-checkout.cy.ts` | Cadastro cartão/endereço | `clientes/happy-path/cadastro-cartao.cy.ts` + `cadastro-endereco.cy.ts` |
| `gerenciar-cartoes.cy.ts` | Gestão de cartões | `clientes/happy-path/` |
| `gerenciar-enderecos.cy.ts` | Gestão de endereços | `clientes/happy-path/` |
| `atualizar-endereco-falha.cy.ts` | Falha atualização | `clientes/failure-scenarios/` |
| `limite-enderecos.cy.ts` | Limite de endereços | `clients/validations/` |
| `perfil-dados-basicos.cy.ts` | Perfil | `clientes/happy-path/atualizar-perfil.cy.ts` |
| `perfil-trocar-senha.cy.ts` | Trocar senha | `clientes/happy-path/alterar-senha.cy.ts` |
| `perfil-trocar-senha-admin.cy.ts` | Trocar senha admin | Mover para `admin/` |
| `inativar-conta.cy.ts` | Inativar conta | `clients/failure-scenarios/` |

### Entregas

| Arquivo Atual | Comportamentos | Destino |
|--------------|----------------|---------|
| `cotacao-de-frete-no-checkout.cy.ts` | 20+ cenários de frete | Dividir em happy/failure/validations |
| `confirmar-entregue.cy.ts` | Confirmar entrega | `entregas/happy-path/confirmar-entrega.cy.ts` |
| `despachar-pedido.cy.ts` | Despachar pedido | `entregas/happy-path/despachar-pedido.cy.ts` |
| `despacho-e-confirmacao-admin.cy.ts` | Despacho + confirmação | Dividir em 2 arquivos |
| `falha-de-entrega-e-reenderecamento.cy.ts` | Falha entrega | `entregas/failure-scenarios/` |

### Trocas

| Arquivo Atual | Comportamentos | Destino |
|--------------|----------------|---------|
| `solicitar-troca-cliente.cy.ts` | Solicitar troca + validações | Dividir em happy/failure/validations |
| `autorizar-ou-rejeitar-troca.cy.ts` | Autorizar/rejeitar | Dividir em 2 arquivos |
| `confirmar-recebimento.cy.ts` | Confirmar recebimento | `trocas/happy-path/confirmar-recebimento.cy.ts` |
| `cupom-gerado-pela-troca.cy.ts` | Gerar cupom | `trocas/happy-path/gerar-cupom-troca.cy.ts` |
| `fluxo-administrativo-trocas.cy.ts` | Fluxo admin | Dividir em comportamentos |
| `solicitar-troca-validacoes.cy.ts` | Validações | `trocas/validations/` |

---

## Padrão de Nomenclatura

### Arquivos de Teste

**Formato**: `[verbo]-[entidade]-[acao-especifica].cy.ts`

**Exemplos**:
- ✅ `adicionar-ao-carrinho.cy.ts`
- ✅ `selecionar-endereco.cy.ts`
- ✅ `calcular-frete.cy.ts`
- ✅ `aplicar-cupom.cy.ts`
- ✅ `cep-invalido-calcular-frete.cy.ts`
- ✅ `cartao-recusado.cy.ts`

**Prefixos numéricos** (opcional, para ordenação):
- `01-`, `02-`, etc. para fluxos sequenciais em `happy-path/`

### Descrição dos Testes

**Formato**: `deve [verbo de ação] [condição/contexto]`

**Exemplos**:
- ✅ `deve adicionar item ao carrinho com sucesso`
- ✅ `deve calcular frete para CEP válido`
- ✅ `deve recusar pagamento com cartão expirado`
- ✅ `deve validar formato do CEP`

---

## Template de Arquivo de Teste

```typescript
/**
 * [Descrição breve do comportamento testado]
 * Domínio: [vendas/pagamentos/clientes/entregas/trocas]
 * Tipo: [happy-path/failure-scenario/validation]
 * 
 * Comportamento: [descrição detalhada do que o usuário faz]
 * Pré-condições: [estado necessário antes do teste]
 * Pós-condições: [estado esperado após o teste]
 */

describe('[Domínio] — [Tipo] — [Comportamento]', () => {
  const email = Cypress.env('clienteEmail') || 'clientetest@email.com';
  const senha = Cypress.env('clienteSenha') || '@asdfJKLÇ123';
  const apiUrl = Cypress.env('apiUrl') || 'http://localhost:5173/api';

  beforeEach(() => {
    Cypress.env('injectTestDbHeader', true);
    // Setup específico do comportamento
    cy.autenticarViaApi(email, senha);
    cy.limparCarrinhoViaApi();
  });

  it('deve [descrição do comportamento]', () => {
    // 1. Preparar estado inicial
    cy.log('**Etapa: [descrição]**');
    
    // 2. Executar ação do usuário
    cy.visit('/rota');
    cy.get('[data-cy="elemento"]').click();
    
    // 3. Validar resultado
    cy.get('[data-cy="resultado"]').should('be.visible');
    
    cy.log('✅ [comportamento] completado com sucesso');
  });
});
```

---

## README Templates

### README de Domínio (ex: `vendas/README.md`)

```markdown
# Testes E2E - Vendas

## Estrutura

- `happy-path/` - Cenários onde o usuário consegue completar a compra
- `failure-scenarios/` - Cenários onde o sistema recusa a operação
- `validations/` - Validações de campos e regras de negócio

## Como Rodar

### Todos os testes de vendas:
```bash
npx cypress run --e2e --spec "cypress/e2e/vendas/**/*.cy.ts"
```

### Apenas caminho feliz:
```bash
npx cypress run --e2e --spec "cypress/e2e/vendas/happy-path/*.cy.ts"
```

### Apenas falhas:
```bash
npx cypress run --e2e --spec "cypress/e2e/vendas/failure-scenarios/*.cy.ts"
```

### Apenas validações:
```bash
npx cypress run --e2e --spec "cypress/e2e/vendas/validations/*.cy.ts"
```

## Fluxo de Compra

1. Adicionar item ao carrinho
2. Navegar para checkout
3. Selecionar endereço
4. Calcular frete
5. Aplicar cupom (opcional)
6. Selecionar forma de pagamento
7. Finalizar compra
8. Redirecionar para pedido-confirmado

## Dependências

- Backend rodando em `http://localhost:3000`
- Seed de dados de teste carregado
- Header `x-use-test-db: true` configurado
```

### README de Subpasta (ex: `vendas/happy-path/README.md`)

```markdown
# Cenários Felizes - Vendas

Testes que validam o fluxo completo de compra quando tudo funciona corretamente.

## Testes

| Arquivo | Comportamento | Ordem no Fluxo |
|--------|---------------|----------------|
| 01-adicionar-ao-carrinho.cy.ts | Adicionar item ao carrinho | 1 |
| 02-navegar-para-checkout.cy.ts | Acessar tela de checkout | 2 |
| 03-selecionar-endereco.cy.ts | Selecionar endereço de entrega | 3 |
| 04-calcular-frete.cy.ts | Calcular e selecionar frete | 4 |
| 05-aplicar-cupom.cy.ts | Aplicar cupom de desconto | 5 |
| 06-selecionar-cartao.cy.ts | Selecionar cartão de pagamento | 6 |
| 07-finalizar-compra.cy.ts | Finalizar compra | 7 |
| 08-redirecionar-pedido-confirmado.cy.ts | Validar página de sucesso | 8 |

## Como Rodar Sequencialmente

```bash
npx cypress run --e2e --spec "cypress/e2e/vendas/happy-path/*.cy.ts" --config "testIsolation=false"
```

## Como Rodar Individualmente

```bash
npx cypress run --e2e --spec "cypress/e2e/vendas/happy-path/03-selecionar-endereco.cy.ts"
```
```

---

## Benefícios da Reorganização

### 1. **Execução Mais Rápida**
- Testes pequenos executam em segundos
- Possibilidade de rodar apenas subconjuntos (ex: apenas validações)
- Paralelismo mais efetivo

### 2. **Debug Mais Fácil**
- Erro isolado em um comportamento específico
- Nome do arquivo indica exatamente o que falhou
- Menos código para investigar

### 3. **Manutenção Simplificada**
- Alteração em um comportamento afeta apenas um arquivo
- Novos comportamentos são adicionados sem afetar existentes
- Remoção de funcionalidades é mais direta

### 4. **Cobertura Mais Clara**
- Fácil ver quais cenários felizes estão cobertos
- Fácil identificar lacunas em cenários de falha
- Validações separadas facilitam auditoria

### 5. **Onboarding Mais Rápido**
- Novos desenvolvedores entendem a estrutura rapidamente
- READMEs em cada nível guiam a execução
- Nomenclatura padronizada

### 6. **Integração Contínua Melhorada**
- Pipelines podem rodar subsets baseados em mudanças
- Feedback mais rápido sobre regressões
- Facilita testes de smoke (apenas happy-path)

---

## Plano de Migração

### Fase 1: Preparação (1 dia)
1. Criar estrutura de pastas vazia
2. Criar templates de README
3. Documentar padrão de nomenclatura

### Fase 2: Migração Vendas (2-3 dias)
1. Migrar `caminho-feliz/` (já está bem estruturado)
2. Dividir `caminho-feliz-compra.cy.ts` em comportamentos
3. Mover cenários de `falhas-na-compra.cy.ts`
4. Separar validações de `validacoes-de-formularios.cy.ts`

### Fase 3: Migração Pagamentos (2 dias)
1. Dividir `tela-pagamento.cy.ts` (11 cenários)
2. Mover cenários felizes para `happy-path/`
3. Mover falhas para `failure-scenarios/`
4. Extrair validações para `validations/`

### Fase 4: Migração Clientes (1-2 dias)
1. Separar cadastros de cartão e endereço
2. Mover falhas para `failure-scenarios/`
3. Extrair validações de limite de caracteres

### Fase 5: Migração Entregas (2 dias)
1. Dividir `cotacao-de-frete-no-checkout.cy.ts` (20+ cenários)
2. Separar happy/failure/validations
3. Criar testes atômicos para cada opção de frete

### Fase 6: Migração Trocas (1-2 dias)
1. Separar fluxo cliente de fluxo admin
2. Dividir autorizar/rejeitar
3. Extrair validações de prazo e motivo

### Fase 7: Limpeza (1 dia)
1. Remover arquivos antigos
2. Atualizar scripts npm
3. Atualizar documentação
4. Rodar suite completa para validar

### Fase 8: Validação (1 dia)
1. Rodar todos os testes novos
2. Comparar cobertura com antiga
3. Ajustar conforme necessário
4. Documentar diferenças

**Total estimado**: 10-12 dias

---

## Scripts de Execução Sugeridos

### package.json

```json
{
  "scripts": {
    "test:e2e:vendas:happy": "npx cypress run --e2e --spec \"cypress/e2e/vendas/happy-path/*.cy.ts\"",
    "test:e2e:vendas:failures": "npx cypress run --e2e --spec \"cypress/e2e/vendas/failure-scenarios/*.cy.ts\"",
    "test:e2e:vendas:validations": "npx cypress run --e2e --spec \"cypress/e2e/vendas/validations/*.cy.ts\"",
    "test:e2e:vendas:all": "npx cypress run --e2e --spec \"cypress/e2e/vendas/**/*.cy.ts\"",
    
    "test:e2e:pagamentos:happy": "npx cypress run --e2e --spec \"cypress/e2e/pagamentos/happy-path/*.cy.ts\"",
    "test:e2e:pagamentos:failures": "npx cypress run --e2e --spec \"cypress/e2e/pagamentos/failure-scenarios/*.cy.ts\"",
    "test:e2e:pagamentos:validations": "npx cypress run --e2e --spec \"cypress/e2e/pagamentos/validations/*.cy.ts\"",
    
    "test:e2e:smoke": "npx cypress run --e2e --spec \"cypress/e2e/*/happy-path/*.cy.ts\"",
    "test:e2e:regression": "npx cypress run --e2e --spec \"cypress/e2e/**/*.cy.ts\""
  }
}
```

---

## Métricas de Sucesso

### Antes da Reorganização
- **Tempo médio de execução**: ~15 minutos
- **Taxa de sucesso**: ~6% (34/576 passando)
- **Tempo de debug**: ~30 minutos por falha
- **Arquivos monolíticos**: 15+ arquivos > 200 linhas

### Depois da Reorganização (Meta)
- **Tempo médio de execução**: ~5 minutos (paralelismo + testes pequenos)
- **Taxa de sucesso**: >80% (testes mais estáveis)
- **Tempo de debug**: ~5 minutos por falha (isolamento)
- **Arquivos monolíticos**: 0 (todos < 80 linhas)

---

## Próximos Passos

1. **Aprovação da proposta** - Revisar estrutura com time
2. **Criar estrutura base** - Criar pastas e READMEs
3. **Migrar um domínio piloto** - Começar com `vendas/` (já tem caminho-feliz/)
4. **Validar abordagem** - Rodar testes migrados e ajustar
5. **Migrar domínios restantes** - Seguir plano de migração
6. **Documentar lições aprendidas** - Atualizar guia com aprendizados

---

## Conclusão

Esta reorganização transforma testes E2E monolíticos e difíceis de manter em uma suíte modular, rápida e fácil de debug. A separação por tipo de cenário (happy-path/failure-scenarios/validations) combinada com comportamentos atômicos permite:

- **Execução seletiva** baseada em mudanças
- **Debug rápido** através de isolamento
- **Manutenção simplificada** com arquivos pequenos
- **Cobertura clara** de todos os cenários
- **Onboarding rápido** para novos desenvolvedores

A estrutura proposta mantém os benefícios da organização atual em `vendas/caminho-feliz/` e estende o padrão para todos os domínios, criando uma suíte de testes escalável e sustentável.
