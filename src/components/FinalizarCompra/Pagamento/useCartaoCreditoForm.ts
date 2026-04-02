import { useState, useMemo, useCallback, type ChangeEvent, type FormEvent } from 'react';
import {
  detectarBandeira,
  validarCamposFormularioCartaoCredito,
} from '@/utils/cartaoValidacao';
import type { ICartaoCreditoInput } from '@/interfaces/pagamento';

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

  const bandeiraDetectada = useMemo(() => detectarBandeira(numero), [numero]);

  const handleNumeroChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    let valor = e.target.value.replace(/\D/g, '');
    if (valor.length > 19) {
      valor = valor.slice(0, 19);
    }
    valor = valor.replace(/(\d{4})(?=\d)/g, '$1 ');
    setNumero(valor);
    setErros([]);
  }, []);

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
  }, []);

  const handleCvvChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      let valor = e.target.value.replace(/\D/g, '');
      const maxDigitos = bandeiraDetectada === 'American Express' ? 4 : 3;
      if (valor.length > maxDigitos) {
        valor = valor.slice(0, maxDigitos);
      }
      setCvv(valor);
      setErros([]);
    },
    [bandeiraDetectada],
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
    bandeiraDetectada,
    handleNumeroChange,
    handleValidadeChange,
    handleCvvChange,
    handleSubmit,
  };
}
