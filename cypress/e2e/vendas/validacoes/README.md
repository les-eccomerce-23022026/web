# Testes de Validações - Vendas

Esta pasta contém testes E2E que validam regras de negócio e validações específicas do processo de vendas.

## Tipos de Testes

- **Validações de formulário** - Campos obrigatórios, formatos, limites
- **Regras de negócio** - Limites de compra, restrições de produtos
- **Validações de estoque** - Disponibilidade, quantidade mínima/máxima
- **Validações de usuário** - Permissões, status da conta

## Como Rodar

### Rodar todos os testes de validações:
```bash
cd web
npx cypress run --e2e --spec "cypress/e2e/vendas/validacoes/*.cy.ts"
```

### Rodar um teste específico:
```bash
cd web
npx cypress run --e2e --spec "cypress/e2e/vendas/validacoes/[nome-do-arquivo].cy.ts"
```

## Padrões Esperados

- **Validação em tempo real** - Feedback imediato ao usuário
- **Mensagens contextuais** - Erros explicados com exemplos
- **Prevenção de envio** - Formulários inválidos não podem ser submetidos
- **Acessibilidade** - Erros associados a elementos via aria-describedby

## Comandos Customizados Utilizados

- `cy.autenticarViaApi(email, senha)` - Autenticação via API
- `cy.prepararCarrinhoSincronizado()` - Prepara carrinho via API
- `cy.verificarValidacaoCampo(campo, mensagem)` - Valida mensagem de erro específica
- `cy.tentarSubmeterFormularioInvalido()` - Tenta enviar formulário com erros

## Critérios de Sucesso

✅ **Validação frontend** - Erros detectados antes do envio ao backend  
✅ **Mensagens úteis** - Usuário entende o que corrigir  
✅ **Foco automático** - Primeiro campo inválido recebe foco  
✅ **Consistência** - Mesmas regras validadas em frontend e backend  

## Relacionamento com Outros Testes

- **Caminho feliz** - `../caminho-feliz/` - Fluxo ideal sem validações
- **Falhas** - `../falhas/` - Testes de cenários de erro
- **Clientes** - `../../clientes/` - Validações de dados do cliente