# Funcionalidade: Gerenciar Endereços
# Como um cliente
# Eu quero associar diversos endereços de entrega
# Para facilitar minhas compras enviadas para locais diferentes

Cenário: Adicionar novo endereço de entrega (Caminho Feliz)
  Dado que eu estou logado
  E acesso a seção "Meus Endereços"
  Quando eu adiciono um novo endereço identificado como "Casa de Praia"
  E preencho Logradouro, Número, Bairro, CEP e Cidade
  E clico em "Adicionar Endereço"
  Então o endereço "Casa de Praia" deve estar disponível em minha lista

Cenário: Alterar endereço existente (RNF0034)
  Dado que eu tenho o endereço "Trabalho" cadastrado
  Quando eu altero apenas o número do logradouro deste endereço
  E clico em "Salvar"
  Então apenas os dados do endereço devem ser atualizados no banco
