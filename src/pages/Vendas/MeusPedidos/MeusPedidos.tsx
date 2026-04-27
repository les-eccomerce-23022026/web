import { useEffect, useMemo, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { usePedidos } from '@/hooks/usePedidos';
import { fetchPerfilCompleto } from '@/store/slices/clienteSlice';
import { LoadingState } from '@/components/Comum/LoadingState/LoadingState';
import { EmptyState } from '@/components/Comum/EmptyState/EmptyState';
import { ErrorState } from '@/components/Comum/ErrorState/ErrorState';
import type { StatusPedido, IPedido } from '@/interfaces/pedido';
import type { ILivro } from '@/interfaces/livro';
import styles from './MeusPedidos.module.css';
import { mergeLivrosDestaqueEAdmin } from '@/utils/livrosLookup';
import { PedidoCard } from './PedidoCard';
import { ModalRastrearPedido } from './ModalRastrearPedido';
import { ModalDetalhesPedido } from './ModalDetalhesPedido';

type AbaGrupo = 'todos' | 'aberto' | 'finalizados';

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

function passaAbaGrupo(p: IPedido, aba: AbaGrupo): boolean {
  if (aba === 'todos') return true;
  if (aba === 'aberto') return STATUS_EM_ABERTO.includes(p.status);
  return STATUS_FINALIZADOS.includes(p.status);
}

export const MeusPedidos = () => {
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

  const { pedidos, loading, error } = usePedidos(user?.uuid);
  const [abaGrupo, setAbaGrupo] = useState<AbaGrupo>('todos');
  const [statusDetalhe, setStatusDetalhe] = useState<'' | StatusPedido>('');
  const [modalRastrear, setModalRastrear] = useState<IPedido | null>(null);
  const [modalDetalhes, setModalDetalhes] = useState<IPedido | null>(null);

  useEffect(() => {
    if (user?.uuid && enderecos.length === 0) {
      dispatch(fetchPerfilCompleto(user.uuid));
    }
  }, [dispatch, user?.uuid, enderecos.length]);

  const handleMudarAba = (novaAba: AbaGrupo) => {
    setAbaGrupo(novaAba);
    setStatusDetalhe('');
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
            >
              Todos os status
            </button>
            {opcoesRefinamento.map((s) => (
              <button
                key={s}
                type="button"
                className={`${styles.chip} ${statusDetalhe === s ? styles.chipAtivo : ''}`}
                onClick={() => setStatusDetalhe(s)}
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
};
