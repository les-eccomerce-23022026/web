# Cypress E2E Tests - E-commerce de Livros

## 📋 Visão Geral

Este diretório contém os testes E2E do e-commerce de livros, implementados com Cypress. Os testes cobrem fluxos críticos de negócio, desde navegação no catálogo até finalização de pedidos, passando por autenticação, pagamentos e gestão administrativa.

## 🚀 Como Rodar os Testes

### Pré-requisitos

- Node.js instalado
- Backend rodando em `http://localhost:3001/api`
- Frontend Next.js rodando em `http://localhost:3001`

### Configuração de Variáveis de Ambiente

As variáveis de ambiente são **obrigatórias** e devem ser configuradas em `cypress.env.json`:

```json
{
  "apiUrl": "http://localhost:3001/api",
  "admin": {
    "email": "admin@livraria.com.br",
    "senha": "Admin@123"
  },
  "cliente": {
    "email": "email.teste@gmail.com",
    "senha": "@asdfJKLÇ123"
  },
  "adminLojaA": {
    "email": "admin_loja_a@email.com",
    "senha": "SenhaAdminA123!"
  },
  "adminLojaB": {
    "email": "admin_loja_b@email.com",
    "senha": "SenhaAdminB123!"
  }
}
```

### Comandos

```bash
# Rodar todos os testes em modo headless
npm run test:e2e

# Rodar testes com interface Cypress
npm run test:e2e:open

# Rodar um arquivo específico
npx cypress run --spec "cypress/e2e/catalogo/home-listagem.cy.ts"

# Rodar com variáveis de ambiente via CLI
CYPRESS_apiUrl=http://localhost:3001/api npx cypress run
```

## 📁 Estrutura de Diretórios

```
cypress/
├── e2e/                      # Testes E2E organizados por domínio
│   ├── admin/               # Testes do painel administrativo
│   ├── autenticacao/       # Testes de login e registro
│   ├── carrinho/           # Testes do carrinho de compras
│   ├── catalogo/           # Testes do catálogo de livros
│   ├── clientes/           # Testes da área do cliente
│   ├── configuracao/       # Testes de configuração (loja ativa)
│   ├── entregas/           # Testes de entrega e despacho
│   ├── ia/                 # Testes do assistente de recomendação
│   ├── notificacoes/       # Testes de notificações
│   ├── pagamentos/         # Testes de pagamentos
│   ├── responsividade/     # Testes de responsividade
│   ├── trocas/             # Testes de trocas e devoluções
│   └── vendas/             # Testes de fluxos de venda
├── support/                 # Arquivos de suporte
│   ├── commands.ts         # Comandos customizados Cypress
│   ├── constants.ts        # Constantes globais
│   ├── e2e.ts             # Configuração de testes
│   ├── helpers/           # Funções auxiliares
│   ├── intercepts/        # Intercepts de API
│   ├── pages/             # Page Objects
│   └── validators/        # Validadores customizados
├── cypress.config.cjs      # Configuração do Cypress
└── cypress.env.json       # Variáveis de ambiente
```

## 🏗️ Estratégia de Testes

### Page Objects Pattern

Os testes usam Page Objects para encapsular interações com a UI:

```typescript
// Exemplo de uso
import { LoginPage } from '../support/pages/auth/LoginPage';

LoginPage.emailInput.type('cliente@email.com');
LoginPage.passwordInput.type('senha123');
LoginPage.submitButton.click();
```

### Comandos Customizados

Comandos customizados estão em `support/commands.ts` e podem ser usados nos testes:

```typescript
// Autenticação programática
cy.loginProgramatico('cliente');
cy.autenticarAdministradorViaApi();

// Gestão de carrinho
cy.limparCarrinhoViaApi();
cy.adicionarAoCarrinhoViaApi(livroUuid);

// Gestão de dados de teste
cy.garantirEnderecoViaApi();
cy.garantirCartoesViaApi();
```

### Organização por Domínio

Os testes são organizados por domínio de negócio:

- **Catalogo**: Navegação, busca, detalhes de livros
- **Autenticação**: Login, registro, proteção de rotas
- **Carrinho**: Adição, remoção, cálculo de frete
- **Checkout**: Finalização de compra, seleção de endereço
- **Pagamentos**: Cartões, PIX, validações
- **Vendas**: Fluxo completo, falhas, caminho feliz
- **Trocas**: Solicitação, autorização, cupom de troca
- **Admin**: Gestão de livros, pedidos, clientes
- **IA**: Assistente de recomendação, segurança

## 📝 Como Adicionar Novos Testes

### 1. Escolha o Domínio

Identifique em qual domínio o teste se encaixa e crie o arquivo na pasta correspondente.

### 2. Use Page Objects

Importe os Page Objects existentes ou crie novos em `support/pages/`:

```typescript
import { CatalogoPage } from '../../support/pages/catalogo/CatalogoPage';
```

### 3. Siga os Padrões

- Use `describe` para agrupar testes relacionados
- Use `it` para cada caso de teste
- Use `beforeEach` para setup comum
- Use comandos customizados quando possível
- Use seletores `data-cy` para resiliência

### 4. Exemplo de Teste

```typescript
describe('Catálogo — Busca de Livros', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('deve exibir resultados ao buscar por termo válido', () => {
    CatalogoPage.campoBusca.type('programação');
    CatalogoPage.botaoBuscar.click();
    
    CatalogoPage.resultadosBusca.should('have.length.greaterThan', 0);
  });
});
```

## 🔧 Padrões e Convenções

### Naming de Arquivos

- Use `kebab-case.cy.ts` para arquivos de teste
- Ex: `login-admin.cy.ts`, `gerenciar-carrinho.cy.ts`

### Seletores

- Use `data-cy` para seletores de elementos
- Evite seletores frágeis como classes CSS ou texto
- Ex: `cy.getDataCy('login-button')`

### Autenticação

- Use `cy.loginProgramatico()` para autenticação rápida
- Use `cy.autenticarViaApi()` para autenticação via API
- Evite preencher formulários de login manualmente

### Dados de Teste

- Use comandos customizados para preparar dados
- Limpe dados após os testes em `afterEach`
- Use banco de testes quando disponível

## 🐛 Debug

### Modo Interativo

```bash
npm run test:e2e:open
```

### Logs Detalhados

```bash
E2E_VERBOSE_LOGS=1 npm run test:e2e
```

### Screenshots

Screenshots são tirados automaticamente em caso de falha e salvos em `cypress/screenshots/`.

## 📊 Cobertura

Atualmente temos **119 testes** cobrindo:

- ✅ Catálogo e navegação
- ✅ Autenticação e autorização
- ✅ Carrinho e checkout
- ✅ Pagamentos (cartão, PIX)
- ✅ Fluxos de venda (feliz e falhas)
- ✅ Trocas e devoluções
- ✅ Painel administrativo
- ✅ Multi-tenancy
- ✅ Assistente de IA
- ✅ Responsividade

## 🔒 Segurança

- Credenciais configuradas via variáveis de ambiente
- Senhas nunca hardcoded nos testes
- Tokens JWT gerados via API real
- Testes de segurança para XSS e injeção

## 📚 Recursos Adicionais

- [Documentação Oficial Cypress](https://docs.cypress.io/)
- [Page Objects Pattern](https://www.cypress.io/blog/2019/01/03/understanding-cypress-page-objects/)
- [Best Practices](https://docs.cypress.io/guides/references/best-practices)
