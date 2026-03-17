# Funcionalidade: Consulta de Livros
# Como um usuário do sistema
# Eu quero consultar livros cadastrados usando filtros
# Para localizar obras específicas rapidamente

Cenário: Consulta por título parcial (Caminho Feliz)
  Dado que existem os livros:
    | Título               | Autor      |
    |----------------------|------------|
    | Dom Casmurro         | M. Assis   |
    | O Alienista          | M. Assis   |
    | Senhora              | J. Alencar |
  Quando eu pesquiso pelo título "Dom"
  Então o sistema deve retornar o livro "Dom Casmurro"
  E não deve retornar "O Alienista" nem "Senhora"

Cenário: Consulta combinada por autor e categoria (Caminho Feliz)
  Dado que existe o livro "O Hobbit" do autor "Tolkien" na categoria "Fantasia"
  Quando eu filtro por autor "Tolkien"
  E por categoria "Fantasia"
  Então o sistema deve retornar "O Hobbit"

Cenário: Consulta sem resultados (Caminho de Falha)
  Dado que eu pesquiso por um livro com o título "Inexistente 123"
  Quando eu clico em "Pesquisar"
  Então o sistema deve exibir a mensagem "Nenhum livro encontrado para os filtros utilizados"
