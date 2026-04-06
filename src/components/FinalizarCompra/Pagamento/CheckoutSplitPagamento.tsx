import { useMemo } from 'react';
import { AlertCircle, Check, Trash2 } from 'lucide-react';
import type { ICheckoutInfo } from '@/interfaces/checkout';
import {
  POLITICA_PARCELAMENTO_CARTAO_PADRAO,
  type ICartaoCreditoInput,
  type ICupomAplicado,
} from '@/interfaces/pagamento';
import type { LinhaPagamentoCheckout } from '@/types/checkout';
import { CartaoCheckoutResumo } from './CartaoCheckoutResumo';
import {
  linhaAbaixoMinimoDivisaoPagamento,
  linhaCheckoutVisualValidada,
  validarValorMinimoPorMeioNaDivisaoPagamento,
} from '@/utils/finalizarCompraLinhasPagamento';
import { opcoesParcelamentoCartaoParaValor } from '@/utils/opcoesParcelamentoCartao';
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

  const cartaoSalvoLabel = (uuid: string) => {
    const c = data.cartoesSalvos.find((x) => x.uuid === uuid);
    return c ? `${c.bandeira} •••• ${c.ultimosDigitosCartao}` : uuid.slice(0, 8);
  };

  const blocoCartaoNovoSemDados = (linhaId: string) => {
    const disponiveis = data.cartoesSalvos.filter((c) => !uuidsCartoesSalvosEmUso.has(c.uuid));
    if (disponiveis.length > 0) {
      return (
        <div className={styles.novoCartaoEscolha}>
          <select
            className={styles.selectCartao}
            value=""
            onChange={(e) => {
              const uuid = e.target.value;
              if (!uuid) return;
              atualizarLinha(linhaId, {
                tipo: 'cartao_salvo',
                cartaoSalvoUuid: uuid,
              });
            }}
            data-cy="checkout-split-pick-saved-on-new-line"
            aria-label="Usar outro cartão cadastrado"
          >
            <option value="">Usar outro cartão cadastrado</option>
            {disponiveis.map((c) => (
              <option key={c.uuid} value={c.uuid}>
                {cartaoSalvoLabel(c.uuid)}
              </option>
            ))}
          </select>
          <button
            type="button"
            className="btn-secondary"
            onClick={() => onAbrirModalCartao(linhaId)}
            data-cy="checkout-split-inform-new-card"
          >
            Informar cartão novo
          </button>
        </div>
      );
    }
    return (
      <button
        type="button"
        className="btn-primary"
        onClick={() => onAbrirModalCartao(linhaId)}
        data-cy="checkout-add-card-button"
      >
        Informar cartão
      </button>
    );
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

        {linhas.map((linha, idx) => {
          const validada = linhaCheckoutVisualValidada(linha, novosCartoesPorLinha);
          const abaixoMin = linhaAbaixoMinimoDivisaoPagamento(linha, linhas, totalAposCupons);
          const linhaClass = validada ? styles.linhaValidada : styles.linhaPendente;

          return (
            <div
              key={linha.id}
              className={`${styles.linha} ${linhaClass}`}
              data-cy={`checkout-split-line-${idx}`}
            >
              <div className={styles.linhaHeader}>
                <span className={styles.tipoLabel}>
                  {linha.tipo === 'pix'
                    ? 'PIX'
                    : linha.tipo === 'cartao_novo'
                      ? 'Novo cartão'
                      : 'Cartão salvo'}
                </span>
                {validada ? (
                  <span className={styles.linhaCheck} aria-hidden>
                    <Check size={18} strokeWidth={2.5} />
                  </span>
                ) : null}
                {linhas.length > 1 ? (
                  <button
                    type="button"
                    className={styles.removerBtn}
                    onClick={() => removerLinha(linha.id)}
                    aria-label="Remover linha"
                    data-cy={`checkout-split-remove-line-${idx}`}
                  >
                    <Trash2 size={16} aria-hidden />
                    Remover
                  </button>
                ) : null}
              </div>

              {linha.tipo === 'cartao_salvo' ? (
                <select
                  className={styles.selectCartao}
                  value={linha.cartaoSalvoUuid ?? ''}
                  onChange={(e) =>
                    atualizarLinha(linha.id, { cartaoSalvoUuid: e.target.value || undefined })
                  }
                  data-cy="checkout-split-line-card-select"
                >
                  <option value="">Selecione o cartão</option>
                  {data.cartoesSalvos.map((c) => (
                    <option key={c.uuid} value={c.uuid}>
                      {cartaoSalvoLabel(c.uuid)}
                    </option>
                  ))}
                </select>
              ) : null}

              {linha.tipo === 'cartao_novo' ? (
                novosCartoesPorLinha[linha.id] ? (
                  <CartaoCheckoutResumo
                    bandeira={novosCartoesPorLinha[linha.id].bandeira}
                    ultimosDigitos={novosCartoesPorLinha[linha.id].numero.replace(/\D/g, '').slice(-4)}
                    nomeTitular={novosCartoesPorLinha[linha.id].nomeTitular}
                    onTrocar={() => onAbrirModalCartao(linha.id)}
                  />
                ) : (
                  blocoCartaoNovoSemDados(linha.id)
                )
              ) : null}

              {linha.tipo === 'pix' ? (
                <p className={styles.pixInfo}>
                  Após finalizar, você verá o QR e o código para pagar; a confirmação é automática
                  quando o webhook de teste for acionado.
                </p>
              ) : null}

              {linha.tipo === 'cartao_salvo' || linha.tipo === 'cartao_novo' ? (
                <div className={styles.valorRow}>
                  <label htmlFor={`parcelas-linha-${linha.id}`}>Parcelas no cartão</label>
                  <select
                    id={`parcelas-linha-${linha.id}`}
                    className={styles.selectCartao}
                    value={linha.parcelasCartao ?? 1}
                    onChange={(e) => {
                      const n = parseInt(e.target.value, 10);
                      atualizarLinha(linha.id, {
                        parcelasCartao: Number.isFinite(n) ? n : 1,
                      });
                    }}
                    data-cy="checkout-split-line-parcelas"
                  >
                    {opcoesParcelamentoCartaoParaValor(
                      Number.isFinite(linha.valor) ? linha.valor : 0,
                      politicaParcelamento,
                    ).map((op) => (
                      <option key={op.quantidadeParcelas} value={op.quantidadeParcelas}>
                        {op.rotuloSelect}
                      </option>
                    ))}
                  </select>
                </div>
              ) : null}

              <div className={styles.valorRow}>
                <label htmlFor={`valor-linha-${linha.id}`}>Valor (R$)</label>
                <div className={styles.valorInputWrap}>
                  <input
                    id={`valor-linha-${linha.id}`}
                    type="number"
                    min={0}
                    step="0.01"
                    className={`${styles.valorInput} ${abaixoMin ? styles.valorInputErro : ''}`}
                    value={Number.isFinite(linha.valor) ? linha.valor : 0}
                    onChange={(e) => {
                      const v = parseFloat(e.target.value.replace(',', '.'));
                      atualizarLinha(linha.id, { valor: Number.isFinite(v) ? v : 0 });
                    }}
                    data-cy="checkout-split-line-value"
                    aria-invalid={abaixoMin}
                  />
                  {abaixoMin ? (
                    <span className={styles.valorErroIcon} title="Mínimo R$ 10,00 nesta linha">
                      <AlertCircle size={18} aria-hidden />
                    </span>
                  ) : null}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
