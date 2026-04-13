import { useMemo } from 'react';
import type { ICheckoutInfo } from '@/interfaces/checkout';
import { POLITICA_PARCELAMENTO_CARTAO_PADRAO, type ICartaoCreditoInput, type ICupomAplicado } from '@/interfaces/pagamento';
import type { LinhaPagamentoCheckout } from '@/types/checkout';
import { validarValorMinimoPorMeioNaDivisaoPagamento } from '@/utils/finalizarCompraLinhasPagamento';
import { LinhaPagamento } from './LinhaPagamento';
import styles from './CheckoutSplitPagamento.module.css';

const formatBrl = (n: number) => n.toFixed(2).replace('.', ',');

type Props = {
  data: ICheckoutInfo;
  totalAposCupons: number;
  cuponsAplicados: ICupomAplicado[];
  linhas: LinhaPagamentoCheckout[];
  novosCartoesPorLinha: Record<string, ICartaoCreditoInput>;
  onAdicionarMeio: (tipo: LinhaPagamentoCheckout['tipo']) => void;
  onRemoverMeio: (id: string) => void;
  onAtualizarMeio: (id: string, patch: Partial<LinhaPagamentoCheckout>) => void;
  onAbrirModalCartao: (linhaId: string) => void;
};

export const CheckoutSplitPagamento = ({
  data,
  totalAposCupons,
  cuponsAplicados,
  linhas,
  novosCartoesPorLinha,
  onAdicionarMeio,
  onRemoverMeio,
  onAtualizarMeio,
  onAbrirModalCartao,
}: Props) => { // eslint-disable-line complexity
  const somaLinhas = useMemo(() => 
    linhas.reduce((acc, linha) => acc + (Number.isFinite(linha.valor) ? linha.valor : 0), 0)
  , [linhas]);

  const restante = totalAposCupons - somaLinhas;
  const isAlinhado = Math.abs(restante) < 0.02;
  const percentualCoberto = useMemo(() => {
    if (totalAposCupons <= 0.02) return 100;
    return Math.min(100, (somaLinhas / totalAposCupons) * 100);
  }, [somaLinhas, totalAposCupons]);

  const rn = validarValorMinimoPorMeioNaDivisaoPagamento(linhas, totalAposCupons);
  const politicaParcelamento = data.politicaParcelamentoCartao ?? POLITICA_PARCELAMENTO_CARTAO_PADRAO;

  const textoResumoE2E = useMemo(() => {
    const prefixo = cuponsAplicados.length > 0 ? 'Total após cupons' : 'Total';
    const status = isAlinhado ? 'OK' : `Ajuste de R$ ${formatBrl(Math.abs(restante))}`;
    return `${prefixo}: R$ ${formatBrl(totalAposCupons)} · Soma: R$ ${formatBrl(somaLinhas)} · ${status}`;
  }, [cuponsAplicados.length, totalAposCupons, somaLinhas, isAlinhado, restante]);

  return (
    <div className={styles.wrap} data-cy="checkout-split-payment">
      <div data-cy="checkout-partial-payment">
        <h4 className={styles.sectionTitle}>Pagamento (cartões e PIX)</h4>
        <p className={styles.pixInfo}>
          Divida o total em várias linhas. Valor mínimo de R$ 10,00 por meio quando houver mais de um meio.
        </p>

        <div className={styles.coverageWrap}>
          <div className={`${styles.coverageTrack} ${isAlinhado ? styles.coverageTrackDone : ''}`} role="progressbar">
            <div className={`${styles.coverageFill} ${isAlinhado ? styles.coverageFillDone : ''}`} style={{ width: `${percentualCoberto}%` }} />
          </div>
          <p className={isAlinhado ? styles.coverageCaptionOk : styles.coverageCaptionWarn}>
            {isAlinhado ? 'Tudo pronto!' : restante > 0 
              ? <>Faltam <strong>R$ {formatBrl(restante)}</strong></> 
              : <>Soma acima em <strong>R$ {formatBrl(Math.abs(restante))}</strong></>}
          </p>
        </div>

        <p className={styles.restanteSr} data-cy="checkout-split-restante" aria-hidden="true">{textoResumoE2E}</p>

        {!rn.ok && rn.mensagem && <p className={styles.restanteAviso} role="alert">{rn.mensagem}</p>}

        <div className={styles.toolbar} data-cy="checkout-split-toolbar">
          <button type="button" className="btn-secondary" onClick={() => onAdicionarMeio('cartao_salvo')} disabled={data.cartoesSalvos.length === 0} data-cy="checkout-split-add-saved-card">+ Cartão salvo</button>
          <button type="button" className="btn-secondary" onClick={() => onAdicionarMeio('cartao_novo')} data-cy="checkout-split-add-new-card">+ Novo cartão</button>
          <button type="button" className="btn-secondary" onClick={() => onAdicionarMeio('pix')} data-cy="checkout-split-add-pix">+ PIX</button>
        </div>

        {linhas.map((linha, index) => (
          <LinhaPagamento
            key={linha.id}
            index={index}
            linha={linha}
            totalAposCupons={totalAposCupons}
            todasLinhas={linhas}
            novosCartoesPorLinha={novosCartoesPorLinha}
            cartoesSalvos={data.cartoesSalvos}
            politicaParcelamento={politicaParcelamento}
            onAtualizar={onAtualizarMeio}
            onRemover={onRemoverMeio}
            onAbrirModalCartao={onAbrirModalCartao}
          />
        ))}
      </div>
    </div>
  );
};
