import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppSelector } from '@/store/hooks';
import { usePedidos } from '@/hooks/usePedidos';
import { LoadingState } from '@/components/Comum/LoadingState/LoadingState';
import { EmptyState } from '@/components/Comum/EmptyState/EmptyState';
import { ErrorState } from '@/components/Comum/ErrorState/ErrorState';
import type { StatusPedido, IPedido } from '@/interfaces/pedido';
import styles from './MeusPedidos.module.css';
import { mergeLivrosDestaqueEAdmin } from '@/utils/livrosLookup';

const TABS: { label: string; status: StatusPedido | 'Todos' }[] = [
  { label: 'Todos', status: 'Todos' },
  { label: 'Em Processamento', status: 'Em Processamento' },
  { label: 'Entregues', status: 'Entregue' },
  { label: 'Em Trânsito', status: 'Em Trânsito' },
  { label: 'Preparando', status: 'Preparando' },
  { label: 'Pendentes', status: 'Pendentes' },
  { label: 'Em Troca', status: 'Em Troca' },
  { label: 'Troca Autorizada', status: 'Troca Autorizada' },
  { label: 'Trocado', status: 'Trocado' },
];

function getStatusClass(status: StatusPedido): string {
  const map: Record<string, string> = {
    'Entregue': styles.statusEntregue,
    'Em Trânsito': styles.statusTransito,
    'Preparando': styles.statusPreparando,
    'Pendentes': styles.statusPendente,
    'Em Processamento': styles.statusProcessamento,
    'Em Troca': styles.statusEmTroca,
    'Troca Autorizada': styles.statusTrocaAutorizada,
    'Trocado': styles.statusTrocado,
    'Cancelado': styles.statusCancelado,
  };
  return map[status] || '';
}

function getLivroTitulo(item: { livroUuid: string; titulo?: string }, livros: { uuid: string; titulo: string }[]): string {
  if (item.titulo) return item.titulo;
  const livro = livros.find((l) => l.uuid === item.livroUuid);
  return livro?.titulo || item.livroUuid;
}

export const MeusPedidos = () => {
  const navigate = useNavigate();
  const { user } = useAppSelector((state) => state.auth);
  const livrosDestaque = useAppSelector((state) => state.livro.livrosDestaque);
  const livrosAdmin = useAppSelector((state) => state.livro.livrosAdmin);
  const livrosParaTitulo = useMemo(
    () => mergeLivrosDestaqueEAdmin(livrosDestaque, livrosAdmin),
    [livrosDestaque, livrosAdmin],
  );
  const { pedidos, loading, error, pedidosPorStatus } = usePedidos(user?.uuid);
  const [abaAtiva, setAbaAtiva] = useState<StatusPedido | 'Todos'>('Todos');

  if (loading) return <LoadingState message="Carregando seus pedidos..." />;
  if (error) return <ErrorState message={error} />;

  const pedidosFiltrados: IPedido[] =
    abaAtiva === 'Todos' ? pedidos : pedidosPorStatus(abaAtiva as StatusPedido);

  return (
    <div className={styles.container}>
      <h1 className="page-title">Meus Pedidos</h1>

      <div className={styles.tabs} data-cy="pedidos-tabs">
        {TABS.map((tab) => (
          <button
            key={tab.status}
            className={`${styles.tab} ${abaAtiva === tab.status ? styles.tabAtiva : ''}`}
            onClick={() => setAbaAtiva(tab.status)}
            data-cy={`tab-${tab.status.toLowerCase().replace(/\s/g, '-')}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {pedidosFiltrados.length === 0 && (
        <EmptyState message="Nenhum pedido encontrado para este filtro." />
      )}

      <div className={styles.lista} data-cy="pedidos-lista">
        {pedidosFiltrados.map((pedido) => (
          <div key={pedido.uuid} className={`card ${styles.pedidoCard}`} data-cy={`pedido-${pedido.uuid}`}>
            <div className={styles.pedidoHeader}>
              <div>
                <span className={styles.pedidoId}>Pedido #{pedido.uuid.split('-')[1]}</span>
                <span className={styles.pedidoData}>
                  {new Date(pedido.data).toLocaleDateString('pt-BR')}
                </span>
              </div>
              <span className={`${styles.statusBadge} ${getStatusClass(pedido.status)}`}>
                {pedido.status}
              </span>
            </div>

            <div className={styles.pedidoItens}>
              {pedido.itens.map((item) => (
                <div key={item.livroUuid} className={styles.itemRow}>
                  <span className={styles.itemTitulo}>
                    {getLivroTitulo(item, livrosParaTitulo)}
                  </span>
                  <span className={styles.itemQtd}>Qtd: {item.quantidade}</span>
                  <span className={styles.itemPreco}>
                    R$ {item.precoUnitario.toFixed(2).replace('.', ',')}
                  </span>
                </div>
              ))}
            </div>

            <div className={styles.pedidoFooter}>
              <span className={styles.pedidoTotal}>
                Total: R$ {pedido.total.toFixed(2).replace('.', ',')}
              </span>

              {pedido.status === 'Entregue' && (
                <button
                  className={`btn-secondary ${styles.btnTroca}`}
                  onClick={() => navigate(`/pedidos/${pedido.uuid}/troca`)}
                  data-cy={`btn-solicitar-troca-${pedido.uuid}`}
                >
                  Solicitar Troca
                </button>
              )}

              {(pedido.status === 'Em Troca' || pedido.status === 'Troca Autorizada') && (
                <span className={styles.trocaInfo}>
                  ⏳ Aguardando processamento da troca
                </span>
              )}

              {pedido.status === 'Trocado' && (
                <span className={styles.trocaConcluida}>
                  ✅ Troca concluída — cupom gerado
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
