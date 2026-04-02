import styles from './Checkout.module.css';
import { EnderecoEntregaCard } from '@/components/checkout/entrega';
import type { ICheckoutInfo } from '@/interfaces/ICheckout';

type Props = {
  data: ICheckoutInfo;
  enderecoSelecionado: string | null;
  onSelectEndereco: (uuid: string | null) => void;
};

export const CheckoutEnderecoCard = ({
  data,
  enderecoSelecionado,
  onSelectEndereco,
}: Props) => {
  const temLista = data.enderecosDisponiveis && data.enderecosDisponiveis.length > 0;

  if (temLista) {
    return (
      <div className={`card ${styles['checkout-card-spaced']}`}>
        <h3>Endereço de Entrega</h3>
        <EnderecoEntregaCard
          enderecos={data.enderecosDisponiveis!}
          selecionado={enderecoSelecionado}
          onSelect={onSelectEndereco}
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
      <p>
        {data.enderecoEntrega.logradouro}, {data.enderecoEntrega.numero},{' '}
        {data.enderecoEntrega.complemento}
      </p>
      <p>
        {data.enderecoEntrega.cidade} - {data.enderecoEntrega.estado}, CEP:{' '}
        {data.enderecoEntrega.cep}
      </p>
      <a href="#" className={styles['checkout-link-alt']}>
        Alterar endereço
      </a>
    </div>
  );
};
