# Funcionalidade: Ativar e Inativar Livro
# Como um administrador do sistema
# Eu quero poder ativar ou inativar o cadastro de um livro
# Para controlar a disponibilidade para venda

Cenário: Inativação manual de livro com sucesso (Caminho Feliz)
  Dado que existe um livro com status "Ativo"
  Quando eu solicito a inativação do livro
  E forneço a justificativa "Fora de estoque temporário"
  E seleciono a categoria "Logística"
  E clico em "Confirmar"
  Então o status do livro deve ser alterado para "Inativo"
  E o motivo deve ficar registrado no histórico do livro

Cenário: Inativação manual sem justificativa (Caminho de Falha)
  Dado que existe um livro com status "Ativo"
  Quando eu solicito a inativação do livro
  E não forneço justificativa
  E clico em "Confirmar"
  Então o sistema deve exibir a mensagem de erro "Justificativa é obrigatória para inativação manual"
  E o status do livro deve permanecer "Ativo"

Cenário: Ativação manual de livro com sucesso (Caminho Feliz)
  Dado que existe um livro com status "Inativo"
  Quando eu solicito a ativação do livro
  E forneço a justificativa "Reposição de estoque efetuada"
  E seleciono a categoria "Vendas"
  E clico em "Confirmar"
  Então o status do livro deve ser alterado para "Ativo"

Cenário: Inativação automática (Regra de Negócio)
  Dado que um livro possui estoque zero
  E não possui vendas com valor inferior ao parâmetro do sistema
  Quando o processo de rotina de estoque é executado
  Então o sistema deve inativar o livro automaticamente
  E a categoria de inativação deve ser "FORA DE MERCADO"
