import { MapPin } from 'lucide-react';
import styles from './FinalizarCompra.module.css';
import enderecoStyles from '@/components/FinalizarCompra/Entrega/EnderecoEntregaCard.module.css';
import { EnderecoEntregaCard } from '@/components/FinalizarCompra/Entrega';
import type { ICheckoutInfo } from '@/interfaces/checkout';

type Props = {
  data: ICheckoutInfo;
  enderecoSelecionado: string | null;
  onSelectEndereco: (uuid: string | null) => void;
  onAddEndereco: () => void;
  onEditEndereco: (uuid: string) => void;
};

export const FinalizarCompraEnderecoCard = ({
  data,
  enderecoSelecionado,
  onSelectEndereco,
  onAddEndereco,
  onEditEndereco,
}: Props) => {
  const temLista = data.enderecosDisponiveis && data.enderecosDisponiveis.length > 0;

  if (temLista) {
    return (
      <div className={`card ${styles['checkout-card-spaced']}`}>
        <div className={styles['card-header-with-action']}>
          <h3>Endereço de Entrega</h3>
          <button 
            className={`btn-secondary ${styles['btn-header-small']}`}
            onClick={onAddEndereco}
            data-cy="checkout-add-address-button-top"
          >
            + Novo Endereço
          </button>
        </div>
        <EnderecoEntregaCard
          enderecos={data.enderecosDisponiveis!}
          selecionado={enderecoSelecionado}
          onSelect={onSelectEndereco}
          onEdit={onEditEndereco}
        />
        {enderecoSelecionado && (
          <p className={styles['endereco-selecionado-info']}>
            ✓ Endereço selecionado para entrega
          </p>
        )}
      </div>
    );
  }

  return (
    <div className={`card ${styles['checkout-card-spaced']}`}>
      <h3>Endereço de Entrega</h3>
      <div className={enderecoStyles['sem-enderecos']} data-cy="checkout-no-addresses">
        <MapPin size={48} strokeWidth={1.5} />
        <p>Nenhum endereço cadastrado</p>
        <span>É necessário cadastrar um endereço para continuar a compra.</span>
        <button
          className="btn-secondary"
          onClick={onAddEndereco}
          data-cy="checkout-add-address-button"
        >
          Adicionar Endereço
        </button>
      </div>
    </div>
  );
};
