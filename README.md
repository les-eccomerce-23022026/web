# React + TypeScript + Vite (LES — frontend)

## Sessão e API

- Por padrão `VITE_API_BASE_URL` é `/api`: o Vite faz **proxy** para `http://localhost:3000` (ver `vite.config.ts`), mantendo a **mesma origem** que o app (`localhost:5173`) para o cookie de sessão HttpOnly.
- O cliente HTTP usa `credentials: 'include'`. O JWT **não** fica em `sessionStorage`; apenas um snapshot de `user` pode ser guardado para UX.
- Com backend em outra origem (ex.: URL absoluta em `VITE_API_BASE_URL`), cookies exigem `SameSite=None; Secure` e HTTPS — prefira proxy ou mesmo host em produção.

## Documentação (SSoT e quadro local)

- Especificação e ADRs: [`../documentacao-exigida/README.md`](../documentacao-exigida/README.md)
- Kanban frontend: [`docs/PROJECT-BOARD.md`](docs/PROJECT-BOARD.md)
- Diretrizes de agente: [`AGENTS.md`](AGENTS.md)

## Testes E2E

### Fluxo de Compra Principal (Visual)

Para executar os testes do fluxo de compra com navegador aberto (visual):

```bash
npm run test:e2e:fluxo-compra:headed
```

Este comando executa os 3 testes principais do fluxo de compra:
- Happy Path completo (Login → Carrinho → Checkout → Frete PAC → Cupom → Cartão → Venda)
- Fluxo completo cross-domain (Cliente compra → Admin despacha → Admin entrega → Cliente solicita troca → Admin autoriza → Admin confirma recebimento → Cliente usa cupom)
- Screenshots do fluxo de venda

### Outros Comandos de Teste

```bash
# Executar fluxo de compra sem navegador (headless)
npm run test:e2e:fluxo-compra:run

# Modo interativo GUI (Cypress Test Runner)
npm run test:e2e:fluxo-compra:gui

# Happy path individual com navegador
npm run test:e2e:happy-path:headed

# Cross-domain individual com navegador
npm run test:e2e:cross-domain:headed

# Screenshots individual com navegador
npm run test:e2e:screenshots:headed
```

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
