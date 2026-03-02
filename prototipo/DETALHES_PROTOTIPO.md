# Detalhes do Protótipo E-commerce (LES 2026)

Este documento descreve as especificações técnicas, o tema e os requisitos de negócio aplicados ao protótipo do projeto LES E-commerce 2026.

---

## 1. Tema e Identidade Visual

**Livraria Online Premium (Inspirada na Barnes & Noble)**
Uma interface sofisticada que une a estética de uma livraria física tradicional com a velocidade e funcionalidade de um e-commerce moderno.

- **Paleta de Cores:**
  - **Verde Floresta (#0F4C3A):** Usado para ações principais e branding.
  - **Off-white (#FDFBF7):** Fundo que reduz o cansaço visual, lembrando páginas de livros físicos.
- **Tipografia:** Uso equilibrado de fontes com serifa (Merriweather/Georgia) para títulos e sem serifa (Lato/Inter) para legibilidade.
- **UX Atmosphere:** Foco total na capa dos livros e clareza de informações.

---

## 2. Stack Tecnológica

O projeto utiliza tecnologias de ponta para garantir performance e manutenibilidade:

- **Frontend:** [React 19](https://react.dev/) & [Vite 7](https://vite.dev/) (HMR Ultra-fast)
- **Linguagem:** [TypeScript 5](https://www.typescriptlang.org/) (Tipagem estática e segurança de código)
- **Estado Global:** [Redux Toolkit](https://redux-toolkit.js.org/) (Gestão centralizada de fluxos complexos)
- **Roteamento:** [React Router Dom 7](https://reactrouter.com/) (Navegação SPA fluida)
- **Estilização:** CSS Modules (Padrão BEM, isolamento de escopo, zero CSS inline)
- **Analytics:** [Chart.js](https://www.chartjs.org/) (Dashboards administrativos dinâmicos)
- **Testes:** [Cypress 15](https://www.cypress.io/) (Testes E2E e de Componentes determinísticos)

---

## 3. Requisitos e Regras de Negócio (RNs)

Abaixo estão detalhados os pilares funcionais e as regras levantadas para o projeto, devidamente numerados para rastreabilidade:

### Requisitos Funcionais (RF)

1. **[RF0026] Múltiplos Endereços:** Suporte nativo para múltiplos endereços (residencial e entrega) com cálculo de frete dinâmico.
2. **[RF0031] Carrinho Resiliente:** Itens persistidos via `localStorage`, garantindo a recuperação da sacola em qualquer sessão.
3. **[RF] Sincronização entre Abas:** Redux + Storage Events para atualização em tempo real do estado global.
4. **[RF0055] Análise de Vendas (Dashboard):** Visualização gráfica de métricas de receita e volume por período. _(Implementado)_
5. **[RF0051] Gestão Administrativa de Estoque:** Controle de entrada e ajuste de quantidades de livros.
6. **[RF0040] Fluxo de Troca e Devolução:** Funcionalidade de solicitação de troca integrada ao histórico de pedidos.

### Requisitos Não Funcionais (RNF)

1. **[RNF0031] Senha Forte:** Validação rigorosa de complexidade (mín. 8 caracteres, letras maiúsculas/minúsculas, números e símbolos).
2. **[RNF0033] Criptografia:** Armazenamento de credenciais utilizando algoritmos de Hash (BCrypt) para impedir vazamento de senhas.
3. **[RNF] Fluxo Distraction-free:** Ocultação de menus e banners durante a finalização da compra para foco total na conversão.
4. **[RNF] Feedback de Progresso:** Indicadores Visuais claros das etapas (Identificação → Entrega → Pagamento).
5. **[RNF] DDD (Domain-Driven Design):** Organização modular por domínios (Vendas, Catálogo, Admin) para alta escalabilidade.
6. **[RNF] Princípios SOLID:** Código desacoplado e altamente testável para manutenibilidade a longo prazo.

### Regras de Negócio (RN)

1. **[RN0026] Extensão de Contrato:** Coleta padronizada de dados (Gênero, Data de Nascimento e Telefone).
2. **[RN] Restrição de Criação de Admin:** Regra de que apenas um admin autenticado pode criar outro (não há rota pública). _(Implementado)_

---

## 4. Repositórios e Gestão do Projeto

- **Repositório Público do Protótipo:** [github.com/les-eccomerce-23022026/web](https://github.com/les-eccomerce-23022026/web)
- **Gestão Ágil (Kanban):** [GitHub Projects - LES E-commerce](https://github.com/orgs/les-eccomerce-23022026/projects/1)

---

> **Nota:** Este documento foi gerado automaticamente integrando as especificações contidas na documentação técnica oficial e nos arquivos de configuração do projeto.
