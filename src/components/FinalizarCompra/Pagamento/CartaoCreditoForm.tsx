import { useCartaoCreditoForm } from './useCartaoCreditoForm';
import { CartaoCreditoFormView } from './CartaoCreditoFormView';
import type { ICartaoCreditoInput } from '@/interfaces/pagamento';
import styles from './CartaoCreditoForm.module.css';

interface CartaoCreditoFormProps {
  bandeirasPermitidas?: string[];
  onSubmit: (dados: ICartaoCreditoInput) => void;
  onCancel?: () => void;
  salvarCartao?: boolean;
  /** Texto auxiliar abaixo do checkbox “salvar cartão” (ex.: checkout). */
  dicaSalvarCartaoOpcional?: string;
}

export const CartaoCreditoForm = ({
  bandeirasPermitidas = [],
  onSubmit,
  onCancel,
  salvarCartao = false,
  dicaSalvarCartaoOpcional,
}: CartaoCreditoFormProps) => {
  const f = useCartaoCreditoForm(bandeirasPermitidas, onSubmit, salvarCartao);

  return (
    <form
      onSubmit={f.handleSubmit}
      className={styles['cartao-form']}
      data-cy="checkout-new-card-form"
    >
      <CartaoCreditoFormView
        erros={f.erros}
        numero={f.numero}
        nomeTitular={f.nomeTitular}
        validade={f.validade}
        cvv={f.cvv}
        salvar={f.salvar}
        mostrarCvv={f.mostrarCvv}
        bandeiraDetectada={f.bandeiraDetectada}
        dicaSalvarCartaoOpcional={dicaSalvarCartaoOpcional}
        onNomeChange={(e) => f.setNomeTitular(e.target.value)}
        onSalvarChange={(e) => f.setSalvar(e.target.checked)}
        onToggleCvv={() => f.setMostrarCvv(!f.mostrarCvv)}
        onNumeroChange={f.handleNumeroChange}
        onValidadeChange={f.handleValidadeChange}
        onCvvChange={f.handleCvvChange}
        onCancel={onCancel}
      />
    </form>
  );
};
