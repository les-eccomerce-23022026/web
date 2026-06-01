# Testes de Despacho - Entregas

Esta pasta contém testes E2E que validam o processo de despacho e expedição de pedidos.

## Tipos de Testes

- **Preparação do pedido** - Separação de itens no estoque
- **Geração de etiqueta** - Criação e impressão de etiquetas de envio
- **Seleção de transportadora** - Escolha da melhor opção de frete
- **Confirmação de despacho** - Registro do envio ao cliente
- **Rastreamento** - Início do acompanhamento da entrega
- **Multi-pacotes** - Pedidos com múltiplas embalagens

## Como Rodar

### Rodar todos os testes de despacho:
```bash
cd web
npx cypress run --e2e --spec "cypress/e2e/entregas/despacho/*.cy.ts"
```

### Rodar um teste específico:
```bash
cd web
npx cypress run --e2e --spec "cypress/e2e/entregas/despacho/[nome-do-arquivo].cy.ts"
```

## Padrões Esperados

- **Validação de estoque** - Itens disponíveis antes do despacho
- **Integração com transportadoras** - APIs de envio funcionando
- **Notificação ao cliente** - Alertas de envio e rastreamento
- **Logs de auditoria** - Todas as operações registradas
- **Confirmação automática** - Status atualizado no sistema

## Comandos Customizados Utilizados

- `cy.autenticarAdminViaApi(email, senha)` - Autenticação admin via API
- `criarVendaAprovadaViaApi()` - Cria pedido para despacho
- `cy.acessarDespachoPedidos()` - Navega para área de expedição
- `cy.separarItensPedido(pedidoId)` - Simula separação no estoque
- `cy.gerarEtiquetaEnvio(pedidoId, transportadora)` - Cria etiqueta
- `cy.confirmarDespacho(pedidoId, dadosEnvio)` - Registra envio
- `cy.verificarRastreamento(pedidoId)` - Valida código de rastreio
- `cy.notificarClienteDespacho(pedidoId)` - Simula notificação

## Critérios de Sucesso

✅ **Estoque atualizado** - Itens deduzidos corretamente  
✅ **Etiqueta válida** - Dados de envio corretos e funcionais  
✅ **Cliente notificado** - Comunicação clara sobre envio  
✅ **Rastreamento ativo** - Código funcional para acompanhamento  

## Relacionamento com Outros Testes

- **Pedidos** - `../../admin/pedidos/` - Pedidos prontos para despacho
- **Entregas** - `../falhas/` - Problemas no processo de entrega
- **Estoque** - Controle de produtos no armazém
- **Transportadoras** - Integrações com serviços de envio