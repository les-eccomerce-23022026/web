# Web - Frontend LES (Livraria)

Frontend React + TypeScript responsável pelas jornadas de cliente e administração, consumindo a API do módulo `backend`.

## Contexto no monorepo

- Visão geral do projeto: [`../README.md`](../README.md)
- API e regras de backend: [`../backend/README.md`](../backend/README.md)
- Requisitos e ADRs (SSoT): [`../documentacao-exigida/README.md`](../documentacao-exigida/README.md)

## Stack e arquitetura

- React 19 + Vite 7 + TypeScript
- Estado global com Redux Toolkit
- Roteamento com `react-router-dom`
- Testes unitários com Vitest + Testing Library
- Testes E2E com Cypress

## Execução local

```bash
npm install
npm run dev
```

Aplicação disponível em `http://localhost:5173`.

## Integração com backend (sessão e API)

- Por padrão, `VITE_API_BASE_URL=/api`.
- O Vite faz proxy para `http://localhost:3000`, preservando mesma origem no navegador durante desenvolvimento.
- O cliente HTTP usa `credentials: include` para cookies HttpOnly de sessão.
- O JWT não é persistido em `sessionStorage`; apenas snapshot de `user` pode ser mantido para UX.
- Se usar backend em outra origem, configure `SameSite=None; Secure` e HTTPS.

## Build e qualidade

| Comando | Objetivo |
| --- | --- |
| `npm run build` | Build de produção |
| `npm run preview` | Servir build localmente |
| `npm run lint` | Verificação estática frontend |

## Guia rápido de testes

### Estratégia

| Comando | Escopo |
| --- | --- |
| `npm test` | Testes unitários do frontend (Vitest) |
| `npm run test:unit` | Alias explícito para suíte unitária |
| `npm run test:unit:watch` | Modo watch para TDD local |
| `npm run test:e2e` | E2E completo com Cypress |

### Domínio funcional (Vitest)

| Domínio | Comando |
| --- | --- |
| Finalização de compra | `npm run test:unit:finalizacao-compra` |
| Meus pedidos | `npm run test:unit:meus-pedidos` |
| Pagamentos | `npm run test:unit:pagamentos` |
| Carrinho | `npm run test:unit:carrinho` |
| Checkout (agregado) | `npm run test:dominio:checkout` |

### E2E por macrodomínio (Cypress)

| Domínio | Comando |
| --- | --- |
| Cliente | `npm run test:e2e:cliente` |
| Admin | `npm run test:e2e:admin` |
| Shop/Catálogo | `npm run test:e2e:shop` |
| Fluxos ponta a ponta | `npm run test:e2e:fluxo` |
| UI/UX | `npm run test:e2e:ui-ux` |

## Documentação local

- Quadro de trabalho frontend: [`docs/PROJECT-BOARD.md`](docs/PROJECT-BOARD.md)
- Diretrizes internas do módulo: [`AGENTS.md`](AGENTS.md)
