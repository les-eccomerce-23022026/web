import { useState, useMemo, useCallback, type ChangeEvent, type FormEvent } from 'react';
import {
  detectarBandeira,
  validarCamposFormularioCartaoCredito,
  validarNumeroCartao,
  validarValidadeMmAa,
} from '@/utils/cartaoValidacao';
import type { ICartaoCreditoInput } from '@/interfaces/pagamento';
import { useDebounceValidation } from '@/hooks/useDebounceValidation';

export function useCartaoCreditoForm(
  bandeirasPermitidas: string[],
  onSubmit: (dados: ICartaoCreditoInput) => void,
  salvarCartaoInicial: boolean,
) {
  const [numero, setNumero] = useState('');
  const [nomeTitular, setNomeTitular] = useState('');
  const [validade, setValidade] = useState('');
  const [cvv, setCvv] = useState('');
  const [salvar, setSalvar] = useState(salvarCartaoInicial);
  const [mostrarCvv, setMostrarCvv] = useState(false);
  const [erros, setErros] = useState<string[]>([]);
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  // Validação com debounce para número do cartão
  const validacaoNumero = useDebounceValidation<string>({
    validationFn: (num) => {
      const numeroLimpo = num.replace(/\D/g, '');
      const errosNum = validarNumeroCartao(numeroLimpo);
      return errosNum.length > 0 ? errosNum[0] : null;
    },
    delay: 300,
  });

  // Validação com debounce para validade
  const validacaoValidade = useDebounceValidation<string>({
    validationFn: (val) => {
      const errosVal = validarValidadeMmAa(val);
      return errosVal.length > 0 ? errosVal[0] : null;
    },
    delay: 300,
  });

  // Validação com debounce para CVV
  const validacaoCvv = useDebounceValidation<string>({
    validationFn: (cvvVal) => {
      const cvvLimpo = cvvVal.replace(/\D/g, '');
      const cvvMax = bandeiraDetectada === 'American Express' ? 4 : 3;
      if (cvvLimpo.length !== cvvMax && cvvLimpo.length > 0) {
        return `CVV deve ter ${cvvMax} dígitos`;
      }
      return null;
    },
    delay: 300,
  });

  const bandeiraDetectada = useMemo(() => detectarBandeira(numero), [numero]);

  const handleNumeroChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    let valor = e.target.value.replace(/\D/g, '');
    if (valor.length > 19) {
      valor = valor.slice(0, 19);
    }
    valor = valor.replace(/(\d{4})(?=\d)/g, '$1 ');
    setNumero(valor);
    setErros([]);
    validacaoNumero.validate(valor);
  }, [validacaoNumero]);

  const handleValidadeChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    let valor = e.target.value.replace(/\D/g, '');
    if (valor.length > 4) {
      valor = valor.slice(0, 4);
    }
    if (valor.length >= 2) {
      valor = `${valor.slice(0, 2)}/${valor.slice(2)}`;
    }
    setValidade(valor);
    setErros([]);
    validacaoValidade.validate(valor);
  }, [validacaoValidade]);

  const handleCvvChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      let valor = e.target.value.replace(/\D/g, '');
      const maxDigitos = bandeiraDetectada === 'American Express' ? 4 : 3;
      if (valor.length > maxDigitos) {
        valor = valor.slice(0, maxDigitos);
      }
      setCvv(valor);
      setErros([]);
      validacaoCvv.validate(valor);
    },
    [bandeiraDetectada, validacaoCvv],
  );

  const validarFormulario = useCallback((): boolean => {
    const novosErros = validarCamposFormularioCartaoCredito({
      numero,
      nomeTitular,
      validade,
      cvv,
      bandeiraDetectada,
      bandeirasPermitidas,
    });
    setErros(novosErros);
    return novosErros.length === 0;
  }, [numero, nomeTitular, validade, cvv, bandeiraDetectada, bandeirasPermitidas]);

  const handleSubmit = useCallback(
    (e: FormEvent) => {
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
        salvarCartao: salvar,
      });
    },
    [validarFormulario, onSubmit, numero, nomeTitular, validade, cvv, bandeiraDetectada, salvar],
  );

  const handleCampoTocado = useCallback((campo: string) => {
    setTouched((prev) => ({ ...prev, [campo]: true }));
  }, []);

  return {
    numero,
    nomeTitular,
    setNomeTitular,
    validade,
    cvv,
    salvar,
    setSalvar,
    mostrarCvv,
    setMostrarCvv,
    erros,
    touched,
    handleCampoTocado,
    bandeiraDetectada,
    validacaoNumero,
    validacaoValidade,
    validacaoCvv,
    handleNumeroChange,
    handleValidadeChange,
    handleCvvChange,
    handleSubmit,
  };
}
