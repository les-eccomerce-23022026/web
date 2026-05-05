import { useState } from 'react';
import { Tag } from 'lucide-react';
import type { ICupomDisponivel, ICupomAplicado } from '@/interfaces/pagamento';
import styles from './CupomInput.style.module.css';
import { CupomAplicadosLista } from './CupomAplicadosLista';
import { CupomSugestoesLista } from './CupomSugestoesLista';
import {
  filtrarCuponsNaoAplicados,
  validarCodigoCupom,
} from './cupomInputUtils';

interface CupomInputProps {
  cuponsDisponiveis?: ICupomDisponivel[];
  cuponsAplicados: ICupomAplicado[];
  onAplicar: (cupom: ICupomDisponivel) => void;
  onRemover: (cupomUuid: string) => void;
}

export const CupomInput = ({
  cuponsDisponiveis = [],
  cuponsAplicados,
  onAplicar,
  onRemover
}: CupomInputProps) => {
  const [codigo, setCodigo] = useState('');
  const [erro, setErro] = useState<string | null>(null);
  const [mostrarSugestoes, setMostrarSugestoes] = useState(false);

  const cuponsNaoAplicados = filtrarCuponsNaoAplicados(cuponsDisponiveis, cuponsAplicados);
  const cupomPromocionalAplicado = cuponsAplicados.find((cupom) => cupom.tipo === 'promocional');

  const handleAplicar = () => {
    const resultadoValidacao = validarCodigoCupom({
      codigoDigitado: codigo,
      cuponsDisponiveis,
      cupomPromocionalAplicado,
    });

    if (resultadoValidacao.erro) {
      setErro(resultadoValidacao.erro);
      return;
    }

    if (!resultadoValidacao.cupom) {
      return;
    }

    setErro(null);
    onAplicar(resultadoValidacao.cupom);
    setCodigo('');
    setMostrarSugestoes(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleAplicar();
    }
  };

  const handleSelecionarSugestao = (cupom: ICupomDisponivel) => {
    setCodigo(cupom.codigo);
    setErro(null);
    onAplicar(cupom);
    setCodigo('');
    setMostrarSugestoes(false);
  };

  return (
    <div className={styles['cupom-container']} data-cy="checkout-coupon-section">
      <div className={styles['cupom-header']}>
        <Tag size={20} />
        <h4>Cupons de Desconto</h4>
      </div>

      <CupomAplicadosLista cuponsAplicados={cuponsAplicados} onRemover={onRemover} />

      {/* Input de cupom */}
      <div className={styles['cupom-input-wrapper']}>
        <div className={styles['cupom-input-group']}>
          <input
            type="text"
            value={codigo}
            onChange={(e) => {
              setCodigo(e.target.value.toUpperCase());
              setErro(null);
            }}
            onKeyPress={handleKeyPress}
            onFocus={() => setMostrarSugestoes(true)}
            onBlur={() => setTimeout(() => setMostrarSugestoes(false), 200)}
            placeholder="CÓDIGO DO CUPOM"
            data-cy="checkout-coupon-input"
          />
          <button
            type="button"
            className="btn-secondary"
            onClick={handleAplicar}
            data-cy="checkout-apply-coupon-button"
          >
            Aplicar
          </button>
        </div>

        {cupomPromocionalAplicado && (
          <p className={styles['cupom-limite']}>
            Cupom promocional já aplicado. Você ainda pode adicionar cupons de troca acima.
          </p>
        )}

        {erro && (
          <p className={styles['cupom-erro']} data-cy="checkout-coupon-error">
            {erro}
          </p>
        )}

        <CupomSugestoesLista
          mostrarSugestoes={mostrarSugestoes}
          cuponsNaoAplicados={cuponsNaoAplicados}
          onSelecionarSugestao={handleSelecionarSugestao}
        />
      </div>
    </div>
  );
}
