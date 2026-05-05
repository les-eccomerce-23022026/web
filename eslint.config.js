import js from '@eslint/js'
import globals from 'globals'
import react from 'eslint-plugin-react'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'

export default tseslint.config(
  { ignores: ['dist/**', 'coverage/**', 'node_modules/**', '.next/**', 'src/pages-react-router/**'] },
  {
    files: ['cypress/**/*.{ts,tsx}'],
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    languageOptions: {
      globals: globals.browser,
    },
    rules: {
      '@typescript-eslint/no-unused-expressions': 'off',
    },
  },
  {
    files: ['src/**/*.{ts,tsx}', 'app/**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      ...tseslint.configs.recommended,
      react.configs.flat.recommended,
      react.configs.flat['jsx-runtime'],
      reactHooks.configs.flat.recommended,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        ecmaFeatures: { jsx: true },
      },
    },
    settings: {
      react: { version: 'detect' },
    },
    rules: {
      'react/function-component-definition': [
        'error',
        { namedComponents: 'arrow-function' },
      ],
      'max-lines': [
        'warn',
        { max: 150, skipBlankLines: true, skipComments: true },
      ],
      complexity: ['error', { max: 15 }],
      'react/prop-types': 'off',
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_' },
      ],
      'no-restricted-syntax': [
        'error',
        {
          selector: "MemberExpression[object.name='crypto'][property.name='randomUUID']",
          message: 'Use generateSafeId() de @/utils/generateId — crypto.randomUUID quebra em HTTP/contextos não-seguros.',
        },
        {
          selector: 'IfStatement > BlockStatement.consequent + BlockStatement.alternate',
          message: 'Evite else/else if. Prefira guard clauses com retorno antecipado.',
        },
      ],
      'no-restricted-imports': [
        'warn',
        {
          patterns: ['../../../*', '../../../../*', '../../../../../*'],
        },
      ],
      'react-hooks/rules-of-hooks': 'off',
      'react-hooks/error-boundaries': 'off',
    },
  },
  {
    files: ['app/page.tsx', 'app/**/page.tsx', 'app/not-found.tsx', 'app/layout.tsx'],
    rules: {
      'react/function-component-definition': 'off',
    },
  },
)
