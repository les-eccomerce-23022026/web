# 🛡️ Regras de Negócio (RNs)

Este documento contém todas as regras de negócio (RN/RNF) aplicadas ao projeto LES E-commerce 2026. Toda nova regra deve ser registrada aqui com seu respectivo ID e descrição.

| ID            | Regra                             | Descrição                                                                                                 |
| :------------ | :-------------------------------- | :-------------------------------------------------------------------------------------------------------- |
| **[RNF0031]** | **Senha Forte**                   | Validação rigorosa de complexidade (mín. 8 caracteres, letras maiúsculas/minúsculas, números e símbolos). |
| **[RNF0033]** | **Criptografia**                  | Armazenamento de credenciais utilizando algoritmos de Hash (BCrypt) para impedir vazamento de senhas.     |
| **[RN0026]**  | **Extensão de Contrato**          | Coleta padronizada de dados (Gênero, Data de Nascimento e Telefone) no cadastro de clientes.              |
| **[RNF]**     | **Fluxo Distraction-free**        | Ocultação de menus e banners durante a finalização da compra para foco total na conversão.                |
| **[RNF]**     | **Feedback de Progresso**         | Indicadores Visuais claros das etapas (Identificação → Entrega → Pagamento) no checkout.                  |
| **[RNF]**     | **DDD (Domain-Driven Design)**    | Organização modular por domínios (Vendas, Catálogo, Admin) para alta escalabilidade.                      |
| **[RNF]**     | **Princípios SOLID**              | Código desacoplado e altamente testável para manutenibilidade a longo prazo.                              |
| **[RN]**      | **Restrição de Criação de Admin** | Regra de que apenas um admin autenticado pode criar outro (não há rota pública).                          |
| **[RES1]**    | **Documentação de Alterações**    | Todas as alterações feitas por agentes devem ser registradas em `docs/AGENTS.md`.                         |
