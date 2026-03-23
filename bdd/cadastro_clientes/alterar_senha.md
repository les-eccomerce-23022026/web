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
  Então o sistema deve exibir "Senha atual incorreta."
  E a nova senha não deve ser salva

Cenário: Nova senha e confirmação não conferem (Caminho de Falha)
  Dado que eu tenho a "Senha Atual" correta
  E informo uma "Nova Senha"
  Mas na "Confirmação da Nova Senha" digito algo diferente
  Então o sistema deve exibir "Nova senha e confirmação não conferem."
