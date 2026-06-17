import { useState, useEffect, useCallback, useRef } from 'react';
import { AdminClienteService } from '../../../services/adminClienteService';
import type {
  IClienteAdminItem,
  IDetalheClienteAdmin,
} from '../../../services/contracts/adminClienteService';

const DEBOUNCE_MS = 400;
const LIMITE_PAGINA = 20;

export function useGestaoClientes() {
  const [clientes, setClientes] = useState<IClienteAdminItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtroBusca, setFiltroBusca] = useState('');
  const [filtroAtivo, setFiltroAtivo] = useState<'todos' | 'ativo' | 'inativo'>('todos');
  const [pagina, setPagina] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPaginas, setTotalPaginas] = useState(1);

  const [clienteSelecionado, setClienteSelecionado] = useState<IClienteAdminItem | null>(null);
  const [detalheCliente, setDetalheCliente] = useState<IDetalheClienteAdmin | null>(null);
  const [loadingDetalhe, setLoadingDetalhe] = useState(false);

  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [toastTipo, setToastTipo] = useState<'sucesso' | 'erro'>('sucesso');

  const [modalConfirmar, setModalConfirmar] = useState(false);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const carregarClientes = useCallback(
    async (busca: string, status: 'todos' | 'ativo' | 'inativo', pg: number) => {
      setLoading(true);
      try {
        const filtros: {
          pagina: number;
          limite: number;
          nome?: string;
          ativo?: boolean;
        } = { pagina: pg, limite: LIMITE_PAGINA };

        if (busca.trim()) filtros.nome = busca.trim();
        if (status === 'ativo') filtros.ativo = true;
        if (status === 'inativo') filtros.ativo = false;

        const resultado = await AdminClienteService.listarClientes(filtros);
        setClientes(resultado.clientes);
        setTotal(resultado.total);
        setTotalPaginas(resultado.totalPaginas);
      } catch (error) {
        console.error('Erro ao carregar clientes:', error);
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setPagina(1);
      carregarClientes(filtroBusca, filtroAtivo, 1);
    }, DEBOUNCE_MS);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [filtroBusca, filtroAtivo, carregarClientes]);

  useEffect(() => {
    carregarClientes(filtroBusca, filtroAtivo, pagina);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagina]);

  const selecionarCliente = useCallback(async (cliente: IClienteAdminItem) => {
    setClienteSelecionado(cliente);
    setDetalheCliente(null);
    setLoadingDetalhe(true);
    try {
      const detalhe = await AdminClienteService.obterClientePorUuid(cliente.uuid);
      setDetalheCliente(detalhe);
    } catch (error) {
      console.error('Erro ao buscar detalhe do cliente:', error);
    } finally {
      setLoadingDetalhe(false);
    }
  }, []);

  const mostrarToast = useCallback((msg: string, tipo: 'sucesso' | 'erro') => {
    setToastMsg(msg);
    setToastTipo(tipo);
    setTimeout(() => setToastMsg(null), 3500);
  }, []);

  const confirmarAlterarStatus = useCallback(async () => {
    if (!detalheCliente) return;
    const novoStatus = !detalheCliente.ativo;
    setModalConfirmar(false);
    try {
      await AdminClienteService.inativarCliente(detalheCliente.uuid, novoStatus);
      const detalheAtualizado = { ...detalheCliente, ativo: novoStatus };
      setDetalheCliente(detalheAtualizado);
      setClienteSelecionado(detalheAtualizado);
      setClientes((prev) =>
        prev.map((c) => (c.uuid === detalheCliente.uuid ? { ...c, ativo: novoStatus } : c)),
      );
      mostrarToast(
        novoStatus ? 'Cliente reativado com sucesso.' : 'Cliente inativado com sucesso.',
        'sucesso',
      );
    } catch (error) {
      console.error('Erro ao alterar status do cliente:', error);
      mostrarToast('Erro ao alterar status do cliente.', 'erro');
    }
  }, [detalheCliente, mostrarToast]);

  const irParaPagina = useCallback((novaPagina: number) => {
    setPagina(novaPagina);
  }, []);

  return {
    clientes,
    loading,
    filtroBusca,
    setFiltroBusca,
    filtroAtivo,
    setFiltroAtivo: (v: 'todos' | 'ativo' | 'inativo') => {
      setFiltroAtivo(v);
      setPagina(1);
    },
    clienteSelecionado,
    setClienteSelecionado: (c: IClienteAdminItem | null) => {
      setClienteSelecionado(c);
      setDetalheCliente(null);
    },
    selecionarCliente,
    detalheCliente,
    loadingDetalhe,
    total,
    totalPaginas,
    pagina,
    irParaPagina,
    modalConfirmar,
    setModalConfirmar,
    confirmarAlterarStatus,
    toastMsg,
    toastTipo,
  };
}
