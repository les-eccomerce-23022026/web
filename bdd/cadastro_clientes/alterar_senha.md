# Funcionalidade: Alteração de Senha
# Como um cliente
# Eu quero alterar apenas minha senha
# Sem precisar editar outros campos do meu perfil

Cenário: Alteração de senha com sucesso (Caminho Feliz)
  Dado que eu estou logado
  E acesso a seção "Segurança / Alterar Senha"
  Quando eu informo a "Senha Atual" correta
  E informo a "Nova Senha" atendendo aos requisitos de força
  E confirmo a "Nova Senha"
  E clico em "Atualizar Senha"
  Então o sistema deve exibir "Senha alterada com sucesso"
  E eu devo conseguir logar com a nova senha no próximo acesso

Cenário: Senha atual incorreta (Caminho de Falha)
  Dado que eu tento alterar minha senha
  Quando eu informo uma "Senha Atual" equivocada
  Então o sistema deve exibir "A senha atual informada é inválida"
  E a nova senha não deve ser salva
