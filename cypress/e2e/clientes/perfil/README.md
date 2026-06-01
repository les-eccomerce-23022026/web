# Testes de Perfil do Cliente

Esta pasta contém testes E2E que validam as funcionalidades de perfil e configurações da conta do cliente.

## Tipos de Testes

- **Dados pessoais** - Atualização de nome, email, telefone
- **Segurança** - Alteração de senha, autenticação em dois fatores
- **Preferências** - Configurações de notificação, privacidade
- **Status da conta** - Ativação, inativação, exclusão

## Como Rodar

### Rodar todos os testes de perfil:
```bash
cd web
npx cypress run --e2e --spec "cypress/e2e/clientes/perfil/*.cy.ts"
```

### Rodar um teste específico:
```bash
cd web
npx cypress run --e2e --spec "cypress/e2e/clientes/perfil/[nome-do-arquivo].cy.ts"
```

## Padrões Esperados

- **Validação em tempo real** - Feedback imediato nas alterações
- **Confirmacão sensível** - Operações críticas exigem confirmação
- **Sessão atualizada** - Mudanças refletidas imediatamente na UI
- **Log de atividades** - Ações importantes registradas

## Comandos Customizados Utilizados

- `cy.autenticarViaApi(email, senha)` - Autenticação via API
- `cy.acessarPerfilCliente()` - Navega para página de perfil
- `cy.atualizarDadosPessoais(dados)` - Atualiza informações do perfil
- `cy.alterarSenha(senhaAtual, novaSenha)` - Processo de troca de senha
- `cy.verificarMensagemSucesso(mensagem)` - Valida feedback positivo

## Critérios de Sucesso

✅ **Dados persistidos** - Alterações salvas corretamente no backend  
✅ **Validação adequada** - Formatos e regras respeitados  
✅ **Segurança mantida** - Operações sensíveis protegidas  
✅ **UX intuitiva** - Processo claro e sem ambiguidades  

## Relacionamento com Outros Testes

- **Endereços** - `../enderecos/` - Gerenciamento de endereços de entrega
- **Cartões** - `../cartoes/` - Métodos de pagamento salvos
- **Autenticação** - `../../autenticacao/` - Login e registro
- **Admin** - `../../admin/clientes/` - Visão administrativa dos clientes