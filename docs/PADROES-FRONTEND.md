# Padrões de Frontend

## Objetivo
Centralizar o padrão estrutural do frontend para garantir manutenção previsível e leitura rápida.

## Estrutura oficial
- Rotas: `app/**` com arquivos `page.tsx`.
- Componentes de domínio: `src/components/**`.
- Hooks de domínio: `src/hooks/**`.
- Estado global: `src/store/**`.
- Serviços: `src/services/**`.

## Regras obrigatórias
- Evitar `else` e `else if` quando guard clauses resolverem o fluxo.
- Evitar `style={{}}`; preferir `.module.css`.
- Evitar imports relativos profundos (`../../../`); preferir alias `@/`.
- Componentes devem permanecer enxutos; acima de 200 linhas, dividir por responsabilidade.
- Linguagem de domínio em português para nomes de arquivos, símbolos e textos técnicos.

## Checklist de PR
- A rota foi criada/ajustada em `app/**`?
- O componente alterado manteve responsabilidade única?
- Existe `style={{}}` novo no diff?
- Existe `else` novo no diff?
- Existe import relativo profundo novo no diff?
- O fluxo crítico foi validado localmente?

## Comandos de validação
- Relatório de padrões: `npm run padroes:check`
- Relatório estrito (falha com violação): `npm run padroes:check:strict`
- Lint geral: `npm run lint`
