import { useState } from 'react';
import { Package } from 'lucide-react';
import type { IFreteCalculoOutput, IFreteOpcao } from '@/interfaces/entrega';
import { FreteCepInput } from './FreteCepInput';
import { FreteOpcoesLista } from './FreteOpcoesLista';
import { FreteInfoAdicional } from './FreteInfoAdicional';
import styles from './FreteCalculo.style.module.css';

/** Estado de cálculo de frete injetado pelo pai (ex.: `useEntrega` em `useFinalizarCompra`) — uma única instância por fluxo. */
export interface FreteCalculoEntregaApi {
  calcularFrete: (cep: string, peso?: number, valorTotal?: number) => Promise<IFreteCalculoOutput | null>;
  freteCalculado: IFreteCalculoOutput | null;
  loading: boolean;
  error: Error | null;
  formatarCep: (cep: string) => string;
  validarCep: (cep: string) => boolean;
}

interface FreteCalculoProps {
  entrega: FreteCalculoEntregaApi;
  onFreteSelecionado: (frete: IFreteOpcao) => void;
  freteSelecionado?: IFreteOpcao | null;
  pesoTotal?: number;
  valorTotal?: number;
  /** CEP já usado na cotação (ex.: vindo do carrinho) — apenas dígitos ou formatado */
  initialCep?: string;
}

export const FreteCalculo = ({
  entrega,
  onFreteSelecionado,
  freteSelecionado,
  pesoTotal,
  valorTotal,
  initialCep,
}: FreteCalculoProps) => {
  const { calcularFrete, freteCalculado, loading, error, formatarCep: formatar } = entrega;
  const [cep, setCep] = useState(() => (initialCep ? formatar(initialCep) : ''));

  const handleCepChange = (valor: string) => {
    const cepFormatado = formatar(valor);
    setCep(cepFormatado);
  };

  const handleCalcular = async () => {
    await calcularFrete(cep, pesoTotal, valorTotal);
  };

  const handleSelecionar = (frete: IFreteOpcao) => {
    onFreteSelecionado(frete);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      void handleCalcular();
    }
  };

  return (
    <div className={styles['frete-calculo-container']} data-cy="checkout-freight-calculation">
      <div className={styles['frete-calculo-header']}>
        <Package size={20} />
        <h4>Cálculo de Frete</h4>
      </div>

      <FreteCepInput
        cep={cep}
        loading={loading}
        onCepChange={handleCepChange}
        onCalcular={handleCalcular}
        onKeyPress={handleKeyPress}
        error={error}
      />

      {freteCalculado && (
        <FreteOpcoesLista
          freteCalculado={freteCalculado}
          freteSelecionado={freteSelecionado}
          onSelecionar={handleSelecionar}
        />
      )}

      {freteCalculado && <FreteInfoAdicional freteCalculado={freteCalculado} />}
    </div>
  );
}
