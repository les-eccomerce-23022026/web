# Testes de Clientes - Admin

Esta pasta contém testes E2E que validam as funcionalidades administrativas de gestão de clientes.

## Tipos de Testes

- **Listagem e busca** - Consulta de clientes com filtros avançados
- **Detalhes do cliente** - Visualização completa de dados e histórico
- **Gestão de conta** - Bloqueio, desbloqueio, exclusão
- **Análise de comportamento** - Histórico de compras e preferências
- **Comunicação** - Envio de notificações e comunicações

## Como Rodar

### Rodar todos os testes de clientes admin:
```bash
cd web
npx cypress run --e2e --spec "cypress/e2e/admin/clientes/*.cy.ts"
```

### Rodar um teste específico:
```bash
cd web
npx cypress run --e2e --spec "cypress/e2e/admin/clientes/[nome-do-arquivo].cy.ts"
```

## Padrões Esperados

- **Privacidade respeitada** - Dados sensíveis protegidos
- **Busca eficiente** - Filtros por nome, email, CPF, status
- **Histórico completo** - Pedidos, trocas, interações registradas
- **Ações auditadas** - Todas as modificações logadas

## Comandos Customizados Utilizados

- `cy.autenticarAdminViaApi(email, senha)` - Autenticação admin via API
- `cy.acessarClientesAdmin()` - Navega para página de clientes
- `cy.buscarCliente(termo)` - Realiza busca de cliente
- `cy.visualizarDetalhesCliente(clienteId)` - Acessa perfil completo
- `cy.alterarStatusCliente(clienteId, status)` - Bloqueia/desbloqueia conta
- `cy.verificarHistoricoCliente(clienteId)` - Valida histórico de atividades

## Critérios de Sucesso

✅ **Dados precisos** - Informações do cliente corretas e atualizadas  
✅ **Privacidade mantida** - Acesso restrito a dados sensíveis  
✅ **Operações seguras** - Ações críticas exigem confirmação  
✅ **Auditoria completa** - Todas as intervenções registradas  

## Relacionamento com Outros Testes

- **Clientes** - `../../clientes/` - Visão do lado do cliente
- **Pedidos** - `../pedidos/` - Histórico de compras do cliente
- **Autenticação** - `../../autenticacao/` - Processos de login
- **Perfil** - `../../clientes/perfil/` - Dados que o cliente gerencia