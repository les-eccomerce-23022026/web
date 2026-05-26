import { useState, useCallback, useEffect } from 'react';

type ValidationFn<T> = (value: T) => string | null;

type UseDebounceValidationProps<T> = {
  validationFn: ValidationFn<T>;
  delay?: number;
  initialValue?: T;
};

type UseDebounceValidationReturn<T> = {
  validate: (value: T) => void;
  error: string | null;
  isDebouncing: boolean;
  resetError: () => void;
};

/**
 * Hook customizado para validação com debounce.
 * Executa validação após delay especificado, ideal para validação em tempo real
 * sem feedback excessivo durante digitação.
 * 
 * @param validationFn - Função de validação que retorna erro ou null
 * @param delay - Tempo de delay em ms (padrão: 300ms)
 * @param initialValue - Valor inicial do campo
 * @returns Objeto com função validate, erro atual, estado de debouncing e função reset
 */
export function useDebounceValidation<T>({
  validationFn,
  delay = 300,
  initialValue,
}: UseDebounceValidationProps<T>): UseDebounceValidationReturn<T> {
  const [error, setError] = useState<string | null>(null);
  const [isDebouncing, setIsDebouncing] = useState(false);
  const [debouncedValue, setDebouncedValue] = useState<T | undefined>(initialValue);

  const validate = useCallback((value: T) => {
    setDebouncedValue(value);
    setIsDebouncing(true);
  }, []);

  const resetError = useCallback(() => {
    setError(null);
  }, []);

  useEffect(() => {
    if (debouncedValue === undefined) {
      return;
    }

    const timer = setTimeout(() => {
      const validationError = validationFn(debouncedValue);
      setError(validationError);
      setIsDebouncing(false);
    }, delay);

    return () => clearTimeout(timer);
  }, [debouncedValue, validationFn, delay]);

  return { validate, error, isDebouncing, resetError };
}
