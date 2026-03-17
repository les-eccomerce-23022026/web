# Funcionalidade: Troca de Produtos
# Como um cliente
# Eu quero solicitar a troca de um produto recebido
# Para obter um crédito em novos produtos

Cenário: Solicitar troca de item entregue (Caminho Feliz)
  Dado que eu possuo uma compra com status "ENTREGUE"
  Quando eu seleciono um item desta compra e clico em "Solicitar Troca"
  E informo o motivo da troca
  Então o status do pedido/item deve ser alterado para "EM TROCA"
  E o administrador deve ser notificado

Cenário: Tentar trocar item não entregue (RN0043 - Caminho de Falha)
  Dado que eu tenho um pedido com status "EM TRÂNSITO"
  Quando eu tento acessar a opção de "Solicitar Troca"
  Então o sistema não deve permitir a visualização do botão de troca
  Ou deve informar que a troca só é permitida após a entrega confirmada

Cenário: Autorização e Finalização de Troca (Fluxo do Administrador)
  Dado que existe um pedido com status "EM TROCA"
  Quando o administrador autoriza a troca (status passa para "TROCA AUTORIZADA")
  E o administrador confirma o recebimento do produto físico ("TROCADO")
  E indica que o produto deve retornar ao estoque
  Então o sistema deve gerar automaticamente um cupom de troca para o cliente
  E o cliente deve ser notificado por e-mail (RN0046)
  E a quantidade do item deve ser incrementada no estoque (RF0054)
