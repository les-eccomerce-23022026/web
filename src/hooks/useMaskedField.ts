import type { Dispatch, SetStateAction } from 'react';

interface UseMaskedFieldProps {
  value: string;
  setter: Dispatch<SetStateAction<string>>;
}

/**
 * Hook utilitário para campos que mostram dados mascarados (com *) vindos do banco.
 * - Ao focar (onFocus), se houver máscara, o campo é limpo para edição.
 * - Ao perder o foco (onBlur), se o campo estiver vazio, o valor original (mascarado) é restaurado.
 */
export function useMaskedField({ value, setter }: UseMaskedFieldProps) {
  const onFocus = (forceMaybeEvent: boolean | React.FocusEvent) => {
    // Check if it's a forced boolean or a FocusEvent
    const shouldForce = typeof forceMaybeEvent === 'boolean' ? forceMaybeEvent : false;

    // Se o valor atual contém asteriscos ou formatação de máscara, limpamos para o usuário digitar do zero
    // Ou se shouldForce for true, limpamos qualquer valor para redigitação total
    if (shouldForce || value.includes('*') || value.includes('(')) {
      setter('');
    }
  };

  const onBlur = (originalValue: string) => {
    // Se o usuário não digitou nada e saiu do campo, restauramos a visualização original (mascarada)
    if (value.trim() === '') {
      setter(originalValue);
    }
  };

  return {
    onFocus,
    onBlur,
  };
}
