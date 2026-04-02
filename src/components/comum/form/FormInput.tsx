import { forwardRef, useId } from 'react';
import type { InputHTMLAttributes, ReactNode } from 'react';
import { FormField } from './FormField';
import { mergeDescribedBy } from './formA11y';

export interface FormInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'id'> {
  label?: ReactNode;
  /** Se omitido, gera um id estável com useId (acessibilidade). */
  id?: string;
  error?: string;
  className?: string;
  /** `data-cy` no wrapper .form-group */
  dataCy?: string;
  /** `data-cy` no elemento &lt;input&gt; */
  inputDataCy?: string;
  inputClassName?: string;
  required?: boolean;
}

/**
 * Campo de texto (ou tipo customizado) controlado pelo pai, com label e erro opcionais.
 */
export const FormInput = forwardRef<HTMLInputElement, FormInputProps>(function FormInput(
  {
    label,
    id: idProp,
    error,
    className,
    dataCy,
    inputDataCy,
    inputClassName,
    required,
    'aria-describedby': ariaDescribedByProp,
    ...inputProps
  },
  ref,
) {
  const genId = useId();
  const id = idProp ?? genId;
  const errorId = `${id}-error`;
  const ariaDescribedBy = mergeDescribedBy(ariaDescribedByProp, error ? errorId : undefined);

  return (
    <FormField
      label={label}
      htmlFor={id}
      error={error}
      className={className}
      dataCy={dataCy}
      required={required}
    >
      <input
        ref={ref}
        {...inputProps}
        id={id}
        className={inputClassName}
        data-cy={inputDataCy}
        aria-invalid={error ? true : undefined}
        aria-describedby={ariaDescribedBy}
        required={required}
      />
    </FormField>
  );
});

FormInput.displayName = 'FormInput';
