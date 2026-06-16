# React + TypeScript + Next.js (LES — frontend)

## 🚀 Setup Automatizado (Recomendado)

Para configurar e iniciar o frontend automaticamente em um novo ambiente, execute:

```bash
# No diretório web
cd web
./scripts/setup-complete.sh
```

Este script automatizado irá:
- ✅ Verificar pré-requisitos (Node.js 18+, npm)
- ✅ Configurar o arquivo `.env` automaticamente
- ✅ Instalar dependências npm
- ✅ Validar configuração
- ✅ Exibir instruções para iniciar o frontend

**Documentação completa dos scripts:** [`scripts/README-SETUP.md`](scripts/README-SETUP.md)

## Sessão e API

- Por padrão `VITE_API_BASE_URL` é `/api`: o Vite faz **proxy** para `http://localhost:3000` (ver `vite.config.ts`), mantendo a **mesma origem** que o app (`localhost:5173`) para o cookie de sessão HttpOnly.
- O cliente HTTP usa `credentials: 'include'`. O JWT **não** fica em `sessionStorage`; apenas um snapshot de `user` pode ser guardado para UX.
- Com backend em outra origem (ex.: URL absoluta em `VITE_API_BASE_URL`), cookies exigem `SameSite=None; Secure` e HTTPS — prefira proxy ou mesmo host em produção.

## Autenticação de Clientes

> [!IMPORTANT]
> **Não existe URL `/login` separada.** Tanto o login quanto o registro de clientes são feitos na página **Minha Conta** (`/minha-conta`).
>
> Ao implementar funcionalidades de autenticação, redirecionamentos ou guards de rota, use sempre `/minha-conta` como a página de login/registro.

## Documentação (SSoT e quadro local)

- Especificação e ADRs: [`../documentacao-exigida/README.md`](../documentacao-exigida/README.md)
- Kanban frontend: [`docs/PROJECT-BOARD.md`](docs/PROJECT-BOARD.md)
- Diretrizes de agente: [`AGENTS.md`](AGENTS.md)

## Testes E2E (Cypress)

**Importante (Ubuntu 24.04 / erro "bad option: --no-sandbox"):**

O projeto usa Cypress ^13.17.0. O `cypress.config.cjs` agora injeta `--no-sandbox` **apenas** em ambientes CI/Docker/root (detecção automática via `/.dockerenv`, cgroup, `getuid() === 0` e variáveis de CI).

Se você ainda vir o erro em ambiente desktop:

1. Rode o reset (limpa binários v12 antigos):
   ```bash
   cd web
   npm run cypress:reset
   # ou
   bash scripts/ensure-cypress.sh
   ```

2. Use preferencialmente o alvo de CI (usa Electron embutido):
   ```bash
   npm run test:e2e:ci
   npm run test:e2e:ci:spec 'cypress/e2e/autenticacao/**/*.cy.ts'
   ```

3. Override manual (raro):
   ```bash
   CYPRESS_NO_SANDBOX=1 npm run test:e2e:ci
   ```

Isso resolve o problema recorrente de agentes/ferramentas caírem em "análise estática apenas porque Cypress falhou".

## Scripts Úteis

| Comando | Descrição |
|---------|-----------|
| `npm run dev` | Iniciar frontend em desenvolvimento (porta 3000) |
| `npm run build` | Build para produção |
| `npm run start` | Iniciar produção |
| `npm run lint` | Executar lint |
| `./scripts/setup-complete.sh` | Setup completo automático |
| `./scripts/check-prerequisitos.sh` | Verificar pré-requisitos |
| `./scripts/setup-env.sh` | Configurar arquivo .env |

## Contexto no Monorepo

- Backend API: [`../backend/README.md`](../backend/README.md)
- Visão geral do projeto: [`../README.md`](../README.md)
- Especificação e ADRs: [`../documentacao-exigida/README.md`](../documentacao-exigida/README.md)

### Fluxo de Compra Principal (Visual / Headed)

```bash
npm run test:e2e:fluxo-compra:headed
```

Executa os principais cenários de compra (happy path completo + cross-domain + evidências visuais).

### Comandos Mais Usados (sempre a partir de `web/`)

```bash
# Headless (recomendado para CI/Linux — usa Electron embutido, sem precisar de Chrome/GTK)
npm run test:e2e
npm run test:e2e:ci                 # alias explícito para Electron
npm run test:e2e:autenticacao
npm run test:e2e:catalogo
npm run test:e2e:fluxo-checkout

# Com navegador visível (pode exigir libs do sistema para Chrome)
npm run test:e2e:fluxo-compra:headed
npm run test:e2e:autenticacao:headed

# Modo interativo (Cypress GUI)
npm run test:e2e:open

# Manutenção
npm run cypress:install
npm run cypress:verify
npm run cypress:reset               # limpa v12 + reinstall v13
```

Dica: para rodar specs específicas sem editar package.json use `npm run test:e2e:ci:spec 'cypress/e2e/autenticacao/**/*.cy.ts'`

Consulte também:
- `cypress/TESTING_CONVENTIONS.md`
- `cypress/support/commands.ts` (comandos customizados como `cy.loginCliente()`)
- `package.json` (scripts test:e2e:* )

---

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
