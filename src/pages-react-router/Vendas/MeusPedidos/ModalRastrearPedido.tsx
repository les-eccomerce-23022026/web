import { Modal } from '@/components/Comum/Modal/Modal';
import type { IPedido } from '@/interfaces/pedido';
import styles from './MeusPedidos.module.css';

type Props = {
  pedido: IPedido | null;
  onClose: () => void;
};

export const ModalRastrearPedido = ({ pedido, onClose }: Props) => {
  return (
    <Modal
      isOpen={!!pedido}
      onClose={onClose}
      title="Acompanhar entrega"
      footer={
        <button
          type="button"
          className="btn-secondary"
          onClick={onClose}
        >
          Fechar
        </button>
      }
    >
      {pedido && (
        <div className={styles.modalTexto}>
          <p>
            <strong>Pedido </strong>
            <span className={styles.pedidoUuid}>{pedido.uuid}</span>
          </p>
          <p>Status atual: {pedido.status}</p>
          {pedido.status === 'Preparando' ? (
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
  );
};
