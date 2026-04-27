import type { ICheckoutInfo } from '@/interfaces/checkout';
import type { ICartaoCreditoInput, IPoliticaParcelamentoCartao } from '@/interfaces/pagamento';
import type { LinhaPagamentoCheckout } from '@/types/checkout';
import { CartaoCheckoutResumo } from './CartaoCheckoutResumo';
import {
  linhaAbaixoMinimoDivisaoPagamento,
  linhaCheckoutVisualValidada,
} from '@/utils/finalizarCompraLinhasPagamento';
import styles from './CheckoutSplitPagamento.module.css';
import { BlocoNovoCartaoCheckout } from './BlocoNovoCartaoCheckout';
import { LinhaPagamentoHeader } from './LinhaPagamentoHeader';
import { LinhaPagamentoConfiguracao } from './LinhaPagamentoConfiguracao';

type Props = {
  linha: LinhaPagamentoCheckout;
  idx: number;
  data: ICheckoutInfo;
  linhas: LinhaPagamentoCheckout[];
  totalAposCupons: number;
  novosCartoesPorLinha: Record<string, ICartaoCreditoInput>;
  politicaParcelamento: IPoliticaParcelamentoCartao;
  uuidsCartoesSalvosEmUso: Set<string>;
  onAtualizarLinha: (id: string, patch: Partial<LinhaPagamentoCheckout>) => void;
  onRemoverLinha: (id: string) => void;
  onAbrirModalCartao: (id: string) => void;
};

export const LinhaPagamentoItem = ({
  linha,
  idx,
  data,
  linhas,
  totalAposCupons,
  novosCartoesPorLinha,
  politicaParcelamento,
  uuidsCartoesSalvosEmUso,
  onAtualizarLinha,
  onRemoverLinha,
  onAbrirModalCartao,
}: Props) => {
  const validada = linhaCheckoutVisualValidada(linha, novosCartoesPorLinha);
  const abaixoMin = linhaAbaixoMinimoDivisaoPagamento(linha, linhas, totalAposCupons);
  const linhaClass = validada ? styles.linhaValidada : styles.linhaPendente;

  const cartaoSalvoLabel = (uuid: string) => {
    const c = data.cartoesSalvos.find((x) => x.uuid === uuid);
    return c ? `${c.bandeira} •••• ${c.ultimosDigitosCartao}` : uuid.slice(0, 8);
  };

  return (
    <div
      className={`${styles.linha} ${linhaClass}`}
      data-cy={`checkout-split-line-${idx}`}
    >
      <LinhaPagamentoHeader
        linha={linha}
        idx={idx}
        validada={validada}
        linhasCount={linhas.length}
        onRemoverLinha={onRemoverLinha}
      />

      {linha.tipo === 'cartao_salvo' && (
        <select
          className={styles.selectCartao}
          value={linha.cartaoSalvoUuid ?? ''}
          onChange={(e) =>
            onAtualizarLinha(linha.id, { cartaoSalvoUuid: e.target.value || undefined })
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
      )}

      {linha.tipo === 'cartao_novo' && (
        novosCartoesPorLinha[linha.id] ? (
          <CartaoCheckoutResumo
            bandeira={novosCartoesPorLinha[linha.id].bandeira}
            ultimosDigitos={novosCartoesPorLinha[linha.id].numero.replace(/\D/g, '').slice(-4)}
            nomeTitular={novosCartoesPorLinha[linha.id].nomeTitular}
            onTrocar={() => onAbrirModalCartao(linha.id)}
          />
        ) : (
          <BlocoNovoCartaoCheckout
            linhaId={linha.id}
            data={data}
            uuidsCartoesSalvosEmUso={uuidsCartoesSalvosEmUso}
            cartaoSalvoLabel={cartaoSalvoLabel}
            onAtualizarLinha={onAtualizarLinha}
            onAbrirModalCartao={onAbrirModalCartao}
          />
        )
      )}

      {linha.tipo === 'pix' && (
        <p className={styles.pixInfo}>
          Após finalizar, você verá o QR e o código para pagar; a confirmação é automática
          quando o webhook de teste for acionado.
        </p>
      )}

      <LinhaPagamentoConfiguracao
        linha={linha}
        politicaParcelamento={politicaParcelamento}
        abaixoMin={abaixoMin}
        onAtualizarLinha={onAtualizarLinha}
      />
    </div>
  );
};
