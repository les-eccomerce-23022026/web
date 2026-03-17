# Funcionalidade: Controle de Estoque
# Como um administrador de estoque
# Eu quero realizar entradas e saídas de produtos
# Para manter a disponibilidade dos livros e os preços corretos

Cenário: Entrada de novos itens em estoque (Caminho Feliz)
  Dado que eu seleciono o livro "Dom Casmurro"
  Quando eu realizo uma entrada de "10" unidades
  E informo valor de custo "R$ 20,00" e fornecedor "Editora XYZ"
  E informo a data de entrada como hoje
  Então o estoque total do livro deve aumentar em 10
  E o valor de venda deve ser recalculado com base no grupo de precificação do livro (ex: 30% lucro -> R$ 26,00)

Cenário: Entrada com custo superior ao anterior (RN005X)
  Dado que o custo anterior era "R$ 20,00" e o preço de venda era "R$ 26,00"
  Quando eu realizo uma nova entrada com custo "R$ 30,00"
  Então o sistema deve adotar o maior custo ("R$ 30,00") para todos os itens deste livro
  E o novo preço de venda deve ser recalculado corretamente (ex: R$ 39,00)

Cenário: Tentativa de entrada sem dados obrigatórios (RN0051 - Caminho de Falha)
  Dado que eu tento realizar uma entrada de estoque
  Quando eu não informo o "Valor de Custo"
  Então o sistema deve exibir erro "O campo Valor de Custo é obrigatório para entrada de estoque"
  E a operação não deve ser registrada
