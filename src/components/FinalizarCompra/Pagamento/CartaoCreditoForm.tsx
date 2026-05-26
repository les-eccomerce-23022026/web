import { useCartaoCreditoForm } from './useCartaoCreditoForm';
import { CartaoCreditoFormView } from './CartaoCreditoFormView';
import type { ICartaoCreditoInput } from '@/interfaces/pagamento';
import styles from './CartaoCreditoForm.style.module.css';

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
        touched={f.touched}
        handleCampoTocado={f.handleCampoTocado}
        validacaoNumero={f.validacaoNumero}
        validacaoValidade={f.validacaoValidade}
        validacaoCvv={f.validacaoCvv}
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
