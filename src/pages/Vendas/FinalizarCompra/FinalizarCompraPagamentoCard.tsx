import styles from './FinalizarCompra.module.css';
import {
  CartoesSalvosList,
  CheckoutSplitPagamento,
  CupomInput,
} from '@/components/FinalizarCompra/Pagamento';
import type { ICheckoutInfo } from '@/interfaces/checkout';
import type { ICartaoCreditoInput, ICupomAplicado } from '@/interfaces/pagamento';
import type { LinhaPagamentoCheckout } from '@/types/checkout';
import type { ICartaoSalvoPagamento } from '@/interfaces/pagamento';

type Props = {
  data: ICheckoutInfo;
  total: number;
  cuponsAplicados: ICupomAplicado[];
  linhasPagamento: LinhaPagamentoCheckout[];
  novosCartoesPorLinha: Record<string, ICartaoCreditoInput>;
  onLinhasChange: (linhas: LinhaPagamentoCheckout[]) => void;
  onAbrirModalCartao: (linhaId: string) => void;
  onSelecionarCartaoSalvoNaLista: (uuid: string) => void;
  onAplicarCupom: (cupom: ICupomAplicado) => void;
  onRemoverCupom: (uuid: string) => void;
};

const cartoesParaLista = (cartoes: ICheckoutInfo['cartoesSalvos']): ICartaoSalvoPagamento[] =>
  cartoes.map((c) => ({
    uuid: c.uuid,
    ultimosDigitosCartao: c.ultimosDigitosCartao,
    nomeCliente: c.nomeCliente,
    nomeImpresso: c.nomeImpresso,
    bandeira: c.bandeira,
    validade: c.validade,
    principal: c.principal,
  }));

export const FinalizarCompraPagamentoCard = ({
  data,
  total,
  cuponsAplicados,
  linhasPagamento,
  novosCartoesPorLinha,
  onLinhasChange,
  onAbrirModalCartao,
  onSelecionarCartaoSalvoNaLista,
  onAplicarCupom,
  onRemoverCupom,
}: Props) => {
  const temCartoesSalvos = data.cartoesSalvos.length > 0;
  const primeiroSalvo =
    linhasPagamento[0]?.tipo === 'cartao_salvo' ? linhasPagamento[0].cartaoSalvoUuid ?? null : null;

  return (
    <>
      <div className={`card ${styles['checkout-card-spaced']}`}>
        <h3 className={styles['checkout-section-title']} data-cy="checkout-payment-section-title">
          Como você quer pagar?
        </h3>
        <p className={styles['checkout-payment-subtitle']}>
          Cartão de crédito e PIX (simulado). Divida o valor em várias linhas se quiser.
        </p>

        {temCartoesSalvos ? (
          <CartoesSalvosList
            cartoes={cartoesParaLista(data.cartoesSalvos)}
            selecionado={primeiroSalvo}
            onSelect={onSelecionarCartaoSalvoNaLista}
          />
        ) : null}

        <CheckoutSplitPagamento
          data={data}
          totalAposCupons={total}
          cuponsAplicados={cuponsAplicados}
          linhas={linhasPagamento}
          novosCartoesPorLinha={novosCartoesPorLinha}
          onLinhasChange={onLinhasChange}
          onAbrirModalCartao={onAbrirModalCartao}
        />
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
