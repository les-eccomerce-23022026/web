import { useCallback } from 'react';

/** Remove caracteres não numéricos (útil em onChange de campos controlados). */
export function digitsOnly(value: string): string {
  return value.replace(/\D/g, '');
}

/**
 * Retorna função estável que sanitiza o valor para apenas dígitos.
 * Opcional; você pode usar só `digitsOnly` em handlers inline.
 */
export function useDigitsOnly() {
  return useCallback((value: string) => digitsOnly(value), []);
}
