# Testes de Falhas - Pagamentos

Esta pasta contém testes E2E que validam cenários de falha no processo de pagamentos.

## Tipos de Testes

- **Cartão recusado** - Saldo insuficiente, limite excedido, bloqueio
- **Dados inválidos** - Número incorreto, validade vencida, CVV errado
- **Timeout de processamento** - Falhas de comunicação com gateways
- **Fraude detectada** - Bloqueios por análise de risco
- **Gateway indisponível** - Falhas nos serviços de pagamento
- **Rollback de transação** - Reversão em caso de falha

## Como Rodar

### Rodar todos os testes de falhas de pagamento:
```bash
cd web
npx cypress run --e2e --spec "cypress/e2e/pagamentos/falhas/*.cy.ts"
```

### Rodar um teste específico:
```bash
cd web
npx cypress run --e2e --spec "cypress/e2e/pagamentos/falhas/[nome-do-arquivo].cy.ts"
```

## Padrões Esperados

- **Mensagem clara** - Erro explicado de forma compreensível
- **Recuperação elegante** - Opções para tentar novamente
- **Estado consistente** - Carrinho e sessão mantidos
- **Logs registrados** - Falhas documentadas para debugging
- **Segurança mantida** - Dados sensíveis protegidos mesmo em falhas

## Comandos Customizados Utilizados

- `cy.autenticarViaApi(email, senha)` - Autenticação via API
- `cy.prepararCarrinhoSincronizado()` - Prepara carrinho via API
- `cy.simularFalhaCartao(tipo)` - Simula diferentes tipos de recusa
- `cy.simularTimeoutGateway()` - Simula falha de comunicação
- `cy.verificarMensagemErroPagamento(mensagem)` - Valida feedback de erro
- `cy.tentarPagamentoAlternativo()` - Testa opção de retry

## Critérios de Sucesso

✅ **Feedback claro** - Usuário entende o que aconteceu  
✅ **Opções de recuperação** - Caminhos alternativos oferecidos  
✅ **Dados preservados** - Carrinho e seleções mantidas  
✅ **Segurança intacta** - Nenhuma informação comprometida  

## Relacionamento com Outros Testes

- **Checkout** - `../checkout/` - Fluxo ideal de pagamento
- **Vendas** - `../../vendas/falhas/` - Impacto nas vendas
- **Cartões** - `../../clientes/cartoes/` - Problemas com cartões salvos
- **Gateway** - Integrações com serviços externos