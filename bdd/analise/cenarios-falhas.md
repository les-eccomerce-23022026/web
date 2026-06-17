# Cenários BDD – Análise de Vendas com Gráfico de Linhas – Falhas (Frontend)

## Páginas

- `/admin/analise-vendas`

---

## Cenários de falha

### Tentativa de análise com período inválido

- **Dado** que o administrador está na página de análise de vendas
- **Quando** o administrador seleciona a data de início "31/12/2026"
- **E** seleciona a data de fim "01/01/2026" (data fim anterior à data início)
- **E** clica no botão "Analisar"
- **Então** o sistema exibe mensagem de erro "A data de início deve ser anterior à data de fim"
- **E** o gráfico não é atualizado
- **E** os dados anteriores permanecem exibidos

### Tentativa de análise com data no futuro

- **Dado** que o administrador está na página de análise de vendas
- **Quando** o administrador seleciona a data de início "01/01/2027"
- **E** clica no botão "Analisar"
- **Então** o sistema exibe mensagem de erro "A data de início não pode ser no futuro"
- **E** o campo de data é destacado em vermelho
- **E** o gráfico não é atualizado

### Tentativa de análise sem selecionar categorias

- **Dado** que o administrador está na página de análise de vendas
- **E** todas as categorias estão desmarcadas
- **Quando** o administrador clica no botão "Analisar"
- **Então** o sistema exibe mensagem de erro "Selecione pelo menos uma categoria"
- **E** o botão "Analisar" permanece desabilitado até que uma categoria seja selecionada

### Tentativa de acesso por usuário não autenticado

- **Dado** que o usuário não está autenticado
- **Quando** o usuário tenta acessar `/admin/analise-vendas`
- **Então** o sistema redireciona para a página de login
- **E** exibe mensagem "Faça login para acessar esta funcionalidade"

### Tentativa de acesso por usuário com perfil cliente (pap_id = 2)

- **Dado** que o usuário está autenticado com perfil 'cliente' (pap_id = 2)
- **Quando** o usuário tenta acessar `/admin/analise-vendas`
- **Então** o sistema exibe página de "Acesso Negado"
- **E** a mensagem "Acesso negado. Esta rota é restrita a administradores." é exibida
- **E** o usuário é redirecionado para a página inicial após 5 segundos

### Acesso por usuário com perfil admin (pap_id = 1)

- **Dado** que o usuário está autenticado com perfil 'admin' (pap_id = 1)
- **Quando** o usuário acessa `/admin/analise-vendas`
- **Então** a página de análise de vendas é carregada corretamente
- **E** o gráfico de linhas é exibido
- **E** os filtros de categoria e período estão disponíveis

### Acesso por usuário com perfil admin_sistema (pap_id = 3)

- **Dado** que o usuário está autenticado com perfil 'admin_sistema' (pap_id = 3)
- **Quando** o usuário acessa `/admin/analise-vendas`
- **Então** a página de análise de vendas é carregada corretamente
- **E** o gráfico de linhas é exibido
- **E** os filtros de categoria e período estão disponíveis
- **E** o perfil 'admin_sistema' tem acesso à funcionalidade (adminOnlyMiddleware aceita ambos os perfis)

### Falha ao carregar dados da API

- **Dado** que o administrador está na página de análise de vendas
- **E** a API está indisponível ou retornou erro 500
- **Quando** o administrador clica no botão "Analisar"
- **Então** o sistema exibe mensagem de erro "Erro ao carregar dados de vendas. Tente novamente."
- **E** um botão "Tentar Novamente" é exibido
- **E** o gráfico exibe estado de erro com ícone apropriado

### Tentativa de análise com período superior ao limite

- **Dado** que o administrador está na página de análise de vendas
- **E** o sistema limita o período a 24 meses
- **Quando** o administrador seleciona data de início "01/01/2020"
- **E** seleciona data de fim "31/12/2025" (período de 72 meses)
- **E** clica no botão "Analisar"
- **Então** o sistema exibe mensagem de erro "O período de análise não pode exceder 24 meses"
- **E** sugere ajustar o período para o limite permitido

### Tentativa de seleção de mais de 10 categorias

- **Dado** que o administrador está na página de análise de vendas
- **E** o sistema limita a seleção a 10 categorias
- **Quando** o administrador tenta selecionar a 11ª categoria
- **Então** o sistema exibe mensagem "Não é possível selecionar mais de 10 categorias"
- **E** a checkbox da 11ª categoria permanece desmarcada
- **E** uma mensagem informativa é exibida abaixo do seletor de categorias

### Exibição de gráfico quando não há dados no período

- **Dado** que o administrador está na página de análise de vendas
- **E** não existem vendas registradas no período selecionado
- **Quando** o administrador clica no botão "Analisar"
- **Então** o sistema exibe mensagem "Não há dados de vendas para o período selecionado"
- **E** o gráfico exibe estado vazio com ilustração apropriada
- **E** o sistema sugere selecionar um período diferente

### Falha na exportação de dados

- **Dado** que o gráfico está exibindo dados de vendas
- **E** ocorre um erro ao gerar o arquivo CSV
- **Quando** o administrador clica no botão "Exportar Dados"
- **Então** o sistema exibe mensagem de erro "Erro ao exportar dados. Tente novamente."
- **E** o arquivo não é baixado
- **E** o botão permanece disponível para nova tentativa

### Timeout ao carregar dados de período muito longo

- **Dado** que o administrador selecionou um período de 24 meses
- **E** a API está demorando mais de 30 segundos para responder
- **Quando** o timeout é atingido
- **Então** o sistema exibe mensagem "A solicitação demorou muito tempo. Tente um período menor."
- **E** o gráfico exibe estado de carregamento com ícone de timeout
- **E** o sistema sugere reduzir o período de análise
