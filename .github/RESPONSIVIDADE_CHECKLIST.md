# Checklist de Responsividade Mobile-First

Este checklist deve ser seguido em todo PR que afete UI/UX ou layouts. O objetivo é garantir consistência na abordagem mobile-first e prevenir regressões.

## Antes do PR

### CSS e Estilos
- [ ] **Mobile-First**: Base CSS é para mobile (0px+), usa `@media (min-width: ...)` para breakpoints maiores
- [ ] **Tokens de Breakpoint**: Usa variáveis CSS globais definidas em `src/index.css` (`--bp-mobile`, `--bp-mobile-lg`, `--bp-tablet`, `--bp-desktop`, `--bp-desktop-lg`)
- [ ] **Container Padrão**: Usa classe `.container` com gutters progressivos (16px → 24px → 32px)
- [ ] **Sem max-width legado**: Removeu `@media (max-width: ...)` desktop-first
- [ ] **CSS Modules**: Estilos em `.module.css` (exceto casos muito específicos)
- [ ] **Sem estilos inline**: Evita `style={{}}` exceto para propriedade 100% dinâmica

### Touch Targets
- [ ] **Botões**: Altura mínima de 44px em mobile
- [ ] **Controles interativos**: Links, inputs, selects têm área de toque adequada
- [ ] **Espaçamento**: Gap entre elementos interativos mínimo de 8px

### Layout
- [ ] **Sem overflow horizontal**: Valida que não há scroll horizontal em 375px
- [ ] **Larguras fluidas**: Usa `%`, `fr`, `minmax()` ao invés de `width: Npx` fixo
- [ ] **Grid progressivo**: 1 coluna (mobile) → 2 colunas (480px+) → auto-fit (768px+)
- [ ] **Flexbox adaptativo**: `flex-direction: column` (mobile) → `row` (tablet+)

### Imagens
- [ ] **Imagens responsivas**: Usa `width: 100%` + `max-width` quando necessário
- [ ] **Capa de livro**: `object-fit: contain` para manter proporção

## Testes

### Cypress E2E
- [ ] **Testes de responsividade**: Valida breakpoints críticos (375px, 480px, 768px, 1024px, 1440px)
- [ ] **Sem overflow**: Teste verifica `scrollWidth <= clientWidth`
- [ ] **Touch targets**: Teste valida altura mínima de 44px em elementos interativos
- [ ] **Layouts progressivos**: Teste valida grid/flex-direction em cada breakpoint

### Validação Manual
- [ ] **Mobile (375px)**: Testa em navegador mobile ou DevTools
- [ ] **Tablet (768px)**: Testa em iPad ou DevTools
- [ ] **Desktop (1024px+)**: Testa layout normal

## After PR Merge

### Documentação
- [ ] **ADR atualizado**: Se mudança significativa, atualiza ADR em `documentacao-exigida/adr/`
- [ ] **RF/RN/RNF atualizados**: Se afeta requisitos, atualiza documentação exigida

## Referências

- ADR 0005: Padrão Mobile-First de Responsividade
- Tokens de breakpoint em `src/index.css`
- Testes Cypress em `cypress/e2e/ui-ux/`
