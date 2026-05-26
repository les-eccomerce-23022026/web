import { forwardRef, useId } from 'react';
import type { ReactNode, TextareaHTMLAttributes } from 'react';
import { FormField } from './FormField';
import { mergeDescribedBy } from './formA11y';

export interface FormTextareaProps extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'id'> {
  label?: ReactNode;
  id?: string;
  error?: string;
  className?: string;
  dataCy?: string;
  textareaDataCy?: string;
  textareaClassName?: string;
  required?: boolean;
}

export const FormTextarea = forwardRef<HTMLTextAreaElement, FormTextareaProps>(function FormTextarea(
  {
    label,
    id: idProp,
    error,
    className,
    dataCy,
    textareaDataCy,
    textareaClassName,
    required,
    'aria-describedby': ariaDescribedByProp,
    ...textareaProps
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
      <textarea
        ref={ref}
        {...textareaProps}
        id={id}
        className={textareaClassName}
        data-cy={textareaDataCy}
        aria-invalid={error ? true : undefined}
        aria-describedby={ariaDescribedBy}
        required={required}
      />
    </FormField>
  );
});

FormTextarea.displayName = 'FormTextarea';
