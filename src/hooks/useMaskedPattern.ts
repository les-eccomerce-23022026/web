import { useCallback } from 'react';

export interface MaskedPatternOptions {
  /** Máximo de dígitos após remover não numéricos. */
  maxDigits: number;
  /** Formata a string de dígitos (ex.: CEP: "12345678" → "12345-678"). */
  format: (digits: string) => string;
}

/**
 * Produz `(valorBruto) => valorMasc` para usar em estado controlado (ex.: no onChange).
 * Não gerencia estado; o pai continua com useState / objeto de formulário.
 */
export function useMaskedPattern({ maxDigits, format }: MaskedPatternOptions) {
  return useCallback(
    (raw: string) => {
      const digits = raw.replace(/\D/g, '').slice(0, maxDigits);
      return format(digits);
    },
    [maxDigits, format],
  );
}
