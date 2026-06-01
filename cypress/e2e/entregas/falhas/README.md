# Testes de Falhas - Entregas

Esta pasta contém testes E2E que validam cenários de falha no processo de entregas.

## Tipos de Testes

- **Endereço inválido** - CEP incorreto, local não encontrado
- **Recusa de recebimento** - Cliente não aceita a encomenda
- **Falha de transportadora** - Perda, dano, atraso excessivo
- **Problemas de rastreamento** - Código inválido, não atualizado
- **Devolução ao remetente** - Retorno por múltiplas tentativas
- **Danos na entrega** - Produtos avariados durante transporte

## Como Rodar

### Rodar todos os testes de falhas de entrega:
```bash
cd web
npx cypress run --e2e --spec "cypress/e2e/entregas/falhas/*.cy.ts"
```

### Rodar um teste específico:
```bash
cd web
npx cypress run --e2e --spec "cypress/e2e/entregas/falhas/[nome-do-arquivo].cy.ts"
```

## Padrões Esperados

- **Notificação automática** - Cliente informado sobre problemas
- **Opções de resolução** - Reenvio, cancelamento, reembolso
- **Atualização de status** - Sistema reflete falhas em tempo real
- **Log completo** - Detalhes registrados para auditoria
- **Processo de recuperação** - Fluxos definidos para cada tipo de falha

## Comandos Customizados Utilizados

- `cy.autenticarAdminViaApi(email, senha)` - Autenticação admin via API
- `criarVendaAprovadaViaApi()` - Cria pedido para simulação
- `cy.simularFalhaEntrega(pedidoId, tipoFalha)` - Simula diferentes problemas
- `cy.verificarStatusFalha(pedidoId)` - Valida status de falha
- `cy.processarResolucaoFalha(pedidoId, acao)` - Executa ação corretiva
- `cy.notificarClienteFalha(pedidoId)` - Simula comunicação com cliente
- `cy.verificarLogAuditoria(pedidoId)` - Valida registros da falha

## Critérios de Sucesso

✅ **Detecção rápida** - Falhas identificadas em tempo hábil  
✅ **Comunicação clara** - Cliente informado sobre o problema  
✅ **Resolução definida** - Processo estabelecido para cada falha  
✅ **Auditoria completa** - Todos os eventos registrados  

## Relacionamento com Outros Testes

- **Despacho** - `../despacho/` - Processo ideal de envio
- **Pedidos** - `../../admin/pedidos/` - Gestão de pedidos com problemas
- **Trocas** - `../../trocas/` - Processos de devolução
- **Clientes** - `../../clientes/` - Comunicação com o cliente final