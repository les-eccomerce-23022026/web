import { useState } from 'react';
import { Tag, X } from 'lucide-react';
import type { ICupomDisponivel, ICupomAplicado } from '@/interfaces/pagamento';
import styles from './CupomInput.module.css';

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

  // Filtrar cupons já aplicados
  const cuponsNaoAplicados = cuponsDisponiveis.filter(
    c => !cuponsAplicados.some(aplicado => aplicado.uuid === c.uuid)
  );

  // Filtrar por tipo
  const cupomPromocionalAplicado = cuponsAplicados.find(c => c.tipo === 'promocional');

  const handleAplicar = () => {
    setErro(null);
    
    if (!codigo.trim()) {
      setErro('Digite o código do cupom');
      return;
    }

    // Buscar cupom nas sugestões
    const cupomEncontrado = cuponsDisponiveis.find(
      c => c.codigo.toLowerCase() === codigo.trim().toLowerCase()
    );

    if (!cupomEncontrado) {
      setErro('Cupom inválido ou expirado');
      return;
    }

    // Validar cupom promocional único
    if (cupomEncontrado.tipo === 'promocional' && cupomPromocionalAplicado) {
      setErro('Apenas um cupom promocional é permitido por compra');
      return;
    }

    onAplicar(cupomEncontrado);
    setCodigo('');
    setMostrarSugestoes(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAplicar();
    }
  };

  return (
    <div className={styles['cupom-container']} data-cy="checkout-coupon-section">
      <div className={styles['cupom-header']}>
        <Tag size={20} />
        <h4>Cupons de Desconto</h4>
      </div>

      {/* Cupons aplicados */}
      {cuponsAplicados.length > 0 && (
        <div className={styles['cupons-aplicados']} data-cy="checkout-applied-coupons">
          {cuponsAplicados.map((cupom) => (
            <div
              key={cupom.uuid}
              className={styles['cupom-aplicado']}
              data-cy={`checkout-coupon-${cupom.codigo}`}
            >
              <div className={styles['cupom-info']}>
                <span className={styles['cupom-codigo']}>{cupom.codigo}</span>
                <span className={styles['cupom-tipo']}>
                  {cupom.tipo === 'promocional' ? 'Promocional' : 'Troca'}
                </span>
                <span className={styles['cupom-valor']}>
                  {cupom.tipo === 'promocional'
                    ? `- ${cupom.valor}%`
                    : `- R$ ${cupom.valor.toFixed(2).replace('.', ',')}`}
                </span>
              </div>
              <button
                className={styles['remover-cupom']}
                onClick={() => onRemover(cupom.uuid)}
                data-cy={`checkout-coupon-remove-${cupom.codigo}`}
              >
                <X size={16} />
              </button>
            </div>
          ))}
        </div>
      )}

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

        {/* Sugestões de cupons */}
        {mostrarSugestoes && cuponsNaoAplicados.length > 0 && (
          <div className={styles['cupom-sugestoes']} data-cy="checkout-coupon-suggestions">
            <p className={styles['sugestoes-titulo']}>Cupons disponíveis:</p>
            {cuponsNaoAplicados.map((cupom) => (
              <button
                key={cupom.uuid}
                type="button"
                className={styles['sugestao-item']}
                onClick={() => {
                  setCodigo(cupom.codigo);
                  handleAplicar();
                }}
                data-cy={`checkout-coupon-suggestion-${cupom.codigo}`}
              >
                <span className={styles['sugestao-codigo']}>{cupom.codigo}</span>
                <span className={styles['sugestao-valor']}>
                  {cupom.tipo === 'promocional' 
                    ? `${cupom.valor}% de desconto` 
                    : `R$ ${cupom.valor.toFixed(2).replace('.', ',')} de troca`}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
