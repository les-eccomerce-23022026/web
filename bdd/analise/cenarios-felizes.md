# Cenários BDD – Análise de Vendas com Gráfico de Linhas – Sucesso (Frontend)

## Páginas

- `/admin/analise-vendas`

---

## Cenários de sucesso

### Visualização do gráfico de linhas com dados carregados

- **Dado** que o administrador está autenticado
- **E** a página de análise de vendas foi carregada
- **E** existem dados de vendas disponíveis
- **Quando** o gráfico é renderizado
- **Então** o gráfico de linhas é exibido corretamente (RNF0043)
- **E** cada categoria selecionada é representada por uma linha diferente
- **E** o eixo X representa o período de tempo selecionado
- **E** o eixo Y representa o volume de livros vendidos

### Seleção de período de análise

- **Dado** que o administrador está na página de análise de vendas
- **Quando** o administrador seleciona a data de início "01/01/2025"
- **E** seleciona a data de fim "31/12/2025"
- **E** clica no botão "Analisar"
- **Então** o gráfico é atualizado com os dados do período selecionado
- **E** as datas selecionadas são exibidas no cabeçalho do gráfico

### Seleção de múltiplas categorias

- **Dado** que o administrador está na página de análise de vendas
- **E** existem 5 categorias disponíveis
- **Quando** o administrador seleciona "Literatura Nacional"
- **E** seleciona "Ficção Científica"
- **E** seleciona "Culinária"
- **E** clica no botão "Analisar"
- **Então** o gráfico exibe 3 linhas diferentes
- **E** cada linha corresponde a uma categoria selecionada
- **E** a legenda do gráfico identifica cada categoria por cor

### Visualização de dados de 13 meses (requisito de demonstração)

- **Dado** que o administrador está na página de análise de vendas
- **E** a base de dados possui 13 meses de histórico de compras
- **Quando** o administrador seleciona o período de "01/05/2025" a "01/06/2026"
- **E** clica no botão "Analisar"
- **Então** o gráfico exibe dados para todo o período de 13 meses
- **E** os dados são suficientes para demonstrar a funcionalidade na apresentação

### Hover nos pontos do gráfico para detalhes

- **Dado** que o gráfico de linhas está exibido
- **Quando** o administrador passa o mouse sobre um ponto do gráfico
- **Então** é exibido um tooltip com informações detalhadas
- **E** o tooltip mostra a data específica
- **E** o tooltip mostra o volume de vendas para cada categoria naquela data

### Alternar visibilidade de linhas do gráfico

- **Dado** que o gráfico está exibindo 3 categorias
- **Quando** o administrador clica na legenda de "Ficção Científica"
- **Então** a linha correspondente a "Ficção Científica" é ocultada
- **E** as outras linhas permanecem visíveis
- **E** clicando novamente na legenda, a linha é exibida novamente

### Zoom no gráfico

- **Dado** que o gráfico está exibindo dados de 12 meses
- **Quando** o administrador seleciona uma área específica do gráfico
- **Então** o gráfico aplica zoom na área selecionada
- **E** os detalhes dos dados são exibidos com maior precisão
- **E** um botão "Reset Zoom" fica disponível

### Exportação de dados do gráfico

- **Dado** que o gráfico está exibindo dados de vendas
- **Quando** o administrador clica no botão "Exportar Dados"
- **Então** o sistema gera um arquivo CSV com os dados exibidos
- **E** o arquivo é baixado automaticamente
- **E** o arquivo contém colunas: data, categoria, volume_vendas

### Responsividade do gráfico em diferentes tamanhos de tela

- **Dado** que o administrador está acessando a página em um desktop
- **Quando** a janela do navegador é redimensionada para tamanho de tablet
- **Então** o gráfico se ajusta ao novo tamanho
- **E** os dados permanecem legíveis
- **E** a legenda é reorganizada para melhor visualização

### Carregamento inicial com período padrão

- **Dado** que o administrador acessa a página pela primeira vez
- **Quando** a página é carregada
- **Então** o sistema define automaticamente o período padrão (últimos 30 dias)
- **E** o gráfico é exibido com os dados do período padrão
- **E** todas as categorias disponíveis são selecionadas por padrão
