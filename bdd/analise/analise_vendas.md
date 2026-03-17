# Funcionalidade: Análise de Vendas
# Como um gestor da loja
# Eu quero visualizar o gráfico de histórico de vendas
# Para tomar decisões de reposição e marketing

Cenário: Consultar vendas por período e categoria (Caminho Feliz)
  Dado que eu seleciono a categoria "Literatura Nacional"
  E seleciono o período de "01/01/2026" a "31/01/2026"
  Quando eu clico em "Analisar"
  Então o sistema deve exibir um gráfico de linhas (RNF0043)
  E listar o quantitativo de vendas por dia para as categorias comparadas

Cenário: Consulta com período inválido (Caminho de Falha)
  Dado que eu informo a "Data Início" posterior à "Data Fim"
  Quando eu tento gerar a análise
  Então o sistema deve exibir "A data de início deve ser anterior à data de fim"
