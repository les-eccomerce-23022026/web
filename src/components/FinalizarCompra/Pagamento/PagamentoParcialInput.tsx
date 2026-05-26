import { useState } from 'react';
import type { ICartaoSalvoPagamento, IPagamentoParcial } from '@/interfaces/pagamento';
import { calcularValorRestante, validarValorPagamentoParcial } from './pagamentoParcialInputUtils';
import { PagamentoParcialHeader } from './PagamentoParcialHeader';
import { PagamentosAdicionadosLista } from './PagamentosAdicionadosLista';
import { AdicionarPagamentoForm } from './AdicionarPagamentoForm';
import { PagamentoCompleto } from './PagamentoCompleto';
import styles from './PagamentoParcialInput.style.module.css';

type ParcelaComNome = IPagamentoParcial & { nomeCartao?: string };

interface PagamentoParcialInputProps {
  cartoesSalvos: ICartaoSalvoPagamento[];
  valorTotal: number;
  valorJaPago: number;
  onAdicionar: (referenciaMeioPagamento: string, valor: number) => boolean;
  onRemover: (index: number) => void;
  parcelasLiquidacao: ParcelaComNome[];
}

export const PagamentoParcialInput = ({
  cartoesSalvos,
  valorTotal,
  valorJaPago,
  onAdicionar,
  onRemover,
  parcelasLiquidacao
}: PagamentoParcialInputProps) => {
  const [cartaoSelecionado, setCartaoSelecionado] = useState('');
  const [valorParcial, setValorParcial] = useState('');
  const [erro, setErro] = useState<string | null>(null);

  const valorRestante = calcularValorRestante(valorTotal, valorJaPago);
  const valorMinimo = 10;

  const handleAdicionar = () => {
    setErro(null);

    if (!cartaoSelecionado) {
      setErro('Selecione um cartão');
      return;
    }

    const resultadoValidacao = validarValorPagamentoParcial(valorParcial, valorMinimo, valorRestante);

    if (!resultadoValidacao.valido) {
      setErro(resultadoValidacao.erro);
      return;
    }

    const valorNumerico = parseFloat(valorParcial.replace(',', '.'));
    const sucesso = onAdicionar(cartaoSelecionado, valorNumerico);
    
    if (sucesso) {
      setCartaoSelecionado('');
      setValorParcial('');
    }
  };

  return (
    <div className={styles['pagamento-parcial-container']} data-cy="checkout-partial-payment">
      <PagamentoParcialHeader
        valorTotal={valorTotal}
        valorJaPago={valorJaPago}
        valorRestante={valorRestante}
      />

      <PagamentosAdicionadosLista
        parcelasLiquidacao={parcelasLiquidacao}
        onRemover={onRemover}
      />

      {valorRestante > 0 && (
        <AdicionarPagamentoForm
          cartoesSalvos={cartoesSalvos}
          cartaoSelecionado={cartaoSelecionado}
          valorParcial={valorParcial}
          valorRestante={valorRestante}
          valorMinimo={valorMinimo}
          erro={erro}
          onCartaoChange={setCartaoSelecionado}
          onValorChange={setValorParcial}
          onAdicionar={handleAdicionar}
        />
      )}

      {valorRestante <= 0 && (
        <PagamentoCompleto valorTotal={valorTotal} />
      )}
    </div>
  );
}
