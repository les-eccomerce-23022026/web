# Testes de Solicitação de Trocas

Esta pasta contém testes E2E que validam o processo inicial de solicitação de troca por parte do cliente.

## Tipos de Testes

- **Início da solicitação** - Acesso ao formulário de troca
- **Seleção de itens** - Escolha dos produtos a serem trocados
- **Motivo da troca** - Defeito, tamanho incorreto, arrependimento
- **Upload de fotos** - Comprovação do problema
- **Escolha de alternativa** - Novo produto ou reembolso
- **Confirmação da solicitação** - Envio para análise

## Como Rodar

### Rodar todos os testes de solicitação de troca:
```bash
cd web
npx cypress run --e2e --spec "cypress/e2e/trocas/solicitacao/*.cy.ts"
```

### Rodar um teste específico:
```bash
cd web
npx cypress run --e2e --spec "cypress/e2e/trocas/solicitacao/[nome-do-arquivo].cy.ts"
```

## Padrões Esperados

- **Validação de elegibilidade** - Prazo e condições verificadas
- **Documentação necessária** - Fotos e justificativas exigidas
- **Opções claras** - Alternativas bem definidas para o cliente
- **Confirmação imediata** - Protocolo gerado na hora
- **Notificação automática** - Equipe avisada sobre nova solicitação

## Comandos Customizados Utilizados

- `cy.autenticarViaApi(email, senha)` - Autenticação via API
- `criarVendaAprovadaViaApi()` - Cria pedido para troca
- `cy.acessarAreaCliente()` - Navega para área do cliente
- `cy.iniciarSolicitacaoTroca(pedidoId)` - Começa processo de troca
- `cy.selecionarItensTroca(itens)` - Escolhe produtos para troca
- `cy.informarMotivoTroca(motivo, descricao)` - Preenche justificativa
- `cy.uploadFotosProbleto(fotos)` - Anexa evidências
- `cy.escolherAlternativaTroca(alternativa)` - Define o que deseja
- `cy.confirmarSolicitacaoTroca()` - Finaliza e envia para análise

## Critérios de Sucesso

✅ **Elegibilidade verificada** - Apenas trocas permitidas aceitas  
✅ **Documentação completa** - Todas as informações necessárias coletadas  
✅ **Processo claro** - Cliente entende cada etapa do processo  
✅ **Confirmação imediata** - Protocolo gerado e comunicado  

## Relacionamento com Outros Testes

- **Autorização** - `../autorizacao/` - Análise e aprovação da solicitação
- **Pedidos** - `../../admin/pedidos/` - Pedidos originais das trocas
- **Clientes** - `../../clientes/` - Dados do solicitante
- **Entregas** - `../../entregas/` - Logística de devolução e reenvio