import React from 'react';
import type { IPedido, StatusPedido, IItemPedido } from '@/interfaces/pedido';
import type { ILivro } from '@/interfaces/livro';
import { CapaLivro } from '@/components/Comum/CapaLivro/CapaLivro';
import { PedidoTimelineEntrega } from './PedidoTimelineEntrega';
import { percentualBarraEntrega } from './pedidoEntregaEtapas';
import { getPedidoStatusVisual, type PedidoStatusVariant } from './pedidoStatusVisual';
import styles from './MeusPedidos.module.css';

const MAPA_CLASSES_STATUS: Record<string, string> = {
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

const MAPA_CORES_BARRA: Record<PedidoStatusVariant, string> = {
  entregue: styles.itemBarraFillEntregue,
  transito: styles.itemBarraFillTransito,
  preparando: styles.itemBarraFillPreparando,
  processamento: styles.itemBarraFillProcessamento,
  problema: styles.itemBarraFillProblema,
};

interface CartaoResumoPedidoProps {
  pedido: IPedido;
  livrosMap: Map<string, ILivro>;
  onRastrear?: (pedido: IPedido) => void;
  onVerDetalhes: (pedido: IPedido) => void;
  onSolicitarTroca?: (pedidoUuid: string) => void;
}

export const CartaoResumoPedido: React.FC<CartaoResumoPedidoProps> = ({
  pedido,
  livrosMap,
  onRastrear,
  onVerDetalhes,
  onSolicitarTroca,
}) => {
  const statusVisual = getPedidoStatusVisual(pedido.status);
  const IconeStatus = statusVisual.Icon;
  const porcentagemEntrega = percentualBarraEntrega(pedido.status);
  const classeBarra = MAPA_CORES_BARRA[statusVisual.variant];

  const formatarMoeda = (valor: number) => `R$ ${valor.toFixed(2).replace('.', ',')}`;

  const obterTituloItem = (item: IItemPedido) => 
    item.titulo || livrosMap.get(item.livroUuid)?.titulo || item.livroUuid;

  const totalUnidades = pedido.itens.reduce((acc, i) => acc + i.quantidade, 0);

  return (
    <div className={styles.pedidoCard} data-cy={`pedido-${pedido.uuid}`}>
      <div className={styles.pedidoHeader}>
        <div className={styles.pedidoHeaderMeta}>
          <span className={styles.pedidoIdMuted}>
            Pedido <span className={styles.pedidoUuid}>{pedido.uuid}</span>
          </span>
          <span className={styles.pedidoMetaSep}>·</span>
          <span className={styles.pedidoData}>
            {new Date(pedido.data).toLocaleDateString('pt-BR')}
          </span>
        </div>
        <span className={`${styles.statusBadge} ${MAPA_CLASSES_STATUS[pedido.status] || ''}`}>
          <IconeStatus className={styles.statusBadgeIcon} size={14} strokeWidth={2.25} />
          {pedido.status}
        </span>
      </div>

      <PedidoTimelineEntrega status={pedido.status} />

      <div className={styles.pedidoItens}>
        {pedido.itens.map((item, index) => (
          <div key={`${item.livroUuid}-${index}`} className={styles.itemRow}>
            <div className={styles.itemCapaWrap}>
              <CapaLivro
                src={livrosMap.get(item.livroUuid)?.imagem}
                alt={obterTituloItem(item)}
                titulo={obterTituloItem(item)}
                className={styles.itemCapaImg}
              />
            </div>
            <div className={styles.itemMain}>
              <span className={styles.itemTitulo}>{obterTituloItem(item)}</span>
              <div className={styles.itemBarraTrack}>
                <div
                  className={`${styles.itemBarraFill} ${classeBarra}`}
                  style={{ width: `${porcentagemEntrega}%` }}
                />
              </div>
              <span className={styles.itemLinhaPreco}>
                {item.quantidade} {item.quantidade === 1 ? 'unidade' : 'unidades'} × {formatarMoeda(item.precoUnitario)}
              </span>
            </div>
          </div>
        ))}
      </div>

      {(pedido.status === 'Em Troca' || pedido.status === 'Troca Autorizada') && (
        <p className={styles.trocaInfo}>Aguardando processamento da troca</p>
      )}
      {pedido.status === 'Trocado' && (
        <p className={styles.trocaConcluida}>Troca concluída — cupom gerado</p>
      )}

      <div className={styles.pedidoFooter}>
        <div className={styles.totalBloco}>
          <span className={styles.pedidoTotalLabel}>Total</span>
          <span className={styles.pedidoTotal}>{formatarMoeda(pedido.total)}</span>
          <span className={styles.pedidoItensCount}>
            ({totalUnidades} {totalUnidades === 1 ? 'item' : 'itens'})
          </span>
        </div>

        <div className={styles.acoes}>
          {(pedido.status === 'Em Trânsito' || pedido.status === 'Preparando') && onRastrear && (
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
            onClick={() => onVerDetalhes(pedido)}
            data-cy={`btn-detalhes-${pedido.uuid}`}
          >
            Ver detalhes
          </button>
          {pedido.status === 'Entregue' && onSolicitarTroca && (
            <button
              type="button"
              className={`btn-secondary ${styles.btnAcao} ${styles.btnAcaoNeutra}`}
              onClick={() => onSolicitarTroca(pedido.uuid)}
              data-cy={`btn-solicitar-troca-${pedido.uuid}`}
            >
              Solicitar troca
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
