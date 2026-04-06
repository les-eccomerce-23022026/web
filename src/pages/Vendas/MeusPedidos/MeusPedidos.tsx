import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { usePedidos } from '@/hooks/usePedidos';
import { fetchPerfilCompleto } from '@/store/slices/clienteSlice';
import { LoadingState } from '@/components/Comum/LoadingState/LoadingState';
import { EmptyState } from '@/components/Comum/EmptyState/EmptyState';
import { ErrorState } from '@/components/Comum/ErrorState/ErrorState';
import { Modal } from '@/components/Comum/Modal/Modal';
import { CapaLivro } from '@/components/Comum/CapaLivro/CapaLivro';
import type { StatusPedido, IPedido, IItemPedido } from '@/interfaces/pedido';
import type { ILivro } from '@/interfaces/livro';
import styles from './MeusPedidos.module.css';
import { mergeLivrosDestaqueEAdmin } from '@/utils/livrosLookup';
import { PedidoTimelineEntrega } from './PedidoTimelineEntrega';
import { percentualBarraEntrega } from './pedidoEntregaEtapas';
import { getPedidoStatusVisual, type PedidoStatusVariant } from './pedidoStatusVisual';

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

function formatMoeda(n: number): string {
  return `R$ ${n.toFixed(2).replace('.', ',')}`;
}

function getStatusClass(status: StatusPedido): string {
  const map: Record<string, string> = {
    Entregue: styles.statusEntregue,
    'Em Trânsito': styles.statusTransito,
    Preparando: styles.statusPreparando,
    Pendentes: styles.statusPendente,
    'Aguardando Pagamento': styles.statusAguardandoPagamento,
    'Em Processamento': styles.statusProcessamento,
    'Em Troca': styles.statusEmTroca,
    'Troca Autorizada': styles.statusTrocaAutorizada,
    Trocado: styles.statusTrocado,
    Cancelado: styles.statusCancelado,
    Devoluções: styles.statusDevolucoes,
  };
  return map[status] || '';
}

function tituloItem(item: IItemPedido, livrosMap: Map<string, ILivro>): string {
  if (item.titulo) return item.titulo;
  return livrosMap.get(item.livroUuid)?.titulo ?? item.livroUuid;
}

const itemBarFillByVariant: Record<PedidoStatusVariant, string> = {
  entregue: styles.itemBarraFillEntregue,
  transito: styles.itemBarraFillTransito,
  preparando: styles.itemBarraFillPreparando,
  processamento: styles.itemBarraFillProcessamento,
  problema: styles.itemBarraFillProblema,
};

export const MeusPedidos = () => {
  const navigate = useNavigate();
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

  useEffect(() => {
    setStatusDetalhe('');
  }, [abaGrupo]);

  const opcoesRefinamento = useMemo(() => {
    const base = pedidos.filter((p) => passaAbaGrupo(p, abaGrupo));
    const set = new Set(
      base
        .map((p) => p.status)
        .filter((s): s is StatusPedido => typeof s === 'string' && s.trim().length > 0),
    );
    return Array.from(set).sort((a, b) => a.localeCompare(b, 'pt-BR'));
  }, [pedidos, abaGrupo]);

  useEffect(() => {
    if (
      statusDetalhe &&
      !opcoesRefinamento.includes(statusDetalhe)
    ) {
      setStatusDetalhe('');
    }
  }, [opcoesRefinamento, statusDetalhe]);

  const pedidosFiltrados = useMemo(() => {
    let list = pedidos.filter((p) => passaAbaGrupo(p, abaGrupo));
    if (statusDetalhe) {
      list = list.filter((p) => p.status === statusDetalhe);
    }
    return list;
  }, [pedidos, abaGrupo, statusDetalhe]);

  if (loading) return <LoadingState message="Carregando seus pedidos..." />;
  if (error) return <ErrorState message={error} />;

  const totalUnidades = (p: IPedido) =>
    p.itens.reduce((acc, i) => acc + i.quantidade, 0);

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
            onClick={() => setAbaGrupo('todos')}
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
            onClick={() => setAbaGrupo('aberto')}
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
            onClick={() => setAbaGrupo('finalizados')}
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
        {pedidosFiltrados.map((pedido) => {
          const statusVisual = getPedidoStatusVisual(pedido.status);
          const StatusIcon = statusVisual.Icon;
          const pctEntrega = percentualBarraEntrega(pedido.status);
          const barFill = itemBarFillByVariant[statusVisual.variant];

          return (
          <div
            key={pedido.uuid}
            className={styles.pedidoCard}
            data-cy={`pedido-${pedido.uuid}`}
          >
            <div className={styles.pedidoHeader}>
              <div className={styles.pedidoHeaderMeta}>
                <span className={styles.pedidoIdMuted}>
                  Pedido{' '}
                  <span className={styles.pedidoUuid}>{pedido.uuid}</span>
                </span>
                <span className={styles.pedidoMetaSep}>·</span>
                <span className={styles.pedidoData}>
                  {new Date(pedido.data).toLocaleDateString('pt-BR')}
                </span>
              </div>
              <span
                className={`${styles.statusBadge} ${getStatusClass(pedido.status)}`}
              >
                <StatusIcon className={styles.statusBadgeIcon} size={14} strokeWidth={2.25} aria-hidden />
                {pedido.status}
              </span>
            </div>

            <PedidoTimelineEntrega status={pedido.status} />

            <div className={styles.pedidoItens}>
              {pedido.itens.map((item, idx) => (
                <div
                  key={`${item.livroUuid}-${idx}`}
                  className={styles.itemRow}
                >
                  <div className={styles.itemCapaWrap}>
                    <CapaLivro
                      src={livrosMap.get(item.livroUuid)?.imagem}
                      alt={tituloItem(item, livrosMap)}
                      titulo={tituloItem(item, livrosMap)}
                      className={styles.itemCapaImg}
                    />
                  </div>
                  <div className={styles.itemMain}>
                    <span className={styles.itemTitulo}>
                      {tituloItem(item, livrosMap)}
                    </span>
                    <div
                      className={styles.itemBarraTrack}
                      role="presentation"
                      aria-hidden
                    >
                      <div
                        className={`${styles.itemBarraFill} ${barFill}`}
                        style={{ width: `${pctEntrega}%` }}
                      />
                    </div>
                    <span className={styles.itemLinhaPreco}>
                      {item.quantidade}{' '}
                      {item.quantidade === 1 ? 'unidade' : 'unidades'} ×{' '}
                      {formatMoeda(item.precoUnitario)}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {(pedido.status === 'Em Troca' ||
              pedido.status === 'Troca Autorizada') && (
              <p className={styles.trocaInfo}>
                Aguardando processamento da troca
              </p>
            )}
            {pedido.status === 'Trocado' && (
              <p className={styles.trocaConcluida}>
                Troca concluída — cupom gerado
              </p>
            )}

            <div className={styles.pedidoFooter}>
              <div className={styles.totalBloco}>
                <span className={styles.pedidoTotalLabel}>Total</span>
                <span className={styles.pedidoTotal}>
                  {formatMoeda(pedido.total)}
                </span>
                <span className={styles.pedidoItensCount}>
                  ({totalUnidades(pedido)}{' '}
                  {totalUnidades(pedido) === 1 ? 'item' : 'itens'})
                </span>
              </div>

              <div className={styles.acoes}>
                {(pedido.status === 'Em Trânsito' ||
                  pedido.status === 'Preparando') && (
                  <button
                    type="button"
                    className={`btn-primary ${styles.btnAcao}`}
                    onClick={() => setModalRastrear(pedido)}
                    data-cy={`btn-rastrear-${pedido.uuid}`}
                  >
                    Rastrear entrega
                  </button>
                )}
                <button
                  type="button"
                  className={`btn-secondary ${styles.btnAcao} ${styles.btnAcaoNeutra}`}
                  onClick={() => setModalDetalhes(pedido)}
                  data-cy={`btn-detalhes-${pedido.uuid}`}
                >
                  Ver detalhes
                </button>
                {pedido.status === 'Entregue' && (
                  <button
                    type="button"
                    className={`btn-secondary ${styles.btnAcao} ${styles.btnAcaoNeutra}`}
                    onClick={() => navigate(`/pedidos/${pedido.uuid}/troca`)}
                    data-cy={`btn-solicitar-troca-${pedido.uuid}`}
                  >
                    Solicitar troca
                  </button>
                )}
              </div>
            </div>
          </div>
          );
        })}
      </div>

      <Modal
        isOpen={!!modalRastrear}
        onClose={() => setModalRastrear(null)}
        title="Acompanhar entrega"
        footer={
          <button
            type="button"
            className="btn-secondary"
            onClick={() => setModalRastrear(null)}
          >
            Fechar
          </button>
        }
      >
        {modalRastrear && (
          <div className={styles.modalTexto}>
            <p>
              <strong>Pedido </strong>
              <span className={styles.pedidoUuid}>{modalRastrear.uuid}</span>
            </p>
            <p>Status atual: {modalRastrear.status}</p>
            {modalRastrear.status === 'Preparando' ? (
              <p>
                Seu pedido está sendo preparado para envio. O código de
                rastreamento e o link da transportadora serão integrados em uma
                versão futura — por enquanto, acompanhe as atualizações nesta
                página.
              </p>
            ) : (
              <p>
                Acompanhe as atualizações de status aqui. Integração com código
                de rastreio da transportadora será disponibilizada em versão
                futura.
              </p>
            )}
          </div>
        )}
      </Modal>

      <Modal
        isOpen={!!modalDetalhes}
        onClose={() => setModalDetalhes(null)}
        title="Detalhes do pedido"
        variant="large"
        footer={
          <button
            type="button"
            className="btn-secondary"
            onClick={() => setModalDetalhes(null)}
          >
            Fechar
          </button>
        }
      >
        {modalDetalhes && (
          <div className={styles.modalDetalhes}>
            <p>
              <strong>Pedido </strong>
              <span className={styles.pedidoUuid}>{modalDetalhes.uuid}</span>
            </p>
            <p className={styles.modalDataLinha}>
              Data:{' '}
              {new Date(modalDetalhes.data).toLocaleString('pt-BR', {
                dateStyle: 'long',
                timeStyle: 'short',
              })}
            </p>

            <table className={styles.modalResumoTable}>
              <tbody>
                <tr>
                  <th scope="row" className={styles.modalResumoLabel}>
                    Status
                  </th>
                  <td className={styles.modalResumoValor}>
                    {modalDetalhes.status}
                  </td>
                </tr>
                {modalDetalhes.itens.map((item, idx) => (
                  <tr key={`${item.livroUuid}-${idx}`}>
                    {idx === 0 ? (
                      <th
                        scope="row"
                        rowSpan={modalDetalhes.itens.length}
                        className={styles.modalResumoLabel}
                      >
                        Itens
                      </th>
                    ) : null}
                    <td className={styles.modalResumoValor}>
                      {tituloItem(item, livrosMap)} — {item.quantidade}{' '}
                      {item.quantidade === 1 ? 'unidade' : 'unidades'} ×{' '}
                      {formatMoeda(item.precoUnitario)}
                    </td>
                  </tr>
                ))}
                <tr>
                  <th scope="row" className={styles.modalResumoLabel}>
                    Total
                  </th>
                  <td className={styles.modalResumoTotal}>
                    {formatMoeda(modalDetalhes.total)}
                  </td>
                </tr>
              </tbody>
            </table>

            {modalDetalhes.formaPagamento &&
              modalDetalhes.formaPagamento.length > 0 && (
                <>
                  <h3 className={styles.modalSecaoTitulo}>Pagamento</h3>
                  <ul className={styles.modalListaItens}>
                    {modalDetalhes.formaPagamento.map((fp, i) => (
                      <li key={i}>
                        {fp.tipo === 'cartao' ? (
                          <>
                            Cartão {fp.bandeira ?? ''} final{' '}
                            {fp.cartaoFinal ?? '—'} — {formatMoeda(fp.valor)}
                          </>
                        ) : (
                          <>
                            Cupom {fp.codigo ?? '—'} — {formatMoeda(fp.valor)}
                          </>
                        )}
                      </li>
                    ))}
                  </ul>
                </>
              )}

            <h3 className={styles.modalSecaoTitulo}>Entrega</h3>
            {(() => {
              const end = enderecoPedido(modalDetalhes);
              if (end) {
                return (
                  <p className={styles.modalEndereco}>
                    {end.logradouro}, {end.numero}
                    {end.complemento ? ` — ${end.complemento}` : ''} —{' '}
                    {end.bairro}, {end.cidade}/{end.estado} — CEP {end.cep}
                  </p>
                );
              }
              return (
                <p className={styles.modalMuted}>
                  Endereço de entrega não está disponível nesta visualização.
                  Confira o e-mail de confirmação da compra ou atualize seu
                  perfil.
                </p>
              );
            })()}

            <p className={styles.modalMuted}>
              Nota fiscal: disponibilizada por e-mail após o faturamento, quando
              aplicável.
            </p>
          </div>
        )}
      </Modal>
    </div>
  );
};
