import type { ReactNode } from 'react';
import { useId } from 'react';
import styles from './FormField.module.css';

export interface FormFieldProps {
  /** Texto ou nó do rótulo; omitir quando o controle traz `aria-label` próprio. */
  label?: ReactNode;
  /** Deve coincidir com o `id` do input/select/textarea filho para o label. */
  htmlFor?: string;
  error?: string;
  /** Classes no wrapper `div.form-group` (ex.: módulo CSS do pai). */
  className?: string;
  /** `data-cy` no wrapper (Cypress / testes). */
  dataCy?: string;
  children: ReactNode;
  /** Exibe asterisco no label (campos obrigatórios). */
  required?: boolean;
}

/**
 * Agrupa label + controle (children) + mensagem de erro opcional.
 * Apresentação apenas; estado e validação ficam no componente pai.
 */
export function FormField({
  label,
  htmlFor,
  error,
  className,
  dataCy,
  children,
  required,
}: FormFieldProps) {
  const fallbackErrorId = useId();
  const errorMessageId = htmlFor ? `${htmlFor}-error` : fallbackErrorId;

  const wrapperClass = ['form-group', className].filter(Boolean).join(' ');

  return (
    <div className={wrapperClass} data-cy={dataCy}>
      {label != null ? (
        <label htmlFor={htmlFor}>
          {label}
          {required ? ' *' : ''}
        </label>
      ) : null}
      {children}
      {error ? (
        <span id={errorMessageId} className={styles.error} role="alert">
          {error}
        </span>
      ) : null}
    </div>
  );
}
