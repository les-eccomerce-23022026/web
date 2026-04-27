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
import { LinhaPagamentoItem } from './LinhaPagamentoItem';
import styles from './CheckoutSplitPagamento.module.css';

const EPS = 0.02;

function formatBrl(n: number): string {
  return n.toFixed(2).replace('.', ',');
}

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
  const restante = totalAposCupons - somaLinhas;
  const alinhado = Math.abs(restante) < EPS;
  const rn = validarValorMinimoPorMeioNaDivisaoPagamento(linhas, totalAposCupons);

  const pctCoberto = useMemo(() => {
    if (totalAposCupons <= EPS) return 100;
    return Math.min(100, (somaLinhas / totalAposCupons) * 100);
  }, [somaLinhas, totalAposCupons]);

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
    const id = crypto.randomUUID();
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

  const textoRestanteE2e = cuponsAplicados.length > 0
    ? `Total após cupons: R$ ${formatBrl(totalAposCupons)} · Soma das linhas: R$ ${formatBrl(somaLinhas)}${
        alinhado ? ' · OK' : ` · Ajuste de R$ ${formatBrl(Math.abs(restante))}`
      }`
    : `Total: R$ ${formatBrl(totalAposCupons)} · Soma das linhas: R$ ${formatBrl(somaLinhas)}${
        alinhado ? ' · OK' : ` · Ajuste de R$ ${formatBrl(Math.abs(restante))}`
      }`;

  return (
    <div className={styles.wrap} data-cy="checkout-split-payment">
      <div data-cy="checkout-partial-payment">
        <h4 className={styles.sectionTitle}>Pagamento (cartões e PIX)</h4>
        <p className={styles.pixInfo}>
          Divida o total em várias linhas. PIX usa cobrança simulada (QR + copia e cola) e confirmação
          via webhook de teste. Valor mínimo de R$ 10,00 por meio quando houver mais de um meio
          (cupons podem deixar um único saldo menor).
        </p>

        <div className={styles.coverageWrap}>
          <div
            className={`${styles.coverageTrack} ${alinhado ? styles.coverageTrackDone : ''}`}
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(pctCoberto)}
            aria-label={
              alinhado
                ? 'Cobertura do total: completa'
                : `Cobertura do total: ${Math.round(pctCoberto)} por cento`
            }
          >
            <div
              className={`${styles.coverageFill} ${alinhado ? styles.coverageFillDone : ''}`}
              style={{ width: `${pctCoberto}%` }}
            />
          </div>
          <p className={alinhado ? styles.coverageCaptionOk : styles.coverageCaptionWarn}>
            {totalAposCupons <= EPS ? (
              'Tudo pronto!'
            ) : alinhado ? (
              'Tudo pronto!'
            ) : restante > EPS ? (
              <>
                Faltam <strong>R$ {formatBrl(restante)}</strong> para cobrir o total
              </>
            ) : (
              <>
                Soma acima do total em <strong>R$ {formatBrl(Math.abs(restante))}</strong> — ajuste as linhas
              </>
            )}
          </p>
        </div>

        <p
          className={styles.restanteSr}
          data-cy="checkout-split-restante"
          aria-hidden="true"
        >
          {textoRestanteE2e}
        </p>

        {!rn.ok && rn.mensagem ? (
          <p className={styles.restanteAviso} role="alert" data-cy="checkout-split-rn34-error">
            {rn.mensagem}
          </p>
        ) : null}

        <div className={styles.toolbar} data-cy="checkout-split-toolbar">
          <button
            type="button"
            className="btn-secondary"
            onClick={() => adicionarLinha('cartao_salvo')}
            disabled={data.cartoesSalvos.length === 0}
            data-cy="checkout-split-add-saved-card"
          >
            + Cartão salvo
          </button>
          <button
            type="button"
            className="btn-secondary"
            onClick={() => adicionarLinha('cartao_novo')}
            data-cy="checkout-split-add-new-card"
          >
            + Novo cartão
          </button>
          <button
            type="button"
            className="btn-secondary"
            onClick={() => adicionarLinha('pix')}
            data-cy="checkout-split-add-pix"
          >
            + PIX
          </button>
        </div>

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
