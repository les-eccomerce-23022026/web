#!/bin/bash

# IDs do projeto e do campo Status e da coluna Done
PROJ_ID="PVT_kwDOD7SPOs4BP-pO"
FIELD_STATUS_ID="PVTSSF_lADOD7SPOs4BP-pOzg-OyP8"
OPT_DONE_ID="98236657"
OWNER="les-eccomerce-23022026"

# Declaração em formato "TITULO|DESCRICAO"
declare -a TASKS=(
  "[FRONTEND] A5: Refatoração do Mock Data e Serviços|- **Mock Data**\n  - Mudar IDs fixos para UUIDs\n- **Services**\n  - Criar CarrinhoService e LivroService\n  - Aplicar princípios SOLID na tipagem"
  "[FRONTEND] A6: Extrair CSS para Arquivos|- **Refatoração Visual**\n  - Remover CSS inline de arquivos .tsx\n  - Criar arquivos .css por componente"
  "[FRONTEND] A7: Design System com Variáveis CSS|- **Sistematização**\n  - Mapear paleta de cores e espaçamentos no root\n  - Aplicar variáveis de cor aos componentes"
  "[FRONTEND] A8: Adicionar Testes E2E (Cypress)|- **Configuração Cypress**\n  - Configurar spec templates\n- **Teste de Fluxos**\n  - Home/Catálogo\n  - Carrinho\n  - Listagem de Livros"
  "[FRONTEND] A9: Melhorar Layout do Home e Catálogo|- **Interface**\n  - Alinhar dados e números dos livros\n  - Modernizar o look\n- **Qualidade**\n  - TDD com Cypress garantindo fidelidade"
  "[FRONTEND] A10: Implementar Responsividade no Footer|- **Dispositivos Móveis**\n  - Layout de duas colunas\n- **Testes Robustos**\n  - Cypress e2e footer tests"
  "[FRONTEND] A11: Componentizar Breadcrumbs e Buscador|- **Navegação**\n  - Transformar breadcrumbs em links clicáveis\n- **Buscador**\n  - Trocar ícone do buscador e atualizar estilos"
  "[FRONTEND] A12: Tipagem Forte e Interfaces|- **Padrões de Código**\n  - Prefixar com I as interfaces globais\n- **Integração**\n  - Refatorar propriedades em todo o sistema"
  "[FRONTEND] A13: Gestão de Estado de UI (Loading/Error)|- **Experiência do Usuário**\n  - Implementar UI de Loading e Empty State\n  - Ajustar transições entre páginas"
  "[FRONTEND] A14: Centralizar URLs de Base|- **Arquitetura**\n  - Mover urls fixas para constantes/ambiente\n  - Criar serviço centralizado de requests"
)

for entry in "${TASKS[@]}"; do
  # Separa título e descrição
  TITLE="${entry%%|*}"
  BODY="${entry##*|}"
  
  # Cria o card e extrai o ID criado via jq
  echo "Criando: $TITLE"
  CREATION_JSON=$(gh project item-create 1 --owner "$OWNER" --title "$TITLE" --body "$(echo -e "$BODY")" --format json 2>/dev/null)
  ITEM_ID=$(echo "$CREATION_JSON" | grep -o '"id": *"[^"]*"' | head -n1 | cut -d'"' -f4)
  
  if [ -n "$ITEM_ID" ] && [ "$ITEM_ID" != "null" ]; then
    echo "Movendo item $ITEM_ID para Done..."
    gh project item-edit --id "$ITEM_ID" --field-id "$FIELD_STATUS_ID" --project-id "$PROJ_ID" --single-select-option-id "$OPT_DONE_ID" >/dev/null 2>&1
  else
    echo "Erro ao extrair JSON para $TITLE. Resposta: $CREATION_JSON"
  fi
  
  sleep 2
done

echo "Concluido!"
