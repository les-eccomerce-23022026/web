# Testes de Endereços do Cliente

Esta pasta contém testes E2E que validam o gerenciamento de endereços de entrega e cobrança do cliente.

## Tipos de Testes

- **Cadastro de endereço** - Novos endereços com validação de CEP
- **Edição** - Atualização de dados existentes
- **Exclusão** - Remoção de endereços não utilizados
- **Seleção padrão** - Definição de endereço principal
- **Validação de CEP** - Busca automática de endereço

## Como Rodar

### Rodar todos os testes de endereços:
```bash
cd web
npx cypress run --e2e --spec "cypress/e2e/clientes/enderecos/*.cy.ts"
```

### Rodar um teste específico:
```bash
cd web
npx cypress run --e2e --spec "cypress/e2e/clientes/enderecos/[nome-do-arquivo].cy.ts"
```

## Padrões Esperados

- **Autocomplete CEP** - Preenchimento automático via API
- **Validação de formato** - CEPs inválidos rejeitados
- **Limite de endereços** - Restrição de quantidade por cliente
- **Endereços em uso** - Proteção contra exclusão de endereços ativos

## Comandos Customizados Utilizados

- `cy.autenticarViaApi(email, senha)` - Autenticação via API
- `cy.acessarEnderecosCliente()` - Navega para página de endereços
- `cy.cadastrarEndereco(endereco)` - Cria novo endereço
- `cy.editarEndereco(enderecoId, novosDados)` - Atualiza endereço existente
- `cy.excluirEndereco(enderecoId)` - Remove endereço
- `cy.buscarEnderecoPorCep(cep)` - Simula busca via API de CEP

## Critérios de Sucesso

✅ **CEP funcional** - Busca automática funciona corretamente  
✅ **Validações aplicadas** - Campos obrigatórios e formatos respeitados  
✅ **CRUD completo** - Todas as operações funcionam  
✅ **Integridade mantida** - Endereços em uso protegidos  

## Relacionamento com Outros Testes

- **Perfil** - `../perfil/` - Dados principais do cliente
- **Checkout** - `../../vendas/caminho-feliz/` - Uso de endereços no checkout
- **Pagamentos** - `../../pagamentos/checkout/` - Endereço de cobrança
- **Entregas** - `../../entregas/` - Processos de entrega