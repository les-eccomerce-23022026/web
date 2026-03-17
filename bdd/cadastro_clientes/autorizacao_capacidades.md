# BDD — Autorização Baseada em Capacidade (Actions)

> **Regra de Negócio (RN):** O sistema deve controlar o acesso a funcionalidades e rotas baseando-se em permissões (ações) mapeadas para cada papel (role), evitando validações fixas de papéis na interface.

---

## 🔐 Cenário 1: Exibição Condicional de Elementos Administrativos (PermissionGuard)

**Dado que** o usuário está logado com o papel `cliente`  
**Quando** ele acessa o cabeçalho do sistema (Header)  
**Então** o ícone de acesso ao "Painel Administrativo" **não deve** ser exibido  
**E** o ícone de "Carrinho" **deve** ser exibido (ação `buy_books`).

**Dado que** o usuário está logado com o papel `admin`  
**Quando** ele acessa o cabeçalho do sistema (Header)  
**Então** o ícone de acesso ao "Painel Administrativo" (ação `access_admin_panel`) **deve** ser exibido.

---

## 🚧 Cenário 2: Proteção de Rota por Capacidade (ProtectedRoute)

**Dado que** o usuário está logado com o papel `cliente`  
**Quando** ele tenta navegar diretamente para a URL `/admin/livros`  
**Então** o sistema deve identificar que o usuário não possui a permissão `access_admin_panel`  
**E** deve redirecioná-lo para a página inicial (`/`) com status de acesso negado.

**Dado que** o usuário **não está logado**  
**Quando** ele tenta acessar qualquer rota protegida como `/admin` ou `/meu-perfil`  
**Então** o sistema deve redirecioná-lo para a tela de login (`/minha-conta`).

---

## ⚡ Cenário 3: Resiliência na Restauração de Sessão (Early Return)

**Dado que** um administrador está na página de listagem de livros (`/admin/livros`)  
**Quando** ele recarrega a página (F5)  
**Então** o sistema deve exibir um estado de carregamento (`LoadingState`) enquanto restaura a sessão  
**E** não deve realizar o redirecionamento para a página inicial antes de validar as permissões  
**E** após o carregamento, deve manter o administrador na página atual.

---

## 📈 Cenário 4: Escalabilidade de Papéis (OCP)

**Dado que** o sistema precise adicionar um papel de `gerente` no futuro  
**Quando** este papel for adicionado ao mapa de `rolePermissions` com a ação `access_admin_panel`  
**Então** todos os componentes protegidos por esta ação devem tornar-se acessíveis automaticamente para o `gerente` sem alteração no código do componente.
