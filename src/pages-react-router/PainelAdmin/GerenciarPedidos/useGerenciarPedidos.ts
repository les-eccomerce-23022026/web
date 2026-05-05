import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  fetchAllPedidos,
  despacharPedidoThunk,
  confirmarEntregaThunk,
  darBaixaEstoqueThunk,
} from '@/store/slices/pedidoSlice';
import type { IPedido, StatusPedido } from '@/interfaces/pedido';
import { mergeLivrosDestaqueEAdmin } from '@/utils/livrosLookup';

const STATUS_APROVADOS: StatusPedido[] = ['Em Processamento'];
const STATUS_TRANSITO: StatusPedido[] = ['Em Trânsito'];
const STATUS_GERENCIAVEIS: StatusPedido[] = ['Em Processamento', 'Em Trânsito'];

export function useGerenciarPedidos() {
  const dispatch = useAppDispatch();
  const { pedidos, status, error } = useAppSelector((state) => state.pedido);
  const livrosDestaque = useAppSelector((state) => state.livro.livrosDestaque);
  const livrosAdmin = useAppSelector((state) => state.livro.livrosAdmin);
  const livros = useMemo(
    () => mergeLivrosDestaqueEAdmin(livrosDestaque, livrosAdmin),
    [livrosDestaque, livrosAdmin],
  );

  const [filtroBusca, setFiltroBusca] = useState('');
  const [filtroStatus, setFiltroStatus] = useState<string>('todos');
  const [processando, setProcessando] = useState<string | null>(null);
  const [feedbackMsg, setFeedbackMsg] = useState('');

  useEffect(() => {
    dispatch(fetchAllPedidos(STATUS_GERENCIAVEIS));
  }, [dispatch]);

  const getLivroTitulo = useCallback(
    (livroUuid: string) => livros.find((l) => l.uuid === livroUuid)?.titulo ?? livroUuid,
    [livros],
  );

  const pedidosFiltrados = pedidos.filter((p) => {
    const buscaNome = filtroBusca.toLowerCase();
    const matchBusca =
      !filtroBusca ||
      p.uuid.toLowerCase().includes(buscaNome) ||
      p.itens.some((i) => getLivroTitulo(i.livroUuid).toLowerCase().includes(buscaNome));
    const matchStatus = filtroStatus === 'todos' || p.status === filtroStatus;
    return matchBusca && matchStatus;
  });

  const despachar = useCallback(
    async (pedido: IPedido) => {
      setProcessando(pedido.uuid);
      try {
        await dispatch(despacharPedidoThunk(pedido.uuid)).unwrap();
        // RF0053 — dar baixa no estoque ao despachar
        await dispatch(darBaixaEstoqueThunk(pedido.uuid)).unwrap();
        setFeedbackMsg(`Pedido #${pedido.uuid.split('-')[1]} despachado. Estoque atualizado.`);
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : 'Erro ao despachar pedido';
        setFeedbackMsg(`Erro: ${msg}`);
      } finally {
        setProcessando(null);
      }
    },
    [dispatch],
  );

  const confirmarEntrega = useCallback(
    async (pedidoUuid: string) => {
      setProcessando(pedidoUuid);
      try {
        await dispatch(confirmarEntregaThunk(pedidoUuid)).unwrap();
        setFeedbackMsg(`Pedido #${pedidoUuid.split('-')[1]} marcado como Entregue.`);
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : 'Erro ao confirmar entrega';
        setFeedbackMsg(`Erro: ${msg}`);
      } finally {
        setProcessando(null);
      }
    },
    [dispatch],
  );

  const isAprovado = (status: StatusPedido) => STATUS_APROVADOS.includes(status);
  const isEmTransito = (status: StatusPedido) => STATUS_TRANSITO.includes(status);

  return {
    pedidosFiltrados,
    loading: status === 'loading',
    error,
    processando,
    feedbackMsg,
    setFeedbackMsg,
    filtroBusca,
    setFiltroBusca,
    filtroStatus,
    setFiltroStatus,
    getLivroTitulo,
    despachar,
    confirmarEntrega,
    isAprovado,
    isEmTransito,
  };
}
