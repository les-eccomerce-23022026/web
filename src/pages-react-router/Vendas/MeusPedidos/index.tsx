'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import { usePedidos } from '../../../hooks/usePedidos';
import { fetchPerfilCompleto } from '../../../store/slices/clienteSlice';
import { fetchPedidosCliente } from '../../../store/slices/pedidoThunks';
import { LoadingState } from '../../../components/Comum/LoadingState/LoadingState.tsx';
import { EmptyState } from '../../../components/Comum/EmptyState/EmptyState.tsx';
import { ErrorState } from '../../../components/Comum/ErrorState/ErrorState.tsx';
import type { StatusPedido, IPedido } from '../../../interfaces/pedido';
import type { ILivro } from '../../../interfaces/livro';
import styles from './style.module.css';
import { mergeLivrosDestaqueEAdmin } from '../../../utils/livrosLookup';
import { PedidoCard } from './PedidoCard';
import { ModalRastrearPedido } from './ModalRastrearPedido';
import { ModalDetalhesPedido } from './ModalDetalhesPedido';
import { STATUS_PEDIDO } from '@/config/constantesNegocio';

type AbaGrupo = 'todos' | 'aberto' | 'finalizados';

const STATUS_EM_ABERTO: StatusPedido[] = [
  STATUS_PEDIDO.PENDENTE,
  STATUS_PEDIDO.PENDENTES,
  STATUS_PEDIDO.AGUARDANDO_PAGAMENTO,
  STATUS_PEDIDO.EM_PROCESSAMENTO,
  STATUS_PEDIDO.PREPARANDO,
  STATUS_PEDIDO.EM_TRANSITO,
  STATUS_PEDIDO.EM_TROCA,
  STATUS_PEDIDO.TROCA_AUTORIZADA,
  STATUS_PEDIDO.DEVOLUCOES,
];

const STATUS_FINALIZADOS: StatusPedido[] = [
  STATUS_PEDIDO.ENTREGUE,
  STATUS_PEDIDO.TROCADO,
  STATUS_PEDIDO.CANCELADO,
];

function passaAbaGrupo(p: IPedido, aba: AbaGrupo): boolean {
  if (aba === 'todos') return true;
  if (aba === 'aberto') return STATUS_EM_ABERTO.includes(p.status);
  return STATUS_FINALIZADOS.includes(p.status);
}

function MeusPedidos() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const enderecos = useAppSelector((state) => state.cliente.enderecos);
  const livrosDestaque = useAppSelector((state) => state.livro.livrosDestaque);
  const livrosAdmin = useAppSelector((state) => state.livro.livrosAdmin);
  const livrosMerged = useMemo(
    () => mergeLivrosDestaqueEAdmin(livrosDestaque, livrosAdmin),
    [livrosDestaque, livrosAdmin],
  );
  const livrosMap = useMemo(() => {
    const m = new Map<string, ILivro>();
    for (const l of livrosMerged) {
      m.set(l.uuid, l);
    }
    return m;
  }, [livrosMerged]);

  const { pedidos, loading, error, confirmarRecebimentoEntrega } = usePedidos(user?.uuid);
  const [abaGrupo, setAbaGrupo] = useState<AbaGrupo>('todos');
  const [statusDetalhe, setStatusDetalhe] = useState<'' | StatusPedido>('');
  const [modalRastrear, setModalRastrear] = useState<IPedido | null>(null);
  const [modalDetalhes, setModalDetalhes] = useState<IPedido | null>(null);
  const [confirmandoRecebimento, setConfirmandoRecebimento] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (user?.uuid && enderecos.length === 0) {
      dispatch(fetchPerfilCompleto(user.uuid));
    }
  }, [dispatch, user?.uuid, enderecos.length]);

  const handleMudarAba = (novaAba: AbaGrupo) => {
    setAbaGrupo(novaAba);
    setStatusDetalhe('');
  };

  const handleConfirmarRecebimento = async (pedido: IPedido) => {
    if (!pedido.uuid) return;
    
    setConfirmandoRecebimento((prev) => new Set(prev).add(pedido.uuid));
    
    try {
      await confirmarRecebimentoEntrega(pedido.uuid);
      // Após confirmação bem-sucedida, recarregar pedidos
      dispatch(fetchPedidosCliente(user?.uuid || ''));
    } catch (err) {
      console.error('Erro ao confirmar recebimento:', err);
    } finally {
      setConfirmandoRecebimento((prev) => {
        const next = new Set(prev);
        next.delete(pedido.uuid);
        return next;
      });
    }
  };

  const opcoesRefinamento = useMemo(() => {
    const base = pedidos.filter((p) => passaAbaGrupo(p, abaGrupo));
    const set = new Set(
      base
        .map((p) => p.status)
        .filter((s): s is StatusPedido => typeof s === 'string' && s.trim().length > 0),
    );
    return Array.from(set).sort((a, b) => a.localeCompare(b, 'pt-BR'));
  }, [pedidos, abaGrupo]);

  const pedidosFiltrados = useMemo(() => {
    let list = pedidos.filter((p) => passaAbaGrupo(p, abaGrupo));
    
    if (statusDetalhe && opcoesRefinamento.includes(statusDetalhe)) {
      list = list.filter((p) => p.status === statusDetalhe);
    }
    
    return list;
  }, [pedidos, abaGrupo, statusDetalhe, opcoesRefinamento]);

  if (loading) return <LoadingState message="Carregando seus pedidos..." />;
  if (error) return <ErrorState message={error} />;

  const enderecoPedido = (p: IPedido) =>
    p.enderecoUuid
      ? enderecos.find((e) => e.uuid === p.enderecoUuid)
      : undefined;

  return (
    <div className={styles.container}>
      <h1 className="page-title">Meus Pedidos</h1>

      <div className={styles.filtrosBar}>
        <div className={styles.stepper} data-cy="pedidos-tabs">
          <button
            type="button"
            className={`${styles.stepperStep} ${abaGrupo === 'todos' ? styles.stepperStepAtiva : ''}`}
            onClick={() => handleMudarAba('todos')}
            data-cy="tab-todos"
          >
            <span className={styles.stepperIndex} aria-hidden>
              1
            </span>
            Todos
          </button>
          <span className={styles.stepperConnector} aria-hidden />
          <button
            type="button"
            className={`${styles.stepperStep} ${abaGrupo === 'aberto' ? styles.stepperStepAtiva : ''}`}
            onClick={() => handleMudarAba('aberto')}
            data-cy="tab-aberto"
          >
            <span className={styles.stepperIndex} aria-hidden>
              2
            </span>
            Em aberto
          </button>
          <span className={styles.stepperConnector} aria-hidden />
          <button
            type="button"
            className={`${styles.stepperStep} ${abaGrupo === 'finalizados' ? styles.stepperStepAtiva : ''}`}
            onClick={() => handleMudarAba('finalizados')}
            data-cy="tab-finalizados"
          >
            <span className={styles.stepperIndex} aria-hidden>
              3
            </span>
            Finalizados
          </button>
        </div>

        <div className={styles.chipsBlock}>
          <p className={styles.chipsLabel}>Filtrar por status</p>
          <div className={styles.chipsRow} data-cy="pedidos-filtro-status">
            <button
              type="button"
              className={`${styles.chip} ${statusDetalhe === '' ? styles.chipAtivo : ''}`}
              onClick={() => setStatusDetalhe('')}
              data-cy="pedidos-filtro-todos"
            >
              Todos os status
            </button>
            {opcoesRefinamento.map((s) => (
              <button
                key={s}
                type="button"
                className={`${styles.chip} ${statusDetalhe === s ? styles.chipAtivo : ''}`}
                onClick={() => setStatusDetalhe(s)}
                data-cy={`pedidos-filtro-${s.toLowerCase().replace(/\s+/g, '-')}`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>

      {pedidosFiltrados.length === 0 && (
        <EmptyState message="Nenhum pedido encontrado para este filtro." />
      )}

      <div className={styles.lista} data-cy="pedidos-lista">
        {pedidosFiltrados.map((pedido) => (
          <PedidoCard
            key={pedido.uuid}
            pedido={pedido}
            livrosMap={livrosMap}
            onRastrear={setModalRastrear}
            onDetalhes={setModalDetalhes}
            onSolicitarTroca={(p) => {
              // Navegar para página de solicitação de troca usando Next.js router
              router.push(`/pedidos/${p.uuid}/troca`);
            }}
            onConfirmarRecebimento={handleConfirmarRecebimento}
            confirmandoRecebimento={confirmandoRecebimento.has(pedido.uuid)}
          />
        ))}
      </div>

      <ModalRastrearPedido
        pedido={modalRastrear}
        onClose={() => setModalRastrear(null)}
      />

      <ModalDetalhesPedido
        pedido={modalDetalhes}
        livrosMap={livrosMap}
        enderecoPedido={enderecoPedido}
        onClose={() => setModalDetalhes(null)}
      />
    </div>
  );
}

export default MeusPedidos;
export { MeusPedidos };
