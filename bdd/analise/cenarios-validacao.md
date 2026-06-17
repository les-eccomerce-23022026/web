# Cenários BDD – Análise de Vendas com Gráfico de Linhas – Validação (Frontend)

## Páginas

- `/admin/analise-vendas`

---

## Cenários de validação

### Validação de campo de data início obrigatório

- **Dado** que o administrador está na página de análise de vendas
- **E** o campo de data início está vazio
- **Quando** o administrador clica no botão "Analisar"
- **Então** o sistema exibe mensagem de erro "Selecione a data de início"
- **E** o campo de data início é destacado em vermelho
- **E** o foco é movido para o campo de data início

### Validação de campo de data fim obrigatório

- **Dado** que o administrador está na página de análise de vendas
- **E** o campo de data fim está vazio
- **Quando** o administrador clica no botão "Analisar"
- **Então** o sistema exibe mensagem de erro "Selecione a data de fim"
- **E** o campo de data fim é destacado em vermelho
- **E** o foco é movido para o campo de data fim

### Validação de formato de data inválido

- **Dado** que o administrador está na página de análise de vendas
- **Quando** o administrador digita "31/01/2026" no campo de data início (formato DD/MM/YYYY)
- **Então** o sistema exibe mensagem de erro "Formato de data inválido. Use DD/MM/AAAA"
- **E** o campo não aceita o valor digitado
- **E** o valor é limpo automaticamente

### Validação de data com dia inválido

- **Dado** que o administrador está na página de análise de vendas
- **Quando** o administrador digita "32/01/2026" no campo de data início
- **Então** o sistema exibe mensagem de erro "Dia inválido. O dia deve estar entre 1 e 31"
- **E** o campo não aceita o valor digitado

### Validação de data com mês inválido

- **Dado** que o administrador está na página de análise de vendas
- **Quando** o administrador digita "01/13/2026" no campo de data início
- **Então** o sistema exibe mensagem de erro "Mês inválido. O mês deve estar entre 1 e 12"
- **E** o campo não aceita o valor digitado

### Validação de seleção mínima de uma categoria

- **Dado** que o administrador está na página de análise de vendas
- **E** todas as categorias estão desmarcadas
- **Quando** o administrador tenta desmarcar a última categoria selecionada
- **Então** o sistema impede a desmarcação
- **E** exibe mensagem "Selecione pelo menos uma categoria"
- **E** a categoria permanece marcada

### Validação de caracteres especiais em busca de categoria

- **Dado** que o administrador está na página de análise de vendas
- **E** existe um campo de busca para filtrar categorias
- **Quando** o administrador digita "<script>alert('xss')</script>" no campo de busca
- **Então** o sistema sanitiza a entrada
- **E** exibe mensagem "Caracteres inválidos detectados"
- **E** o campo é limpo automaticamente

### Validação de período mínimo de 1 dia

- **Dado** que o administrador está na página de análise de vendas
- **Quando** o administrador seleciona a mesma data para início e fim
- **E** clica no botão "Analisar"
- **Então** o sistema exibe mensagem de erro "O período deve ser de pelo menos 1 dia"
- **E** sugere ajustar a data fim para o dia seguinte

### Validação de limite máximo de categorias selecionadas

- **Dado** que o administrador está na página de análise de vendas
- **E** o sistema limita a seleção a 10 categorias
- **E** 10 categorias já estão selecionadas
- **Quando** o administrador tenta selecionar a 11ª categoria
- **Então** o sistema exibe mensagem "Limite de 10 categorias atingido"
- **E** a checkbox da 11ª categoria permanece desmarcada
- **E** um contador "10/10" é exibido acima do seletor

### Validação de período máximo de 24 meses

- **Dado** que o administrador está na página de análise de vendas
- **E** o sistema limita o período a 24 meses
- **Quando** o administrador seleciona data de início "01/01/2020"
- **E** seleciona data de fim "31/12/2025"
- **Então** o sistema exibe aviso "O período selecionado excede 24 meses"
- **E** sugere ajustar a data fim para "01/01/2022"
- **E** o botão "Analisar" permanece desabilitado até o ajuste

### Validação de data início não pode ser no futuro

- **Dado** que o administrador está na página de análise de vendas
- **E** a data atual é "15/06/2026"
- **Quando** o administrador seleciona data de início "16/06/2026"
- **Então** o sistema exibe mensagem de erro "A data de início não pode ser no futuro"
- **E** o campo é destacado em vermelho
- **E** o valor é rejeitado

### Validação de data fim não pode ser no futuro

- **Dado** que o administrador está na página de análise de vendas
- **E** a data atual é "15/06/2026"
- **Quando** o administrador seleciona data de fim "16/06/2026"
- **Então** o sistema exibe mensagem de erro "A data de fim não pode ser no futuro"
- **E** o campo é destacado em vermelho
- **E** o valor é rejeitado

### Validação de campo de busca vazio

- **Dado** que o administrador está na página de análise de vendas
- **E** existe um campo de busca para filtrar categorias
- **Quando** o administrador deixa o campo de busca vazio
- **E** pressiona Enter
- **Então** o sistema exibe todas as categorias disponíveis
- **E** nenhuma mensagem de erro é exibida

### Validação de entrada de texto em campos de data

- **Dado** que o administrador está na página de análise de vendas
- **Quando** o administrador tenta digitar texto no campo de data início
- **Então** o campo aceita apenas entrada via datepicker
- **E** a digitação manual é bloqueada
- **E** o ícone do calendário é exibido ao focar no campo
