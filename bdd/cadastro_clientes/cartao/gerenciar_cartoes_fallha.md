# Funcionalidade: Gerenciar Cartões de Crédito - Cenários de Falha
# Como um cliente
# Eu quero associar meus cartões de crédito ao meu perfil
# Para agilizar o processo de pagamento

Cenário: Tentativa de cadastrar cartão com bandeira não permitida (RN0025)
  Dado que eu tento cadastrar um cartão com bandeira "Bandeira Desconhecida"
  Quando eu clico em "Salvar"
  Então o sistema deve exibir "Esta bandeira de cartão não é aceita pela loja"

Cenário: Tentativa de cadastrar cartão com CVV inválido
  Dado que eu estou na seção "Meus Cartões"
  Quando eu preencho os dados do cartão com CVV de 2 dígitos (ex: "12")
  Ou com CVV não numérico (ex: "A12")
  Ou com CVV de 4 dígitos (ex: "1234")
  E tento "Salvar Cartão"
  Então o sistema deve exibir o erro "CVV deve conter exatamente 3 números"
  E o cartão não deve ser salvo no perfil

Cenário: Tentativa de cadastrar cartão com Validade em formato incorreto
  Dado que eu estou na seção "Meus Cartões"
  Quando eu preencho a validade fora do padrão "MM/AAAA" (ex: "12/28" ou "12-2028")
  E tento "Salvar Cartão"
  Então o sistema deve exibir o erro "Data de validade deve estar no formato MM/AAAA"
  E o cartão não deve ser salvo no perfil

Cenário: Tentativa de cadastrar cartão sem dados obrigatórios
  Dado que eu estou na seção "Meus Cartões"
  Quando eu tento salvar um cartão sem preencher o número
  Ou sem preencher o CVV
  Ou sem preencher a validade
  E clico em "Salvar Cartão"
  Então o sistema deve exibir o erro de campo obrigatório correspondente

Cenário: Tentativa de cadastrar cartão com data de validade expirada
  Dado que eu insiro os dados de um cartão com data de validade no passado
  Quando eu clico em "Salvar Cartão"
  Então o sistema deve exibir "Data de validade deve ser futura"

Cenário: Tentativa de atualizar cartão inexistente
  Dado que eu tento editar um cartão que não existe
  Quando eu clico em "Salvar"
  Então o sistema deve exibir "Cartão não encontrado"

Cenário: Tentativa de remover cartão inexistente
  Dado que eu tento remover um cartão que não existe
  Quando eu confirmo a remoção
  Então o sistema deve exibir "Cartão não encontrado"

Cenário: Tentativa de definir cartão inexistente como preferencial
  Dado que eu tento definir um cartão inexistente como preferencial
  Quando eu marco a opção
  Então o sistema deve exibir "Cartão não encontrado"