# Funcionalidade: Consulta de Clientes e Transações
# Como um administrador ou o próprio cliente
# Eu quero consultar dados e histórico de transações
# Para acompanhamento de conta e pedidos

Cenário: Consulta de cliente por CPF (Caminho Feliz)
  Dado que existe um cliente cadastrado com o CPF "123.456.789-00"
  Quando o administrador pesquisa por este CPF
  Então o sistema deve retornar os dados de "João Silva"

Cenário: Visualização de histórico de transações (RF0025)
  Dado que eu sou o cliente "João Silva" e estou logado
  E realizei 3 compras no passado
  Quando eu acesso a seção "Minhas Compras" ou "Histórico de Transações"
  Então o sistema deve listar os 3 pedidos com seus respectivos status, datas e valores

Cenário: Busca de cliente inexistente (Caminho de Falha)
  Dado que o administrador pesquisa por um CPF que não consta na base
  Quando clica em "Consultar"
  Então o sistema deve exibir "Cliente não encontrado"
