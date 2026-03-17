# Funcionalidade: Cadastrar Livro
# Como um administrador do sistema
# Eu quero cadastrar novos livros
# Para que eles fiquem disponíveis para venda

Cenário: Cadastro de livro com sucesso (Caminho Feliz)
  Dado que eu sou um administrador autenticado
  E estou na página de cadastro de livros
  Quando eu preencho os campos:
    | Campo                | Valor                               |
    |----------------------|-------------------------------------|
    | Título               | O Senhor dos Anéis                  |
    | Autor                | J.R.R. Tolkien                      |
    | Editora              | Martins Fontes                      |
    | Ano                  | 1954                                |
    | Edição               | 1ª Edição                           |
    | ISBN                 | 978-8533613379                      |
    | Páginas              | 1200                                |
    | Sinopse              | Uma jornada épica pela Terra Média  |
    | Dimensões            | 23 x 16 x 5 cm                      |
    | Grupo Precificação   | Grupo A (Margem 30%)                |
    | Código de Barras     | 1234567890123                       |
    | Categorias           | Fantasia, Aventura                  |
  E clico em "Salvar"
  Então o sistema deve exibir a mensagem "Livro cadastrado com sucesso"
  E o livro deve estar visível na listagem de livros

Cenário: Cadastro de livro com dados faltantes (Caminho de Falha)
  Dado que eu sou um administrador autenticado
  E estou na página de cadastro de livros
  Quando eu preencho os campos:
    | Campo                | Valor                               |
    |----------------------|-------------------------------------|
    | Título               | O Hobbit                            |
    | Autor                | J.R.R. Tolkien                      |
    | ISBN                 |                                     |
  E clico em "Salvar"
  Então o sistema deve exibir a mensagem de erro "O campo ISBN é obrigatório"
  E o cadastro não deve ser realizado
