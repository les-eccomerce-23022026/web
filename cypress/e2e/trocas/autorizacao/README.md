# Testes de Autorização de Trocas

Esta pasta contém testes E2E que validam o processo de análise e autorização de solicitações de troca pelo administrador.

## Tipos de Testes

- **Listagem de solicitações** - Fila de trocas pendentes de análise
- **Análise de elegibilidade** - Verificação de prazos e condições
- **Aprovação** - Aceitação da solicitação com justificativa
- **Rejeição** - Negativa com motivo detalhado
- **Geração de etiqueta** - Criação de etiqueta para devolução
- **Comunicação com cliente** - Notificação sobre decisão

## Como Rodar

### Rodar todos os testes de autorização de troca:
```bash
cd web
npx cypress run --e2e --spec "cypress/e2e/trocas/autorizacao/*.cy.ts"
```

### Rodar um teste específico:
```bash
cd web
npx cypress run --e2e --spec "cypress/e2e/trocas/autorizacao/[nome-do-arquivo].cy.ts"
```

## Padrões Esperados

- **Validação completa** - Todas as regras verificadas antes da decisão
- **Justificativa clara** - Motivos bem explicados para cliente
- **Processo padronizado** - Fluxo consistente para aprovações e rejeições
- **Log de auditoria** - Todas as decisões registradas
- **Integração logística** - Etiquetas e rastreamento gerados

## Comandos Customizados Utilizados

- `cy.autenticarAdminViaApi(email, senha)` - Autenticação admin via API
- `cy.criarSolicitacaoTrocaViaApi()` - Cria solicitação para análise
- `cy.acessarTrocasAdmin()` - Navega para área de trocas
- `cy.analisarSolicitacaoTroca(trocaId)` - Acessa detalhes para análise
- `cy.verificarElegibilidadeTroca(trocaId)` - Valida regras aplicáveis
- `cy.aprovarTroca(trocaId, justificativa)` - Aceita solicitação
- `cy.rejeitarTroca(trocaId, motivo)` - Negativa com motivo
- `cy.gerarEtiquetaDevolucao(trocaId)` - Cria etiqueta para retorno
- `cy.notificarClienteDecisao(trocaId)` - Comunica decisão ao cliente

## Critérios de Sucesso

✅ **Análise completa** - Todos os aspectos verificados antes da decisão  
✅ **Decisão fundamentada** - Justificativas claras e consistentes  
✅ **Processo eficiente** - Análise realizada em tempo adequado  
✅ **Comunicação efetiva** - Cliente informado sobre o resultado  

## Relacionamento com Outros Testes

- **Solicitação** - `../solicitacao/` - Processo inicial do cliente
- **Pedidos** - `../../admin/pedidos/` - Pedidos originais relacionados
- **Clientes** - `../clientes/` - Comunicação com solicitantes
- **Entregas** - `../../entregas/` - Logística de devolução