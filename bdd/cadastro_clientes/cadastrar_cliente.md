# Funcionalidade: Cadastrar Cliente
# Como um novo visitante do site
# Eu quero me cadastrar como cliente
# Para realizar compras

Cenário: Cadastro de cliente com sucesso (Caminho Feliz)
  Dado que eu preencho todos os dados obrigatórios de perfil:
    | Campo      | Valor             |
    |------------|-------------------|
    | Nome       | João Silva        |
    | Gênero     | Masculino         |
    | Nascimento | 01/01/1990        |
    | CPF        | 123.456.789-00    |
    | Telefone   | (11) 99999-8888   |
    | E-mail     | joao@email.com    |
    | Senha      | Senha@123         |
    | Confirmar  | Senha@123         |
  E preencho um endereço residencial completo
  E preencho um endereço de entrega
  E preencho um endereço de cobrança
  Quando eu clico em "Finalizar Cadastro"
  Então o sistema deve criar minha conta
  E exibir a mensagem "Bem-vindo, João Silva!"

Cenário: Tentativa de cadastro com CPF inválido (Caminho de Falha)
  Dado que eu preencho os dados básicos corretamente
  Mas informo um CPF "000.000.000-00"
  Quando eu clico em "Finalizar Cadastro"
  Então o sistema deve exibir a mensagem de erro "CPF inválido"

Cenário: Tentativa de cadastro com senha fraca (Caminho de Falha)
  Dado que eu preencho os dados básicos
  Mas informo a senha "123"
  Quando eu clico em "Finalizar Cadastro"
  Então o sistema deve exibir a erro "A senha deve ter pelo menos 8 caracteres, letras maiúsculas, minúsculas e caracteres especiais"

Cenário: Confirmação de senha divergente (Caminho de Falha)
  Dado que eu informo a senha "Senha@123"
  E informo no campo confirmar "Senha@456"
  Quando eu clico em "Finalizar Cadastro"
  Então o sistema deve exibir o erro "As senhas digitadas não coincidem"
