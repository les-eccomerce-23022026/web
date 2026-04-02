import styles from './Checkout.module.css';
import {
  CartoesSalvosList,
  CupomInput,
  PagamentoParcialInput,
} from '@/components/checkout/pagamento';
import type { ICheckoutInfo } from '@/interfaces/ICheckout';
import type { ICartaoCreditoInput, ICupomAplicado } from '@/interfaces/IPagamento';

type Props = {
  data: ICheckoutInfo;
  cartaoSelecionado: string | null;
  novoCartao: ICartaoCreditoInput | null;
  total: number;
  valorPagoParcialmente: number;
  pagamentosParciais: { cartaoUuid: string; valor: number }[];
  cuponsAplicados: ICupomAplicado[];
  onCartaoSelecionado: (uuid: string) => void;
  onNovoCartaoLimpar: () => void;
  onAbrirNovoCartao: () => void;
  onAdicionarPagamentoParcial: (cartaoUuid: string, valor: number) => boolean;
  onRemoverPagamentoParcial: (index: number) => void;
  onAplicarCupom: (cupom: ICupomAplicado) => void;
  onRemoverCupom: (uuid: string) => void;
};

export const CheckoutPagamentoCard = ({
  data,
  cartaoSelecionado,
  novoCartao,
  total,
  valorPagoParcialmente,
  pagamentosParciais,
  cuponsAplicados,
  onCartaoSelecionado,
  onNovoCartaoLimpar,
  onAbrirNovoCartao,
  onAdicionarPagamentoParcial,
  onRemoverPagamentoParcial,
  onAplicarCupom,
  onRemoverCupom,
}: Props) => {
  const cartaoInfo = cartaoSelecionado
    ? data.cartoesSalvos.find((c) => c.uuid === cartaoSelecionado)
    : undefined;

  return (
    <>
      <div className={`card ${styles['checkout-card-spaced']}`}>
        <h3 className={styles['checkout-section-title']}>Forma de Pagamento</h3>
        <CartoesSalvosList
          cartoes={data.cartoesSalvos}
          selecionado={cartaoSelecionado}
          onSelect={onCartaoSelecionado}
        />
        <div className={styles['checkout-form-row']}>
          <span className={styles['checkout-text-nowrap']}>ou</span>
          <button
            className={`btn-secondary ${styles['checkout-text-nowrap']}`}
            onClick={onAbrirNovoCartao}
            data-cy="checkout-add-card-button"
          >
            + Novo Cartão
          </button>
        </div>
        {cartaoSelecionado && cartaoInfo && (
          <div className={styles['cartao-selecionado-info']}>
            <p>
              ✓ Cartão selecionado: {cartaoInfo.bandeira} · últimos dígitos{' '}
              {cartaoInfo.ultimosDigitosCartao}
            </p>
          </div>
        )}
        {novoCartao && (
          <div className={styles['novo-cartao-info']}>
            <p>
              ✓ Novo cartão: {novoCartao.bandeira} final {novoCartao.numero.slice(-4)}
            </p>
            <button className={styles['btn-alterar']} onClick={onNovoCartaoLimpar}>
              Alterar
            </button>
          </div>
        )}
        {data.cartoesSalvos.length > 0 && (
          <PagamentoParcialInput
            cartoesSalvos={data.cartoesSalvos}
            valorTotal={total}
            valorJaPago={valorPagoParcialmente}
            onAdicionar={onAdicionarPagamentoParcial}
            onRemover={onRemoverPagamentoParcial}
            pagamentosParciais={pagamentosParciais}
          />
        )}
      </div>

      <div className="card">
        <CupomInput
          cuponsDisponiveis={data.cuponsDisponiveis}
          cuponsAplicados={cuponsAplicados}
          onAplicar={onAplicarCupom}
          onRemover={onRemoverCupom}
        />
      </div>
    </>
  );
};
