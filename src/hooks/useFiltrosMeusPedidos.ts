import { useState, useMemo, useCallback } from 'react';
import type { IPedido, StatusPedido } from '@/interfaces/pedido';

export type AbaGrupo = 'todos' | 'aberto' | 'finalizados';

const STATUS_EM_ABERTO: StatusPedido[] = [
  'Pendentes',
  'Aguardando Pagamento',
  'Em Processamento',
  'Preparando',
  'Em Trânsito',
  'Em Troca',
  'Troca Autorizada',
  'Devoluções',
];

const STATUS_FINALIZADOS: StatusPedido[] = ['Entregue', 'Trocado', 'Cancelado'];

/**
 * Hook para gerenciar a filtragem dos pedidos do cliente por abas e status.
 * @param pedidos Lista bruta de pedidos vinda do serviço/store.
 * @returns Estados de filtragem e lista de pedidos processada.
 */
export function useFiltrosMeusPedidos(pedidos: IPedido[]) {
  const [abaAtiva, setAbaAtiva] = useState<AbaGrupo>('todos');
  const [statusAtivo, setStatusAtivo] = useState<StatusPedido | ''>('');

  const alterarAba = useCallback((novaAba: AbaGrupo) => {
    setAbaAtiva(novaAba);
    setStatusAtivo(''); // Limpa o filtro de status ao trocar de aba principal
  }, []);

  const alterarStatusFiltro = useCallback((novoStatus: StatusPedido | '') => {
    setStatusAtivo(novoStatus);
  }, []);

  const pedidosFiltradosPorAba = useMemo(() => {
    if (abaAtiva === 'todos') return pedidos;
    if (abaAtiva === 'aberto') return pedidos.filter(p => STATUS_EM_ABERTO.includes(p.status));
    return pedidos.filter(p => STATUS_FINALIZADOS.includes(p.status));
  }, [pedidos, abaAtiva]);

  const pedidosFiltrados = useMemo(() => {
    if (!statusAtivo) return pedidosFiltradosPorAba;
    return pedidosFiltradosPorAba.filter(p => p.status === statusAtivo);
  }, [pedidosFiltradosPorAba, statusAtivo]);

  const opcoesStatusDisponiveis = useMemo(() => {
    const set = new Set(
      pedidosFiltradosPorAba
        .map(p => p.status)
        .filter((s): s is StatusPedido => typeof s === 'string' && s.trim().length > 0)
    );
    return Array.from(set).sort((a, b) => a.localeCompare(b, 'pt-BR'));
  }, [pedidosFiltradosPorAba]);

  return {
    abaAtiva,
    statusAtivo,
    pedidosFiltrados,
    opcoesStatusDisponiveis,
    alterarAba,
    alterarStatusFiltro
  };
}
