'use client';

import { useLojaAtiva } from '@/hooks/useLojaAtiva';

/**
 * Componente que exibe a loja ativa.
 * Exemplo de uso do hook useLojaAtiva.
 */
export function LojaAtivaIndicador() {
  const { lojaAtiva, carregando, erro } = useLojaAtiva();

  // Enquanto carrega, exibir estado de carregamento
  if (carregando) {
    return (
      <div data-cy="loja-indicador-carregando">
        Carregando loja...
      </div>
    );
  }

  // Se houver erro, exibir mensagem de erro
  if (erro) {
    return (
      <div data-cy="loja-indicador-erro">
        Erro ao carregar loja: {erro}
      </div>
    );
  }

  // Se não houver loja ativa, exibir mensagem
  if (!lojaAtiva) {
    return (
      <div data-cy="loja-indicador-vazio">
        Nenhuma loja selecionada
      </div>
    );
  }

  // Exibir loja ativa
  return (
    <div data-cy="loja-indicador">
      <strong>Loja:</strong> {lojaAtiva.nome}
      <span data-cy="loja-slug"> ({lojaAtiva.slug})</span>
    </div>
  );
}
