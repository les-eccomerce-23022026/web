import styles from './FinalizarCompra.module.css';

type Props = {
  quantidadeItens: number;
  subtotal: number;
  frete: number;
  descontoCupons: number;
  valorPagoParcialmente: number;
};

export const FinalizarCompraResumoPedidoLista = ({
  quantidadeItens,
  subtotal,
  frete,
  descontoCupons,
  valorPagoParcialmente,
}: Props) => {
  const labelItens = quantidadeItens === 1 ? 'item' : 'itens';

  return (
    <ul className={styles['checkout-summary-list']} data-cy="checkout-summary-list">
      <li className={styles['checkout-summary-item']}>
        <span>
          Subtotal ({quantidadeItens} {labelItens}):
        </span>
        <span>R$ {subtotal.toFixed(2).replace('.', ',')}</span>
      </li>
      <li className={styles['checkout-summary-item']}>
        <span>Frete:</span>
        <span>R$ {frete.toFixed(2).replace('.', ',')}</span>
      </li>
      {descontoCupons > 0 && (
        <li className={styles['checkout-summary-item-discount']}>
          <span>Cupons Aplicados:</span>
          <span>- R$ {descontoCupons.toFixed(2).replace('.', ',')}</span>
        </li>
      )}
      {valorPagoParcialmente > 0 && (
        <li className={styles['checkout-summary-item-discount']}>
          <span>Coberto (cartões/PIX):</span>
          <span>- R$ {valorPagoParcialmente.toFixed(2).replace('.', ',')}</span>
        </li>
      )}
    </ul>
  );
};
