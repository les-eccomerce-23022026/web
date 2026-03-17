# Funcionalidade: Cálculo de Frete
# Como um cliente
# Eu quero que o sistema calcule o valor do frete
# Com base nos itens do meu carrinho e no meu CEP

Cenário: Cálculo de frete bem-sucedido (Caminho Feliz)
  Dado que eu tenho 2 livros no carrinho
  Quando eu informo o CEP "01001-000"
  Então o sistema deve retornar o valor do frete (ex: R$ 15,00)
  E apresentar o prazo estimado de entrega

Cenário: CEP não atendido ou inexistente (Caminho de Falha)
  Dado que eu informo um CEP "00000-000"
  Quando eu solicito o cálculo
  Então o sistema deve exibir a mensagem "Não foi possível calcular o frete para este CEP. Verifique o número informado."
