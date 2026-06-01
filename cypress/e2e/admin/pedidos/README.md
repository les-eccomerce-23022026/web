# Testes de Pedidos - Admin

Esta pasta contém testes E2E que validam as funcionalidades administrativas de gestão de pedidos.

## Tipos de Testes

- **Listagem e filtros** - Busca, ordenação, filtros por status/data
- **Detalhes do pedido** - Visualização completa de informações
- **Mudança de status** - Aprovação, cancelamento, expedição
- **Ações em lote** - Processamento múltiplo de pedidos
- **Notificações** - Alertas de novos pedidos e atualizações

## Como Rodar

### Rodar todos os testes de pedidos admin:
```bash
cd web
npx cypress run --e2e --spec "cypress/e2e/admin/pedidos/*.cy.ts"
```

### Rodar um teste específico:
```bash
cd web
npx cypress run --e2e --spec "cypress/e2e/admin/pedidos/[nome-do-arquivo].cy.ts"
```

## Padrões Esperados

- **Permissões adequadas** - Apenas usuários autorizados acessam
- **Atualizações em tempo real** - Status refletidos imediatamente
- **Logs de auditoria** - Todas as alterações registradas
- **Validações de negócio** - Regras de status respeitadas

## Comandos Customizados Utilizados

- `cy.autenticarAdminViaApi(email, senha)` - Autenticação admin via API
- `cy.acessarPedidosAdmin()` - Navega para página de pedidos
- `criarVendaAprovadaViaApi()` - Cria pedido de teste via API
- `cy.filtrarPedidos(filtros)` - Aplica filtros na listagem
- `cy.alterarStatusPedido(pedidoId, novoStatus)` - Muda status do pedido
- `cy.verificarNotificacoes()` - Valida badges e alertas

## Critérios de Sucesso

✅ **Acesso controlado** - Apenas administradores autorizados  
✅ **Operações válidas** - Mudanças de status seguem regras  
✅ **Feedback claro** - Usuário notificado sobre resultados  
✅ **Auditoria completa** - Todas as ações registradas  

## Relacionamento com Outros Testes

- **Vendas** - `../../vendas/` - Pedidos criados pelo cliente
- **Entregas** - `../../entregas/despacho/` - Processos de expedição
- **Clientes** - `../clientes/` - Visão administrativa dos clientes
- **Trocas** - `../../trocas/` - Processos de devolução