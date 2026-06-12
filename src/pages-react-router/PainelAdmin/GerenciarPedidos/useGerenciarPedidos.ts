'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import {
  fetchAllPedidos,
  despacharPedidoThunk,
  confirmarEntregaThunk,
} from '../../../store/slices/pedidoSlice';
import type { IPedido, StatusPedido } from '../../../interfaces/pedido';
import { mergeLivrosDestaqueEAdmin } from '../../../utils/livrosLookup';
import { STATUS_PEDIDO } from '@/config/constantesNegocio';
import { ITENS_POR_PAGINA } from '@/config/constantesNegocio';
import { pedidoService } from '@/services/pedidoService';

const STATUS_APROVADOS: StatusPedido[] = [STATUS_PEDIDO.EM_PROCESSAMENTO];
const STATUS_TRANSITO: StatusPedido[] = [STATUS_PEDIDO.EM_TRANSITO];
const STATUS_PAGAMENTO_PENDENTE: StatusPedido[] = [STATUS_PEDIDO.PAGAMENTO_PENDENTE];
const STATUS_GERENCIAVEIS: StatusPedido[] = [
  STATUS_PEDIDO.PAGAMENTO_PENDENTE,
  STATUS_PEDIDO.EM_PROCESSAMENTO,
  STATUS_PEDIDO.EM_TRANSITO,
];

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
  const [filtrosColuna, setFiltrosColuna] = useState<Record<string, string>>({});
  const [processando, setProcessando] = useState<string | null>(null);
  const [feedbackMsg, setFeedbackMsg] = useState('');
  const [paginaAtual, setPaginaAtual] = useState(1);

  useEffect(() => {
    dispatch(fetchAllPedidos(STATUS_GERENCIAVEIS)).then(() => {
      console.log('[DEBUG useGerenciarPedidos] Pedidos após fetchAllPedidos:', pedidos);
    });
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
    
    const matchFiltrosColuna = Object.entries(filtrosColuna).every(([key, valor]) => {
      if (!valor) return true;
      const valorLower = valor.toLowerCase();
      const valorCelula = String((p as Record<string, any>)[key] || '').toLowerCase();
      return valorCelula.includes(valorLower);
    });

    return matchBusca && matchStatus && matchFiltrosColuna;
  });

  const handleFiltroColunaChange = useCallback((key: string, valor: string) => {
    setFiltrosColuna((prev) => ({ ...prev, [key]: valor }));
    setPaginaAtual(1);
  }, []);

  const totalPaginas = Math.ceil(pedidosFiltrados.length / ITENS_POR_PAGINA);
  const pedidosPaginados = useMemo(() => {
    const inicio = (paginaAtual - 1) * ITENS_POR_PAGINA;
    const fim = inicio + ITENS_POR_PAGINA;
    return pedidosFiltrados.slice(inicio, fim);
  }, [pedidosFiltrados, paginaAtual]);

  const aoMudarPagina = useCallback((pagina: number) => {
    setPaginaAtual(pagina);
  }, []);

  const despachar = useCallback(
    async (pedido: IPedido) => {
      setProcessando(pedido.uuid);
      try {
        await dispatch(despacharPedidoThunk(pedido.uuid)).unwrap();
        setFeedbackMsg(`Pedido #${pedido.uuid.split('-')[1]} despachado.`);
        await dispatch(fetchAllPedidos(STATUS_GERENCIAVEIS));
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
        await dispatch(fetchAllPedidos(STATUS_GERENCIAVEIS));
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : 'Erro ao confirmar entrega';
        setFeedbackMsg(`Erro: ${msg}`);
      } finally {
        setProcessando(null);
      }
    },
    [dispatch],
  );

  const [modalRejeicao, setModalRejeicao] = useState<{ uuid: string } | null>(null);
  const [motivoRejeicao, setMotivoRejeicao] = useState('');

  const abrirModalRejeicao = useCallback((pedidoUuid: string) => {
    setModalRejeicao({ uuid: pedidoUuid });
    setMotivoRejeicao('');
  }, []);

  const fecharModalRejeicao = useCallback(() => {
    setModalRejeicao(null);
    setMotivoRejeicao('');
  }, []);

  const confirmarRejeicao = useCallback(async () => {
    if (!modalRejeicao) return;
    const uuid = modalRejeicao.uuid;
    setProcessando(uuid);
    try {
      await pedidoService.mudarStatusVenda(uuid, 'CANCELADA');
      setFeedbackMsg(`Pedido #${uuid.split('-')[1]} rejeitado.`);
      fecharModalRejeicao();
      await dispatch(fetchAllPedidos(STATUS_GERENCIAVEIS));
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Erro ao rejeitar pagamento';
      setFeedbackMsg(`Erro: ${msg}`);
    } finally {
      setProcessando(null);
    }
  }, [modalRejeicao, motivoRejeicao, dispatch, fecharModalRejeicao]);

  const aprovarPagamento = useCallback(
    async (pedidoUuid: string) => {
      setProcessando(pedidoUuid);
      try {
        await pedidoService.aprovarPagamento(pedidoUuid);
        setFeedbackMsg(`Pagamento do pedido #${pedidoUuid.split('-')[1]} aprovado.`);
        await dispatch(fetchAllPedidos(STATUS_GERENCIAVEIS));
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : 'Erro ao aprovar pagamento';
        setFeedbackMsg(`Erro: ${msg}`);
      } finally {
        setProcessando(null);
      }
    },
    [dispatch],
  );

  const rejeitarPagamento = useCallback(
    async (pedidoUuid: string) => {
      setProcessando(pedidoUuid);
      try {
        await pedidoService.rejeitarPagamento(pedidoUuid);
        setFeedbackMsg(`Pagamento do pedido #${pedidoUuid.split('-')[1]} rejeitado.`);
        await dispatch(fetchAllPedidos(STATUS_GERENCIAVEIS));
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : 'Erro ao rejeitar pagamento';
        setFeedbackMsg(`Erro: ${msg}`);
      } finally {
        setProcessando(null);
      }
    },
    [dispatch],
  );

  const isAprovado = (status: StatusPedido) => STATUS_APROVADOS.includes(status);
  const isEmTransito = (status: StatusPedido) => STATUS_TRANSITO.includes(status);
  const isPagamentoPendente = (status: StatusPedido) => STATUS_PAGAMENTO_PENDENTE.includes(status);

  return {
    pedidosFiltrados,
    pedidosPaginados,
    totalPaginas,
    paginaAtual,
    aoMudarPagina,
    filtrosColuna,
    handleFiltroColunaChange,
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
    isPagamentoPendente,
    aprovarPagamento,
    rejeitarPagamento,
    modalRejeicao,
    motivoRejeicao,
    setMotivoRejeicao,
    abrirModalRejeicao,
    fecharModalRejeicao,
    confirmarRejeicao,
  };
}
