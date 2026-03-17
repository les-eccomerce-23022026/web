# Funcionalidade: Gerenciar Carrinho de Compras
# Como um cliente
# Eu quero adicionar e gerenciar itens no meu carrinho
# Para preparar minha compra de livros

Cenário: Adicionar item ao carrinho com estoque disponível (Caminho Feliz)
  Dado que o livro "Dom Casmurro" tem 5 unidades em estoque
  Quando eu adiciono "1" unidade deste livro ao carrinho
  Então o item deve aparecer no meu carrinho
  E o sistema deve reservar o item temporariamente por 30 minutos (bloqueio de estoque)

Cenário: Tentativa de adicionar item acima do estoque (RN0031)
  Dado que o livro "O Hobbit" tem apenas 2 unidades em estoque
  Quando eu tento adicionar "5" unidades ao carrinho
  Então o sistema deve exibir a mensagem "Quantidade solicitada superior ao estoque disponível"
  E apenas "2" unidades (ou nenhuma, conforme a política) devem ser adicionadas

Cenário: Alterar quantidade no carrinho (RF0032)
  Dado que eu tenho "1" unidade de "Senhora" no carrinho
  Quando eu altero a quantidade para "3"
  Então o valor total do carrinho deve ser atualizado proporcionalmente

Cenário: Expiração de reserva do carrinho (RN0044, RN0045)
  Dado que eu tenho itens no carrinho há 25 minutos
  Quando o sistema envia a notificação de expiração em 5 minutos
  E eu não finalizo a compra nos próximos 5 minutos
  Então os itens devem ser removidos do meu carrinho automaticamente
  E o estoque deve ser liberado para outros clientes
