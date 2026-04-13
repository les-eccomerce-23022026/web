import { useState, useEffect } from 'react';
import type { IEnderecoCliente } from '@/interfaces/pagamento';

interface UseEnderecoFormProps {
  initialData?: Partial<IEnderecoCliente>;
  onSubmit: (data: Omit<IEnderecoCliente, 'uuid'>) => Promise<void>;
}

type FormFields = Omit<IEnderecoCliente, 'uuid' | 'tipo'>;

const emptyForm: FormFields = {
  logradouro: '',
  numero: '',
  complemento: '',
  bairro: '',
  cep: '',
  cidade: '',
  estado: '',
};

export function useEnderecoForm({ initialData, onSubmit }: UseEnderecoFormProps) {
  const [formData, setFormData] = useState<FormFields>(emptyForm);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!initialData) return;
    
    const syncedData = { ...emptyForm };
    (Object.keys(emptyForm) as Array<keyof FormFields>).forEach(key => {
      syncedData[key] = initialData[key] || '';
    });
    setFormData(syncedData);
  }, [initialData]);

  const updateField = (field: keyof FormFields, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSubmit({ ...formData, tipo: 'ambos' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    ...formData,
    setLogradouro: (v: string) => updateField('logradouro', v),
    setNumero: (v: string) => updateField('numero', v),
    setComplemento: (v: string) => updateField('complemento', v),
    setBairro: (v: string) => updateField('bairro', v),
    setCep: (v: string) => updateField('cep', v),
    setCidade: (v: string) => updateField('cidade', v),
    setEstado: (v: string) => updateField('estado', v),
    isSubmitting,
    handleSubmit
  };
}
