# Design System - CSS Architecture

## Estrutura de Pastas

```
src/styles/
├── tokens/          # Design Tokens (Single Responsibility)
│   ├── breakpoints.css   # Media queries por dispositivo
│   ├── colors.css        # Paleta de cores semântica
│   ├── spacing.css       # Escala de espaçamentos
│   └── typography.css    # Sistema tipográfico
├── base/            # Estilos base
│   ├── reset.css         # Reset CSS moderno
│   └── globals.css       # Estilos globais (importa tokens)
├── components/      # Componentes reutilizáveis (BEM)
│   ├── buttons/
│   ├── cards/
│   └── forms/
└── utilities/       # Classes utilitárias
    └── helpers.css       # Classes reutilizáveis
```

## Princípios SOLID Aplicados

### Single Responsibility Principle (SRP)
- Cada arquivo CSS tem uma única responsabilidade
- `tokens/` contém apenas variáveis CSS
- `components/` contém apenas componentes específicos
- `utilities/` contém apenas classes utilitárias

### Open/Closed Principle (OCP)
- Tokens são abertos para extensão (novas cores, espaçamentos)
- Fechados para modificação (não altera tokens existentes)
- Componentes usam tokens, não valores hardcoded

### Dependency Inversion Principle (DIP)
- Componentes dependem de abstrações (tokens)
- Não dependem de implementações concretas (valores hardcoded)

## Como Usar

### 1. Importar Tokens em Componentes
```css
@import '../../../src/styles/tokens/colors.css';
@import '../../../src/styles/tokens/spacing.css';

.myComponent {
  padding: var(--spacing-4);
  background: var(--color-bg-primary);
  color: var(--color-text-primary);
}
```

### 2. Usar Classes Utilitárias
```tsx
<div className="container flex items-center justify-between gap-4">
  <h1 className="text-xl font-semibold">Título</h1>
</div>
```

### 3. Media Queries com Tokens
```css
@media (max-width: 768px) {
  .container {
    padding: var(--spacing-4);
  }
}
```

## Convenções de Nomenclatura

### BEM (Block Element Modifier)
```css
.card {}                  /* Block */
.card__title {}           /* Element */
.card__title--highlighted {}  /* Modifier */
```

### CSS Modules
```css
.buttonPrimary {}         /* PascalCase para modules */
.buttonPrimary__icon {}   /* Underscore para elementos */
.buttonPrimary--disabled {}  /* Double dash para modificadores */
```

### Tokens
```css
--color-primary-500       /* category-name-shade */
--spacing-4               /* category-scale */
--font-size-xl            /* category-size */
--shadow-md               /* category-size */
```

## Breakpoints

- **Mobile**: ≤ 768px
- **Tablet/iPad**: 769px - 1024px
- **Desktop**: ≥ 1025px
- **Wide**: ≥ 1280px

## Benefícios

1. **Consistência**: Tokens garantem visual consistente
2. **Manutenibilidade**: Alterar em um lugar, reflete em todos
3. **Escalabilidade**: Fácil adicionar novos tokens/componentes
4. **Colaboração**: Design system compartilhado entre time
5. **Performance**: CSS otimizado e reutilizável
