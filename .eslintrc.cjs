module.exports = {
  root: true,
  env: {
    browser: true,
    es2022: true,
    node: true,
    'cypress/globals': true
  },
  extends: [
    'eslint:recommended',
    '@typescript-eslint/recommended',
    'plugin:cypress/recommended'
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    project: './tsconfig.json'
  },
  plugins: [
    '@typescript-eslint',
    'cypress',
    'cypress-page-object'
  ],
  rules: {
    // Regras gerais
    'no-console': 'warn',
    'no-debugger': 'error',
    'no-unused-vars': 'off',
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-non-null-assertion': 'warn',
    
    // Regras específicas para Cypress
    'cypress/no-unnecessary-waiting': 'error',
    'cypress/force-detection': 'error',
    'cypress/no-assigning-return-values': 'error',
    'cypress/no-pausing-until-debug': 'error',
    'cypress/no-force-wait': 'warn',
    'cypress/await-async-utils': 'error',
    'cypress/no-async-before': 'error',
    'cypress/no-async-tests': 'error',
    
    // Regras customizadas para Page Objects
    'cypress-page-object/no-duplicate-selectors': 'error',
    'cypress-page-object/getter-returns-chainable': 'error',
    'cypress-page-object/consistent-naming': 'warn',
    'cypress-page-object/no-fragile-selectors': 'error',
    'cypress-page-object/no-hardcoded-waits': 'warn',
    'cypress-page-object/prefer-data-cy': 'error',
    
    // Regras de código limpo
    'prefer-const': 'error',
    'no-var': 'error',
    'object-shorthand': 'error',
    'prefer-template': 'error',
    
    // Regras de segurança
    'no-eval': 'error',
    'no-implied-eval': 'error',
    'no-new-func': 'error',
    'no-script-url': 'error'
  },
  overrides: [
    {
      // Configuração específica para arquivos de Page Objects
      files: ['cypress/support/pages/**/*.ts'],
      rules: {
        'cypress-page-object/no-duplicate-selectors': 'error',
        'cypress-page-object/getter-returns-chainable': 'error',
        'cypress-page-object/consistent-naming': 'error',
        'cypress-page-object/prefer-data-cy': 'error',
        '@typescript-eslint/no-explicit-any': 'off' // Permitir any em Page Objects por enquanto
      }
    },
    {
      // Configuração específica para testes E2E
      files: ['cypress/e2e/**/*.cy.ts'],
      rules: {
        'cypress/no-unnecessary-waiting': 'warn',
        'cypress/force-detection': 'warn',
        '@typescript-eslint/no-explicit-any': 'off'
      }
    },
    {
      // Configuração específica para arquivos de configuração
      files: ['cypress.config.ts', 'cypress/**/*.config.ts'],
      rules: {
        'no-console': 'off',
        '@typescript-eslint/no-explicit-any': 'off'
      }
    }
  ],
  globals: {
    cy: 'readonly',
    Cypress: 'readonly',
    describe: 'readonly',
    context: 'readonly',
    it: 'readonly',
    before: 'readonly',
    beforeEach: 'readonly',
    after: 'readonly',
    afterEach: 'readonly'
  }
};