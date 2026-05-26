import { CapaLivro } from '../../../components/Comum/CapaLivro/CapaLivro.tsx';
import type { IPedido } from '../../../interfaces/pedido';
import type { ILivro } from '../../../interfaces/livro';
import { PedidoTimelineEntrega } from './PedidoTimelineEntrega';
import { percentualBarraEntrega } from './pedidoEntregaEtapas';
import { getPedidoStatusVisual, type PedidoStatusVariant } from './pedidoStatusVisual';
import {
  formatMoeda,
  getStatusClass,
  tituloItem,
  totalUnidades,
} from './meusPedidosHelpers';
import styles from './style.module.css';

type Props = {
  pedido: IPedido;
  livrosMap: Map<string, ILivro>;
  onRastrear: (pedido: IPedido) => void;
  onDetalhes: (pedido: IPedido) => void;
};

const itemBarFillByVariant: Record<PedidoStatusVariant, string> = {
  entregue: styles.itemBarraFillEntregue,
  transito: styles.itemBarraFillTransito,
  preparando: styles.itemBarraFillPreparando,
  processamento: styles.itemBarraFillProcessamento,
  problema: styles.itemBarraFillProblema,
};

function verificarPrazoTroca(pedido: IPedido): { dentroPrazo: boolean; diasRestantes?: number } {
  if (!pedido.dataEntrega || pedido.status !== 'Entregue') {
    return { dentroPrazo: false };
  }

  const dataEntrega = new Date(pedido.dataEntrega);
  const hoje = typeof window !== 'undefined' ? new Date() : dataEntrega;
  const diffDias = Math.floor((hoje.getTime() - dataEntrega.getTime()) / (1000 * 60 * 60 * 24));
  const diasRestantes = 7 - diffDias;

  return {
    dentroPrazo: diasRestantes > 0,
    diasRestantes: diasRestantes > 0 ? diasRestantes : 0,
  };
}

export const PedidoCard = ({
  pedido,
  livrosMap,
  onRastrear,
  onDetalhes,
}: Props) => {
  const statusVisual = getPedidoStatusVisual(pedido.status);
  const StatusIcon = statusVisual.Icon;
  const pctEntrega = percentualBarraEntrega(pedido.status);
  const barFill = itemBarFillByVariant[statusVisual.variant];
  const prazoTroca = verificarPrazoTroca(pedido);

  return (
    <div
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
              onClick={() => onRastrear(pedido)}
              data-cy={`btn-rastrear-${pedido.uuid}`}
            >
              Rastrear entrega
            </button>
          )}
          <button
            type="button"
            className={`btn-secondary ${styles.btnAcao} ${styles.btnAcaoNeutra}`}
            onClick={() => onDetalhes(pedido)}
            data-cy={`btn-detalhes-${pedido.uuid}`}
          >
            Ver detalhes
          </button>
          {pedido.status === 'Entregue' && (
            <button
              type="button"
              className={`btn-secondary ${styles.btnAcao} ${styles.btnAcaoNeutra}`}
              onClick={() => onDetalhes(pedido)}
              disabled={!prazoTroca.dentroPrazo}
              title={
                !prazoTroca.dentroPrazo
                  ? 'Prazo de 7 dias para solicitação de troca expirado'
                  : 'Solicitar troca'
              }
              data-cy={`btn-solicitar-troca-${pedido.uuid}`}
            >
              Solicitar troca
            </button>
          )}
          {!prazoTroca.dentroPrazo && pedido.status === 'Entregue' && (
            <span className={styles.prazoExpirado}>
              Prazo de troca expirado (7 dias após entrega)
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
