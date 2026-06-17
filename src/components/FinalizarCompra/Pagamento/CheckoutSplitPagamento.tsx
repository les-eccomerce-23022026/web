import { useMemo } from 'react';
import type { ICheckoutInfo } from '@/interfaces/checkout';
import {
  POLITICA_PARCELAMENTO_CARTAO_PADRAO,
  type ICartaoCreditoInput,
  type ICupomAplicado,
} from '@/interfaces/pagamento';
import type { LinhaPagamentoCheckout } from '@/types/checkout';
import {
  validarValorMinimoPorMeioNaDivisaoPagamento,
} from '@/utils/finalizarCompraLinhasPagamento';
import { generateSafeId } from '@/utils/generateId';
import { LinhaPagamentoItem } from './LinhaPagamentoItem';
import { CheckoutSplitResumoCobertura } from './CheckoutSplitResumoCobertura';
import { CheckoutSplitToolbar } from './CheckoutSplitToolbar';
import {
  calcularCobrancaLinhas,
  montarTextoRestanteE2e,
} from './checkoutSplitPagamentoUtils';
import styles from './CheckoutSplitPagamento.style.module.css';

const EPS = 0.02;

type Props = {
  data: ICheckoutInfo;
  totalAposCupons: number;
  cuponsAplicados: ICupomAplicado[];
  linhas: LinhaPagamentoCheckout[];
  novosCartoesPorLinha: Record<string, ICartaoCreditoInput>;
  onLinhasChange: (linhas: LinhaPagamentoCheckout[]) => void;
  onAbrirModalCartao: (linhaId: string) => void;
};

export const CheckoutSplitPagamento = ({
  data,
  totalAposCupons,
  cuponsAplicados,
  linhas,
  novosCartoesPorLinha,
  onLinhasChange,
  onAbrirModalCartao,
}: Props) => {
  const somaLinhas = useMemo(
    () => linhas.reduce((s, l) => s + (Number.isFinite(l.valor) ? l.valor : 0), 0),
    [linhas],
  );
  const cobranca = calcularCobrancaLinhas(totalAposCupons, somaLinhas, EPS);
  const rn = validarValorMinimoPorMeioNaDivisaoPagamento(linhas, totalAposCupons);

  const politicaParcelamento = data.politicaParcelamentoCartao ?? POLITICA_PARCELAMENTO_CARTAO_PADRAO;

  const uuidsCartoesSalvosEmUso = useMemo(() => {
    const s = new Set<string>();
    for (const l of linhas) {
      if (l.tipo === 'cartao_salvo' && l.cartaoSalvoUuid) {
        s.add(l.cartaoSalvoUuid);
      }
    }
    return s;
  }, [linhas]);

  const atualizarLinha = (id: string, patch: Partial<LinhaPagamentoCheckout>) => {
    onLinhasChange(linhas.map((l) => (l.id === id ? { ...l, ...patch } : l)));
  };

  const removerLinha = (id: string) => {
    if (linhas.length <= 1) return;
    onLinhasChange(linhas.filter((l) => l.id !== id));
  };

  const adicionarLinha = (tipo: LinhaPagamentoCheckout['tipo']) => {
    const id = generateSafeId();
    const primeiroSalvo = data.cartoesSalvos[0]?.uuid;
    if (tipo === 'cartao_salvo' && !primeiroSalvo) {
      return;
    }
    const base: LinhaPagamentoCheckout =
      tipo === 'pix'
        ? { id, tipo: 'pix', valor: 0 }
        : tipo === 'cartao_novo'
          ? { id, tipo: 'cartao_novo', valor: 0, parcelasCartao: 1 }
          : { id, tipo: 'cartao_salvo', cartaoSalvoUuid: primeiroSalvo!, valor: 0, parcelasCartao: 1 };
    onLinhasChange([...linhas, base]);
  };

  const textoRestanteE2e = montarTextoRestanteE2e({
    cuponsAplicados,
    totalAposCupons,
    somaLinhas,
    alinhado: cobranca.alinhado,
    restante: cobranca.restante,
  });

  return (
    <div className={styles.wrap} data-cy="pagamento-dividido-container">
      <div data-cy="checkout-partial-payment">
        <h4 className={styles.sectionTitle} data-testid="checkout-split-title">Pagamento (cartões e PIX)</h4>
        <p className={styles.pixInfo} data-testid="checkout-split-description">
          Divida o total em várias linhas. PIX usa cobrança simulada (QR + copia e cola) e confirmação
          via webhook de teste. Valor mínimo de R$ 10,00 por meio quando houver mais de um meio
          (cupons podem deixar um único saldo menor).
        </p>

        <CheckoutSplitResumoCobertura
          totalAposCupons={totalAposCupons}
          alinhado={cobranca.alinhado}
          restante={cobranca.restante}
          percentualCoberto={cobranca.percentualCoberto}
        />

        <p
          className={styles.restanteSr}
          data-cy="pagamento-dividido-restante"
          aria-hidden="true"
        >
          {textoRestanteE2e}
        </p>

        {!rn.ok && rn.mensagem ? (
          <p className={styles.restanteAviso} role="alert" data-cy="pagamento-dividido-erro-rn34">
            {rn.mensagem}
          </p>
        ) : null}

        <CheckoutSplitToolbar
          totalCartoesSalvos={data.cartoesSalvos.length}
          onAdicionarLinha={adicionarLinha}
        />

        {linhas.map((linha, idx) => (
          <LinhaPagamentoItem
            key={linha.id}
            linha={linha}
            idx={idx}
            data={data}
            linhas={linhas}
            totalAposCupons={totalAposCupons}
            novosCartoesPorLinha={novosCartoesPorLinha}
            politicaParcelamento={politicaParcelamento}
            uuidsCartoesSalvosEmUso={uuidsCartoesSalvosEmUso}
            onAtualizarLinha={atualizarLinha}
            onRemoverLinha={removerLinha}
            onAbrirModalCartao={onAbrirModalCartao}
          />
        ))}
      </div>
    </div>
  );
};
