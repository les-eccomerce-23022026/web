# Funcionalidade: Alterar Dados do Cliente
# Como um cliente cadastrado
# Eu quero alterar meus dados cadastrais
# Para mantê-los atualizados

Cenário: Alteração de telefone de contato (Caminho Feliz)
  Dado que eu estou logado em minha conta
  E acesso a página de "Meu Perfil"
  Quando eu altero o número do telefone para "(11) 98888-7777"
  E clico em "Salvar Alterações"
  Então o sistema deve confirmar a alteração
  E meu cadastro deve constar o novo número

Cenário: Inativação de conta de cliente (RF0023)
  Dado que eu estou logado
  E seleciono a opção "Inativar Minha Conta"
  Quando eu confirmo a ação
  Então minha conta deve ficar com status "Inativo"
  E eu devo ser desconectado do sistema
