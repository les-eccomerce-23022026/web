import React from 'react';
import { AlertCircle, Check, Trash2 } from 'lucide-react';
import type { LinhaPagamentoCheckout } from '@/types/checkout';
import type { ICartaoCreditoInput, ICartaoCreditoSalvo, IPoliticaParcelamento } from '@/interfaces/pagamento';
import { CartaoCheckoutResumo } from './CartaoCheckoutResumo';
import { 
  linhaCheckoutVisualValidada, 
  linhaAbaixoMinimoDivisaoPagamento 
} from '@/utils/finalizarCompraLinhasPagamento';
import { opcoesParcelamentoCartaoParaValor } from '@/utils/opcoesParcelamentoCartao';
import styles from './CheckoutSplitPagamento.module.css';

interface LinhaPagamentoProps {
  linha: LinhaPagamentoCheckout;
  totalAposCupons: number;
  todasLinhas: LinhaPagamentoCheckout[];
  novosCartoesPorLinha: Record<string, ICartaoCreditoInput>;
  cartoesSalvos: ICartaoCreditoSalvo[];
  politicaParcelamento?: IPoliticaParcelamento;
  onAtualizar: (id: string, patch: Partial<LinhaPagamentoCheckout>) => void;
  onRemover: (id: string) => void;
  onAbrirModalCartao?: (id: string) => void;
}

export const LinhaPagamento: React.FC<LinhaPagamentoProps> = ({
  linha,
  totalAposCupons,
  todasLinhas,
  novosCartoesPorLinha,
  cartoesSalvos,
  politicaParcelamento,
  onAtualizar,
  onRemover,
  onAbrirModalCartao,
}) => {
  const isValidada = linhaCheckoutVisualValidada(linha, novosCartoesPorLinha);
  const isAbaixoMinimo = linhaAbaixoMinimoDivisaoPagamento(linha, todasLinhas, totalAposCupons);
  const classeLinha = isValidada ? styles.linhaValidada : styles.linhaPendente;

  const obterLabelTipo = (tipo: string) => {
    if (tipo === 'pix') return 'PIX';
    if (tipo === 'cartao_novo') return 'Novo cartão';
    return 'Cartão salvo';
  };

  const obterLabelCartaoSalvo = (uuid: string) => {
    const c = cartoesSalvos.find((x) => x.uuid === uuid);
    return c ? `${c.bandeira} •••• ${c.ultimosDigitosCartao}` : uuid.slice(0, 8);
  };

  return (
    <div className={`${styles.linha} ${classeLinha}`} data-cy={`checkout-split-line`}>
      <div className={styles.linhaHeader}>
        <span className={styles.tipoLabel}>{obterLabelTipo(linha.tipo)}</span>
        {isValidada && <Check size={18} strokeWidth={2.5} className={styles.linhaCheck} />}
        {todasLinhas.length > 1 && (
          <button type="button" className={styles.removerBtn} onClick={() => onRemover(linha.id)}>
            <Trash2 size={16} /> Remover
          </button>
        )}
      </div>

      {linha.tipo === 'cartao_salvo' && (
        <select
          className={styles.selectCartao}
          value={linha.cartaoSalvoUuid ?? ''}
          onChange={(e) => onAtualizar(linha.id, { cartaoSalvoUuid: e.target.value })}
        >
          <option value="">Selecione o cartão</option>
          {cartoesSalvos.map((c) => (
            <option key={c.uuid} value={c.uuid}>{obterLabelCartaoSalvo(c.uuid)}</option>
          ))}
        </select>
      )}

      {linha.tipo === 'cartao_novo' && (
        novosCartoesPorLinha[linha.id] ? (
          <CartaoCheckoutResumo
            bandeira={novosCartoesPorLinha[linha.id].bandeira}
            ultimosDigitos={novosCartoesPorLinha[linha.id].numero.slice(-4)}
            nomeTitular={novosCartoesPorLinha[linha.id].nomeTitular}
            onTrocar={() => onAbrirModalCartao?.(linha.id)}
          />
        ) : (
          <button type="button" className="btn-primary" onClick={() => onAbrirModalCartao?.(linha.id)}>Informar cartão</button>
        )
      )}

      {(linha.tipo === 'cartao_novo' || linha.tipo === 'cartao_salvo') && (
        <div className={styles.valorRow}>
          <label htmlFor={`parcelas-${linha.id}`}>Parcelas</label>
          <select
            id={`parcelas-${linha.id}`}
            className={styles.selectCartao}
            value={linha.parcelasCartao ?? 1}
            onChange={(e) => onAtualizar(linha.id, { parcelasCartao: parseInt(e.target.value, 10) })}
          >
            {opcoesParcelamentoCartaoParaValor(linha.valor, politicaParcelamento).map((op) => (
              <option key={op.quantidadeParcelas} value={op.quantidadeParcelas}>{op.rotuloSelect}</option>
            ))}
          </select>
        </div>
      )}

      <div className={styles.valorRow}>
        <label htmlFor={`valor-${linha.id}`}>Valor (R$)</label>
        <div className={styles.valorInputWrap}>
          <input
            id={`valor-${linha.id}`}
            type="number"
            min={0}
            step="0.01"
            className={`${styles.valorInput} ${isAbaixoMinimo ? styles.valorInputErro : ''}`}
            value={linha.valor}
            onChange={(e) => onAtualizar(linha.id, { valor: parseFloat(e.target.value) || 0 })}
          />
          {isAbaixoMinimo && <AlertCircle size={18} className={styles.valorErroIcon} />}
        </div>
      </div>
    </div>
  );
};
