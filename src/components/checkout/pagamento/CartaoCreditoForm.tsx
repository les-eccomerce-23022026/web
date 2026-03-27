import { useState, useMemo, type ChangeEvent } from 'react';
import { Eye, EyeOff, CreditCard } from 'lucide-react';
import { detectarBandeira, validarLuhn } from '@/hooks/usePagamento';
import type { ICartaoCreditoInput } from '@/interfaces/IPagamento';
import styles from './CartaoCreditoForm.module.css';

interface CartaoCreditoFormProps {
  bandeirasPermitidas?: string[];
  onSubmit: (dados: ICartaoCreditoInput) => void;
  onCancel?: () => void;
  salvarCartao?: boolean;
}

export function CartaoCreditoForm({ 
  bandeirasPermitidas = [], 
  onSubmit,
  onCancel,
  salvarCartao = false
}: CartaoCreditoFormProps) {
  const [numero, setNumero] = useState('');
  const [nomeTitular, setNomeTitular] = useState('');
  const [validade, setValidade] = useState('');
  const [cvv, setCvv] = useState('');
  const [salvar, setSalvar] = useState(salvarCartao);
  const [mostrarCvv, setMostrarCvv] = useState(false);
  const [erros, setErros] = useState<string[]>([]);

  // Detectar bandeira ao digitar número usando useMemo
  const bandeiraDetectada = useMemo(() => detectarBandeira(numero), [numero]);

  // Máscara de número de cartão
  const handleNumeroChange = (e: ChangeEvent<HTMLInputElement>) => {
    let valor = e.target.value.replace(/\D/g, '');
    
    // Limitar a 19 dígitos
    if (valor.length > 19) {
      valor = valor.slice(0, 19);
    }
    
    // Adicionar espaço a cada 4 dígitos
    valor = valor.replace(/(\d{4})(?=\d)/g, '$1 ');
    
    setNumero(valor);
    setErros([]);
  };

  // Máscara de validade (MM/AA)
  const handleValidadeChange = (e: ChangeEvent<HTMLInputElement>) => {
    let valor = e.target.value.replace(/\D/g, '');
    
    if (valor.length > 4) {
      valor = valor.slice(0, 4);
    }
    
    if (valor.length >= 2) {
      valor = valor.slice(0, 2) + '/' + valor.slice(2);
    }
    
    setValidade(valor);
    setErros([]);
  };

  // Máscara de CVV
  const handleCvvChange = (e: ChangeEvent<HTMLInputElement>) => {
    let valor = e.target.value.replace(/\D/g, '');
    
    // American Express usa 4 dígitos
    const maxDigitos = bandeiraDetectada === 'American Express' ? 4 : 3;
    
    if (valor.length > maxDigitos) {
      valor = valor.slice(0, maxDigitos);
    }
    
    setCvv(valor);
    setErros([]);
  };

  // Validar formulário
  const validarFormulario = (): boolean => {
    const novosErros: string[] = [];
    
    // Validar número
    const numeroLimpo = numero.replace(/\D/g, '');
    if (numeroLimpo.length < 13 || numeroLimpo.length > 19) {
      novosErros.push('Número do cartão inválido');
    } else if (!validarLuhn(numeroLimpo)) {
      novosErros.push('Número do cartão inválido (validação falhou)');
    }
    
    // Validar bandeira
    if (bandeiraDetectada && bandeirasPermitidas.length > 0 && !bandeirasPermitidas.includes(bandeiraDetectada)) {
      novosErros.push(`Bandeira ${bandeiraDetectada} não é aceita`);
    }
    
    // Validar nome
    if (nomeTitular.trim().length < 2) {
      novosErros.push('Nome do titular inválido');
    }
    
    // Validar validade
    const validadeRegex = /^(0[1-9]|1[0-2])\/\d{2}$/;
    if (!validadeRegex.test(validade)) {
      novosErros.push('Validade deve estar no formato MM/AA');
    } else {
      const [mes, ano] = validade.split('/').map(Number);
      const dataAtual = new Date();
      const anoAtual = dataAtual.getFullYear() % 100;
      const mesAtual = dataAtual.getMonth() + 1;
      
      if (ano < anoAtual || (ano === anoAtual && mes < mesAtual)) {
        novosErros.push('Cartão expirado');
      }
    }
    
    // Validar CVV
    const cvvMax = bandeiraDetectada === 'American Express' ? 4 : 3;
    if (cvv.length !== cvvMax) {
      novosErros.push(`CVV deve ter ${cvvMax} dígitos`);
    }
    
    setErros(novosErros);
    return novosErros.length === 0;
  };

  // Submeter formulário
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validarFormulario()) {
      return;
    }
    
    onSubmit({
      numero: numero.replace(/\D/g, ''),
      nomeTitular: nomeTitular.toUpperCase(),
      validade,
      cvv,
      bandeira: bandeiraDetectada || '',
      salvarCartao: salvar
    });
  };

  return (
    <form onSubmit={handleSubmit} className={styles['cartao-form']} data-cy="checkout-new-card-form">
      <div className={styles['cartao-form-header']}>
        <CreditCard size={24} />
        <h4>Novo Cartão de Crédito</h4>
      </div>

      {erros.length > 0 && (
        <div className={styles['cartao-form-errors']} data-cy="checkout-card-errors">
          {erros.map((erro, index) => (
            <p key={index} className={styles['error-message']}>{erro}</p>
          ))}
        </div>
      )}

      <div className={styles['form-group']}>
        <label htmlFor="numero-cartao">Número do Cartão</label>
        <div className={styles['input-with-icon']}>
          <input
            id="numero-cartao"
            type="text"
            value={numero}
            onChange={handleNumeroChange}
            placeholder="0000 0000 0000 0000"
            maxLength={23}
            required
            data-cy="checkout-card-number-input"
          />
          {bandeiraDetectada && (
            <span className={styles['bandeira-badge']} data-cy="checkout-card-brand">
              {bandeiraDetectada}
            </span>
          )}
        </div>
      </div>

      <div className={styles['form-group']}>
        <label htmlFor="nome-titular">Nome do Titular (como impresso no cartão)</label>
        <input
          id="nome-titular"
          type="text"
          value={nomeTitular}
          onChange={(e) => setNomeTitular(e.target.value)}
          placeholder="NOME DO TITULAR"
          required
          data-cy="checkout-card-name-input"
        />
      </div>

      <div className={styles['form-row']}>
        <div className={styles['form-group']}>
          <label htmlFor="validade">Validade (MM/AA)</label>
          <input
            id="validade"
            type="text"
            value={validade}
            onChange={handleValidadeChange}
            placeholder="MM/AA"
            maxLength={5}
            required
            data-cy="checkout-card-expiry-input"
          />
        </div>

        <div className={styles['form-group']}>
          <label htmlFor="cvv">CVV</label>
          <div className={styles['input-with-icon']}>
            <input
              id="cvv"
              type={mostrarCvv ? 'text' : 'password'}
              value={cvv}
              onChange={handleCvvChange}
              placeholder={bandeiraDetectada === 'American Express' ? '0000' : '000'}
              maxLength={bandeiraDetectada === 'American Express' ? 4 : 3}
              required
              data-cy="checkout-card-cvv-input"
            />
            <button
              type="button"
              className={styles['toggle-cvv']}
              onClick={() => setMostrarCvv(!mostrarCvv)}
              tabIndex={-1}
            >
              {mostrarCvv ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>
      </div>

      <div className={styles['form-group-checkbox']}>
        <label className={styles['checkbox-label']}>
          <input
            type="checkbox"
            checked={salvar}
            onChange={(e) => setSalvar(e.target.checked)}
            data-cy="checkout-save-card-checkbox"
          />
          <span>Salvar cartão para compras futuras</span>
        </label>
      </div>

      <div className={styles['form-actions']}>
        {onCancel && (
          <button
            type="button"
            className="btn-secondary"
            onClick={onCancel}
            data-cy="checkout-card-cancel-button"
          >
            Cancelar
          </button>
        )}
        <button 
          type="submit" 
          className="btn-primary"
          data-cy="checkout-card-submit-button"
        >
          Adicionar Cartão
        </button>
      </div>
    </form>
  );
}
