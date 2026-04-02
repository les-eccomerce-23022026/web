import { useState } from 'react';
import { Package, MapPin } from 'lucide-react';
import type { IFreteCalculoOutput, IFreteOpcao } from '@/interfaces/IEntrega';
import styles from './FreteCalculo.module.css';

/** Estado de cálculo de frete injetado pelo pai (ex.: `useEntrega` em `useCheckout`) — uma única instância por fluxo. */
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
}

export function FreteCalculo({
  entrega,
  onFreteSelecionado,
  freteSelecionado,
  pesoTotal,
  valorTotal,
}: FreteCalculoProps) {
  const [cep, setCep] = useState('');
  const { calcularFrete, freteCalculado, loading, error, formatarCep: formatar, validarCep: validar } = entrega;

  const handleCepChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const valor = e.target.value;
    const cepFormatado = formatar(valor);
    setCep(cepFormatado);
  };

  const handleCalcular = async () => {
    if (!validar(cep)) {
      alert('CEP inválido');
      return;
    }

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

      {/* Input de CEP */}
      <div className={styles['cep-input-wrapper']}>
        <div className={styles['cep-input-group']}>
          <div className={styles['input-com-label']}>
            <label htmlFor="cep-destino">CEP de Destino</label>
            <div className={styles['cep-input-com-icon']}>
              <input
                id="cep-destino"
                type="text"
                value={cep}
                onChange={handleCepChange}
                onKeyPress={handleKeyPress}
                placeholder="00000-000"
                maxLength={9}
                data-cy="checkout-freight-zip-input"
              />
              <MapPin size={18} className={styles['cep-icon']} />
            </div>
          </div>
          <button
            type="button"
            className="btn-secondary"
            onClick={() => void handleCalcular()}
            disabled={loading}
            data-cy="checkout-freight-calculate-button"
          >
            {loading ? 'Calculando...' : 'Calcular'}
          </button>
        </div>

        {error && (
          <p className={styles['erro']} data-cy="checkout-freight-error">
            {error.message}
          </p>
        )}
      </div>

      {/* Opções de Frete */}
      {freteCalculado && (
        <div className={styles['opcoes-frete']} data-cy="checkout-freight-options">
          <p className={styles['opcoes-titulo']}>Opções de frete disponíveis:</p>

          {freteCalculado.opcoes.map((opcao) => (
            <div
              key={opcao.uuid}
              className={`${styles['opcao-frete']} ${freteSelecionado?.uuid === opcao.uuid ? styles['selecionado'] : ''}`}
              onClick={() => handleSelecionar(opcao)}
              data-cy={`checkout-freight-option-${opcao.tipo}`}
            >
              <div className={styles['opcao-conteudo']}>
                <div className={styles['opcao-tipo']}>
                  <span className={styles['tipo-badge']}>{opcao.tipo}</span>
                </div>

                <div className={styles['opcao-info']}>
                  <p className={styles['prazo']}>{opcao.prazo}</p>
                </div>

                <div className={styles['opcao-valor']}>
                  {opcao.valor === 0 ? (
                    <span className={styles['gratis']}>Grátis</span>
                  ) : (
                    <span>R$ {opcao.valor.toFixed(2).replace('.', ',')}</span>
                  )}
                </div>
              </div>

              <div className={styles['opcao-selecao']}>
                <input
                  type="radio"
                  name="frete"
                  checked={freteSelecionado?.uuid === opcao.uuid}
                  onChange={() => handleSelecionar(opcao)}
                  data-cy={`checkout-freight-radio-${opcao.tipo}`}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Informações adicionais */}
      {freteCalculado && (
        <div className={styles['frete-info-adicional']}>
          <p>
            <strong>CEP de Origem:</strong> {freteCalculado.cepOrigem}
          </p>
          {freteCalculado.pesoTotal && (
            <p>
              <strong>Peso Total:</strong> {freteCalculado.pesoTotal} kg
            </p>
          )}
        </div>
      )}
    </div>
  );
}
