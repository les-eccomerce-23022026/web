# Testes de Checkout - Pagamentos

Esta pasta contém testes E2E que validam o processo de pagamento durante o checkout.

## Tipos de Testes

- **Seleção de método** - Escolha entre cartão, PIX, boleto
- **Preenchimento de dados** - Formulários de cartão e endereço de cobrança
- **Validação de cartão** - Algoritmo Luhn, bandeiras, validade
- **Processamento PIX** - Geração de QR code e cópia e cola
- **Split de pagamento** - Múltiplos cartões em uma compra
- **Cálculo de parcelas** - Juros e taxas aplicadas corretamente

## Como Rodar

### Rodar todos os testes de checkout:
```bash
cd web
npx cypress run --e2e --spec "cypress/e2e/pagamentos/checkout/*.cy.ts"
```

### Rodar um teste específico:
```bash
cd web
npx cypress run --e2e --spec "cypress/e2e/pagamentos/checkout/[nome-do-arquivo].cy.ts"
```

## Padrões Esperados

- **Validação em tempo real** - Erros detectados antes do envio
- **Mascaramento de dados** - Números de cartão protegidos
- **Cálculos precisos** - Totais, parcelas e taxas corretos
- **UX intuitiva** - Fluxo claro com feedback adequado
- **Segurança** - Dados sensíveis nunca expostos

## Comandos Customizados Utilizados

- `cy.autenticarViaApi(email, senha)` - Autenticação via API
- `cy.prepararCarrinhoSincronizado()` - Prepara carrinho via API
- `cy.acessarCheckoutPagamento()` - Navega para etapa de pagamento
- `cy.selecionarMetodoPagamento(metodo)` - Escolhe forma de pagamento
- `cy.preencherDadosCartao(cartao)` - Preenche formulário de cartão
- `cy.gerarPagamentoPix()` - Inicia processo PIX
- `cy.configurarSplitPagamento(metodos)` - Divide pagamento em múltiplos
- `cy.verificarResumoPagamento()` - Valida totais e taxas

## Critérios de Sucesso

✅ **Dados seguros** - Informações sensíveis protegidas  
✅ **Validação robusta** - Formatos e regras verificados  
✅ **Cálculos corretos** - Valores finais precisos  
✅ **UX fluida** - Processo intuitivo e sem atritos  

## Relacionamento com Outros Testes

- **Vendas** - `../../vendas/caminho-feliz/` - Fluxo completo de compra
- **Cartões** - `../../clientes/cartoes/` - Cartões salvos do cliente
- **Falhas** - `../falhas/` - Cenários de erro no pagamento
- **Entregas** - `../../entregas/` - Próxima etapa após pagamento