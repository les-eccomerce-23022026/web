# Testes de Cartões do Cliente

Esta pasta contém testes E2E que validam o gerenciamento de cartões de crédito e métodos de pagamento do cliente.

## Tipos de Testes

- **Cadastro de cartão** - Novos cartões com validação de dados
- **Edição** - Atualização de apelido, validade, preferência
- **Exclusão** - Remoção de cartões não utilizados
- **Seleção padrão** - Definição de cartão principal
- **Validação de bandeira** - Identificação automática via número
- **Tokenização segura** - Armazenamento seguro dos dados

## Como Rodar

### Rodar todos os testes de cartões:
```bash
cd web
npx cypress run --e2e --spec "cypress/e2e/clientes/cartoes/*.cy.ts"
```

### Rodar um teste específico:
```bash
cd web
npx cypress run --e2e --spec "cypress/e2e/clientes/cartoes/[nome-do-arquivo].cy.ts"
```

## Padrões Esperados

- **Mascaramento de dados** - Números exibidos parcialmente (****-****-****-1234)
- **Validação frontend** - Formatos e algoritmos (Luhn) aplicados
- **Segurança** - Dados sensíveis nunca expostos em logs
- **Limite de cartões** - Restrição de quantidade por cliente
- **Cartões em uso** - Proteção contra exclusão de cartões ativos

## Comandos Customizados Utilizados

- `cy.autenticarViaApi(email, senha)` - Autenticação via API
- `cy.acessarCartoesCliente()` - Navega para página de cartões
- `cy.cadastrarCartao(cartao)` - Adiciona novo cartão
- `cy.editarCartao(cartaoId, novosDados)` - Atualiza dados do cartão
- `cy.excluirCartao(cartaoId)` - Remove cartão
- `cy.definirCartaoPadrao(cartaoId)` - Define como preferido
- `cy.validarBandeira(numero)` - Verifica bandeira do cartão

## Critérios de Sucesso

✅ **Dados seguros** - Informações sensíveis protegidas  
✅ **Validação robusta** - Formatos e algoritmos verificados  
✅ **UX intuitiva** - Processo claro com feedback adequado  
✅ **Integridade mantida** - Cartões em uso protegidos  

## Relacionamento com Outros Testes

- **Perfil** - `../perfil/` - Dados principais do cliente
- **Checkout** - `../../pagamentos/checkout/` - Uso de cartões no pagamento
- **Pagamentos** - `../../pagamentos/` - Processamento de transações
- **Falhas** - `../../pagamentos/falhas/` - Erros de processamento