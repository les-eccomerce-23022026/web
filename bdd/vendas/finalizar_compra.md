# Funcionalidade: Finalizar Compra
# Como um cliente com itens no carrinho
# Eu quero realizar o pagamento e escolher o endereço
# Para concluir meu pedido

Cenário: Realizar compra com sucesso usando um cartão e cupom (Caminho Feliz)
  Dado que eu tenho R$ 100,00 em produtos no carrinho
  E eu possuo um cupom de troca de R$ 30,00
  E eu seleciono um endereço de entrega cadastrado
  Quando eu aplico o cupom
  E seleciono um cartão de crédito para pagar o saldo de R$ 70,00
  E clico em "Finalizar Compra"
  Então o sistema deve processar o pagamento com sucesso
  E o status do pedido deve ser alterado para "EM PROCESSAMENTO" e logo após "APROVADA"
  E o estoque deve ser atualizado definitivamente

Cenário: Pagamento com múltiplos cartões - valor mínimo (RN0034)
  Dado que o total da minha compra é R$ 50,00
  Quando eu tento adicionar um pagamento de R$ 5,00 no Cartão A
  Então o sistema deve exibir erro "Valor mínimo por cartão é R$ 10,00"
  E não deve permitir a adição do cartão ao pagamento parcial

Cenário: Limite de cupom promocional (RN0033)
  Dado que eu já apliquei o cupom promocional "DESCONTO10"
  Quando eu tento aplicar um segundo cupom promocional "MAISDESCONTO"
  Então o sistema deve exibir erro "Apenas um cupom promocional é permitido por compra"
  E o segundo cupom não deve ser aplicado

Cenário: Botão de finalizar compra desabilitado sem frete ou endereço
  Dado que eu tenho itens no carrinho
  Mas eu ainda não selecionei um endereço de entrega
  Ou ainda não selecionei o tipo de frete
  Então o botão "Concluir Pedido" deve permanecer desabilitado
  E uma mensagem informativa deve orientar o usuário a configurar a entrega

Cenário: Gerar cupom de troca por resíduo de pagamento (RN0036)
  Dado que eu uso um cupom de troca de R$ 200,00 em uma compra de R$ 150,00
  Quando eu finalizo a compra
  Então o sistema deve gerar um novo cupom de troca de R$ 50,00 para uso futuro

Cenário: Pagamento reprovado pela operadora (Caminho de Falha)
  Dado que os dados do cartão inserido são inválidos ou não há limite
  Quando eu clico em "Finalizar Compra"
  Então o sistema deve marcar o pedido como "REPROVADA"
  E os itens devem retornar ao estoque disponível para outros clientes (RN0028/RN00142)
