import { forwardRef, useId } from 'react';
import type { ReactNode, SelectHTMLAttributes } from 'react';
import { FormField } from './FormField';
import { mergeDescribedBy } from './formA11y';

export interface FormSelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'id'> {
  label?: ReactNode;
  id?: string;
  error?: string;
  className?: string;
  dataCy?: string;
  selectDataCy?: string;
  selectClassName?: string;
  required?: boolean;
  children: ReactNode;
}

export const FormSelect = forwardRef<HTMLSelectElement, FormSelectProps>(function FormSelect(
  {
    label,
    id: idProp,
    error,
    className,
    dataCy,
    selectDataCy,
    selectClassName,
    required,
    children,
    'aria-describedby': ariaDescribedByProp,
    ...selectProps
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
      <select
        ref={ref}
        {...selectProps}
        id={id}
        className={selectClassName}
        data-cy={selectDataCy}
        aria-invalid={error ? true : undefined}
        aria-describedby={ariaDescribedBy}
        required={required}
      >
        {children}
      </select>
    </FormField>
  );
});

FormSelect.displayName = 'FormSelect';
