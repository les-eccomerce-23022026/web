# Testes E2E - Estrutura User-Centric

Esta pasta contém a suíte de testes End-to-End organizada seguindo o padrão **user-centric**, focada no comportamento real dos usuários do e-commerce de livros.

## 🎯 Filosofia e Princípios

### User-Centric Testing
Nossos testes simulam **jornadas reais de usuários** (clientes e administradores) executando tarefas de negócio através da interface, priorizando:

- **Comportamento sobre implementação** - Testamos o que o usuário faz, não como o sistema funciona internamente
- **1 comportamento por arquivo** - Cada teste foca em um único fluxo ou cenário específico
- **Feedback rápido** - Testes pequenos e isolados para debug eficiente
- **Realismo** - Intações genuínas na UI, mínimo de bypass via API dentro dos testes

### Domínios Organizacionais
A estrutura está dividida por domínios de negócio, refletindo como os usuários pensam e utilizam o sistema:

```
📦 vendas/          # Jornada de compra do cliente
👤 clientes/        # Gestão de conta e dados pessoais  
⚙️  admin/           # Operações administrativas
💳 pagamentos/       # Processos de pagamento
📦 entregas/        # Logística e expedição
🔄 trocas/           # Devoluções e trocas
```

## 📁 Estrutura Completa

### Vendas - Jornada do Cliente
```
vendas/
├── caminho-feliz/          # ✅ Fluxo ideal dividido em etapas
│   ├── 01-carrinho.cy.ts
│   ├── 02-checkout-preparacao.cy.ts
│   ├── 03-frete.cy.ts
│   ├── 04-cupom.cy.ts
│   ├── 05-pagamento-finalizacao.cy.ts
│   └── 06-pedido-confirmado.cy.ts
├── falhas/                 # 🆕 Cenários de erro e exceções
└── validacoes/             # 🆕 Regras de negócio e validações
```

### Clientes - Gestão de Conta
```
clientes/
├── perfil/                 # 🆕 Dados pessoais e segurança
├── enderecos/              # 🆕 Endereços de entrega e cobrança
└── cartoes/                # 🆕 Métodos de pagamento salvos
```

### Admin - Operações Administrativas
```
admin/
├── pedidos/                # 🆕 Gestão de pedidos
├── clientes/               # 🆕 Visão administrativa dos clientes
└── livros/                 # 🆕 Catálogo e estoque
```

### Pagamentos - Processos Financeiros
```
pagamentos/
├── checkout/               # 🆕 Fluxo de pagamento
└── falhas/                 # 🆕 Erros e exceções
```

### Entregas - Logística
```
entregas/
├── despacho/               # 🆕 Processo de expedição
└── falhas/                # 🆕 Problemas de entrega
```

### Trocas - Devoluções
```
trocas/
├── solicitacao/           # 🆕 Pedido de troca pelo cliente
└── autorizacao/          # 🆕 Análise e aprovação admin
```

## 🚀 Como Rodar os Testes

### Rodar Todos os Testes
```bash
cd web
npx cypress run --e2e --spec "cypress/e2e/**/*.cy.ts"
```

### Rodar por Domínio
```bash
# Vendas
npx cypress run --e2e --spec "cypress/e2e/vendas/**/*.cy.ts"

# Clientes  
npx cypress run --e2e --spec "cypress/e2e/clientes/**/*.cy.ts"

# Admin
npx cypress run --e2e --spec "cypress/e2e/admin/**/*.cy.ts"
```

### Rodar Caminho Feliz Completo
```bash
npx cypress run --e2e --spec "cypress/e2e/vendas/caminho-feliz/*.cy.ts"
```

### Rodar em Modo Interativo
```bash
cd web
npx cypress open
# Navegue até a pasta desejada
```

## 🛠️ Comandos Customizados Disponíveis

### Autenticação
- `cy.autenticarViaApi(email, senha)` - Login cliente via API
- `cy.autenticarAdminViaApi(email, senha)` - Login admin via API

### Preparação de Dados
- `cy.prepararCarrinhoSincronizado()` - Carrinho com itens via API
- `criarVendaAprovadaViaApi()` - Pedido completo para testes
- `cy.garantirEnderecoViaApi()` - Endereço de teste disponível
- `cy.garantirCartoesViaApi()` - Cartões de pagamento salvos

### Checkout e Pagamento
- `cy.checkoutPreencherFretePadrao(cep)` - CEP e cotação de frete
- `cy.checkoutAplicarCupom(codigo)` - Aplicação de desconto
- `cy.checkoutIrFinalizarCompra()` - Navegação para pagamento
- `cy.checkoutSelecionarCartaoSalvoPreferido()` - Método preferido
- `cy.checkoutPreencherPixCobrindoTotal()` - Pagamento PIX

### Admin e Logística
- `cy.despacharPedidoViaApi(vendaUuid)` - Marcar como despachado
- `cy.confirmarEntregaViaApi(vendaUuid)` - Finalizar entrega

## 📊 Critérios de Qualidade

### Padrões Obrigatórios
✅ **1 comportamento por arquivo** - Testes pequenos e focados  
✅ **Seletores resilientes** - Uso exclusivo de `data-cy`  
✅ **Sem waits fixos** - Evitar `cy.wait(ms)` para fins visuais  
✅ **Mensagens claras** - `it()` descritivos em português  
✅ **Setup via API** - Estado inicial preparado programaticamente  

### Validações de UX
✅ **Feedback imediato** - Erros detectados antes do envio  
✅ **Mensagens contextuais** - Usuário entende o que fazer  
✅ **Recuperação elegante** - Sistema lida bem com falhas  
✅ **Estado consistente** - Dados mantidos íntegros  

### Segurança e Performance
✅ **Dados sensíveis protegidos** - Nunca expostos em logs  
✅ **Operações auditadas** - Ações importantes registradas  
✅ **Validações frontend/backend** - Consistência garantida  

## 🔄 Relacionamento entre Testes

### Fluxos Principais
```
Cliente (vendas/caminho-feliz) 
    ↓
Pagamento (pagamentos/checkout)
    ↓  
Admin (admin/pedidos)
    ↓
Despacho (entregas/despacho)
    ↓
Entrega (entregas/falhas)
```

### Suporte e Manutenção
```
Perfil (clientes/perfil) ←→ Endereços (clientes/enderecos) ←→ Cartões (clientes/cartoes)
    ↓                    ↓                    ↓
Checkout (pagamentos/checkout) ←→ Admin (admin/clientes)
```

## 📋 Melhores Práticas

### Antes de Escrever um Teste
1. **Defina o comportamento** - O que o usuário está tentando fazer?
2. **Identifique o domínio** - Onde este teste deve viver?
3. **Verifique se já existe** - Não duplicar cenários
4. **Pense no setup** - Qual estado inicial é necessário?

### Durante a Escrita
1. **Use Page Objects** - Encapsule interações complexas
2. **Prefira comandos customizados** - Reutilize lógica de setup
3. **Valide o resultado real** - Não apenas o estado interno
4. **Teste o feedback** - Mensagens e notificações ao usuário

### Após a Escrita
1. **Revista o nome** - Está claro e descritivo?
2. **Verifique o tamanho** - Menos de 150 linhas idealmente
3. **Teste isoladamente** - Funciona sem depender de outros?
4. **Documente se necessário** - README.md do domínio

## 🐛 Debug e Troubleshooting

### Problemas Comuns
- **Testes lentos** - Reduza setup, use mais API
- **Flaky tests** - Verifique waits e assíncronos
- **Seletores frágeis** - Mude para `data-cy`
- **Dependências** - Isolamento entre testes

### Ferramentas Úteis
```bash
# Debug específico
npx cypress run --e2e --spec "arquivo.cy.ts" --debug

# Apenas um teste
npx cypress run --e2e --spec "arquivo.cy.ts" --grep "nome do teste"

# Headed mode para visualizar
npx cypress run --e2e --spec "arquivo.cy.ts" --headed
```

## 📈 Evolução e Manutenção

### Próximos Passos
1. **Migração gradual** - Mover testes existentes para nova estrutura
2. **Cobertura expande** - Adicionar cenários edge cases
3. **Performance otimiza** - Paralelismo e execução rápida
4. **Documentação viva** - Manter READMEs atualizados

### Contribuição
- Siga os padrões estabelecidos
- Documente novos cenários
- Mantenha 1 comportamento por arquivo
- Use português em tudo

---

**Referência**: `vendas/caminho-feliz/` mantido como exemplo ideal da estrutura user-centric.