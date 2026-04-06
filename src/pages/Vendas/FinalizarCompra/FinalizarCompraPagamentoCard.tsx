import styles from './FinalizarCompra.module.css';
import {
  CartaoCheckoutResumo,
  CartoesSalvosList,
  CupomInput,
  PagamentoParcialInput,
} from '@/components/FinalizarCompra/Pagamento';
import type { ICheckoutInfo } from '@/interfaces/checkout';
import type { ICartaoCreditoInput, ICupomAplicado } from '@/interfaces/pagamento';

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

export const FinalizarCompraPagamentoCard = ({
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
  const temCartoesSalvos = data.cartoesSalvos.length > 0;

  const handleTrocarNovoCartao = () => {
    onNovoCartaoLimpar();
    onAbrirNovoCartao();
  };

  return (
    <>
      <div className={`card ${styles['checkout-card-spaced']}`}>
        <h3 className={styles['checkout-section-title']} data-cy="checkout-payment-section-title">
          Como você prefere pagar?
        </h3>
        <p className={styles['checkout-payment-subtitle']}>Use seu cartão de crédito nesta etapa.</p>

        {temCartoesSalvos ? (
          <CartoesSalvosList
            cartoes={data.cartoesSalvos}
            selecionado={cartaoSelecionado}
            onSelect={onCartaoSelecionado}
          />
        ) : null}

        {!temCartoesSalvos && !novoCartao ? (
          <div className={styles['checkout-empty-pagamento']}>
            <p className={styles['checkout-empty-pagamento-text']}>
              Você ainda não tem cartões salvos. Adicione um cartão para continuar.
            </p>
            <button
              type="button"
              className={`btn-primary ${styles['checkout-btn-add-card-full']}`}
              onClick={onAbrirNovoCartao}
              data-cy="checkout-add-card-button"
            >
              + Adicionar cartão
            </button>
          </div>
        ) : null}

        {temCartoesSalvos ? (
          <div className={styles['checkout-ou-novo']}>
            <span className={styles['checkout-ou-text']}>ou</span>
            <button
              type="button"
              className={`btn-secondary ${styles['checkout-btn-novo-cartao']}`}
              onClick={onAbrirNovoCartao}
              data-cy="checkout-add-card-button"
            >
              + Novo cartão
            </button>
          </div>
        ) : null}

        {novoCartao ? (
          <CartaoCheckoutResumo
            bandeira={novoCartao.bandeira}
            ultimosDigitos={novoCartao.numero.replace(/\D/g, '').slice(-4)}
            nomeTitular={novoCartao.nomeTitular}
            onTrocar={handleTrocarNovoCartao}
          />
        ) : null}

        {temCartoesSalvos ? (
          <PagamentoParcialInput
            cartoesSalvos={data.cartoesSalvos}
            valorTotal={total}
            valorJaPago={valorPagoParcialmente}
            onAdicionar={onAdicionarPagamentoParcial}
            onRemover={onRemoverPagamentoParcial}
            pagamentosParciais={pagamentosParciais}
          />
        ) : null}
      </div>

      <div className={`card ${styles['checkout-cupom-card']}`}>
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
