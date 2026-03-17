# Funcionalidade: Gerenciar Cartões de Crédito - Cenários Felizes
# Como um cliente
# Eu quero associar meus cartões de crédito ao meu perfil
# Para agilizar o processo de pagamento

Cenário: Cadastrar novo cartão Visa e definir como preferencial (Caminho Feliz)
  Dado que eu estou na seção "Meus Cartões"
  Quando eu insiro os dados de um novo cartão Visa
  E informo a validade no formato "MM/AAAA" (ex: 12/2028)
  E informo o CVV com exatamente 3 dígitos numéricos
  E marco a opção "Definir como Preferencial"
  E clico em "Salvar Cartão"
  Então o cartão deve ser salvo com bandeira "Visa"
  E as compras futuras devem sugerir este cartão primeiro

Cenário: Editar dados de um cartão já cadastrado (Caminho Feliz)
  Dado que eu estou na seção "Meus Cartões"
  E possuo um cartão cadastrado com nome "VINICIUS SILVA"
  Quando eu clico em "Editar" no cartão desejado
  E altero o nome impresso para "VINICIUS O SILVA"
  E altero a validade para "01/2027"
  E clico em "Atualizar Cartão"
  Então o sistema deve exibir a mensagem "Cartão atualizado!"
  E os dados do cartão devem refletir as alterações no meu perfil

Cenário: Cadastrar cartão Mastercard sem definir como preferencial
  Dado que eu estou na seção "Meus Cartões"
  Quando eu insiro os dados de um novo cartão Mastercard
  E não marco a opção "Definir como Preferencial"
  E clico em "Salvar Cartão"
  Então o cartão deve ser salvo com bandeira "Mastercard"
  E o cartão não deve ser o preferencial

Cenário: Cadastrar cartão Elo
  Dado que eu estou na seção "Meus Cartões"
  Quando eu insiro os dados de um novo cartão Elo
  E clico em "Salvar Cartão"
  Então o cartão deve ser salvo com bandeira "Elo"

Cenário: Atualizar nome impresso do cartão
  Dado que eu tenho um cartão cadastrado
  Quando eu edito o nome impresso do cartão
  E clico em "Salvar"
  Então o nome impresso deve ser atualizado

Cenário: Definir cartão como preferencial
  Dado que eu tenho múltiplos cartões cadastrados
  Quando eu marco um cartão como preferencial
  Então esse cartão deve ser definido como principal
  E os outros cartões devem deixar de ser principais

Cenário: Remover cartão
  Dado que eu tenho um cartão cadastrado
  Quando eu clico em "Remover" no cartão
  E confirmo a remoção
  Então o cartão deve ser removido da minha lista