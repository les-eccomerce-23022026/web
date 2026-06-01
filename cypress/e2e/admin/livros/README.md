# Testes de Livros - Admin

Esta pasta contém testes E2E que validam as funcionalidades administrativas de gestão do catálogo de livros.

## Tipos de Testes

- **Cadastro de livros** - Novos produtos com todas as informações
- **Edição** - Atualização de preço, estoque, descrição
- **Gerenciamento de estoque** - Controle de quantidade e disponibilidade
- **Categorização** - Organização por gênero, autor, editora
- **Visibilidade** - Ativação/desativação de produtos
- **Preços e promoções** - Definição de valores e descontos

## Como Rodar

### Rodar todos os testes de livros admin:
```bash
cd web
npx cypress run --e2e --spec "cypress/e2e/admin/livros/*.cy.ts"
```

### Rodar um teste específico:
```bash
cd web
npx cypress run --e2e --spec "cypress/e2e/admin/livros/[nome-do-arquivo].cy.ts"
```

## Padrões Esperados

- **Validações rigorosas** - Campos obrigatórios e formatos específicos
- **Upload de imagens** - Capas e galerias funcionais
- **Controle de estoque** - Sincronização com vendas em tempo real
- **SEO otimizado** - Metadados e URLs amigáveis
- **Multi-loja** - Visibilidade diferenciada por loja

## Comandos Customizados Utilizados

- `cy.autenticarAdminViaApi(email, senha)` - Autenticação admin via API
- `cy.acessarLivrosAdmin()` - Navega para página de livros
- `cy.cadastrarLivro(livro)` - Cria novo produto
- `cy.editarLivro(livroId, dados)` - Atualiza informações
- `cy.atualizarEstoque(livroId, quantidade)` - Ajusta quantidade
- `cy.configurarVisibilidade(livroId, lojas)` - Define visibilidade por loja
- `cy.uploadImagemCapa(livroId, imagem)` - Adiciona capa do livro

## Critérios de Sucesso

✅ **Dados completos** - Todas as informações do livro registradas  
✅ **Estoque preciso** - Quantidades sincronizadas com vendas  
✅ **SEO adequado** - Metadados configurados para busca  
✅ **Visibilidade controlada** - Produtos exibidos nas lojas corretas  

## Relacionamento com Outros Testes

- **Catálogo** - `../../catalogo/` - Visualização do lado do cliente
- **Vendas** - `../../vendas/` - Impacto das alterações nas vendas
- **Estoque** - Operações de controle de quantidade
- **Multi-loja** - Funcionalidades de isolamento por loja