# Funcionalidade: Alterar Livro
# Como um administrador do sistema
# Eu quero alterar os dados de um livro cadastrado
# Para manter as informações atualizadas

Cenário: Alteração de dados do livro com sucesso (Caminho Feliz)
  Dado que existe um livro cadastrado com o título "O Senhor dos Anéis"
  E eu estou na página de edição deste livro
  Quando eu altero o campo "Edição" para "Edição Especial"
  E clico em "Salvar"
  Então o sistema deve exibir a mensagem "Livro alterado com sucesso"
  E o campo "Edição" do livro deve refletir a nova informação "Edição Especial"

Cenário: Tentativa de alteração com dados inválidos (Caminho de Falha)
  Dado que existe um livro cadastrado
  E eu estou na página de edição deste livro
  Quando eu apago o conteúdo do campo "Título"
  E clico em "Salvar"
  Então o sistema deve exibir a mensagem de erro "O campo Título é obrigatório"
  E as alterações não devem ser salvas
