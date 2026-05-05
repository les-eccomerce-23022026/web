import { CreditCard } from 'lucide-react';
import type { ChangeEvent } from 'react';
import styles from './CartaoCreditoForm.style.module.css';
import { CartaoCreditoFormAcoes } from './CartaoCreditoFormAcoes';
import { CartaoCreditoFormCampos } from './CartaoCreditoFormCampos';
import { CartaoCreditoFormErros } from './CartaoCreditoFormErros';
import { detectarAmex, obterConfiguracaoCvv } from './cartaoCreditoFormViewUtils';

type Props = {
  erros: string[];
  numero: string;
  nomeTitular: string;
  validade: string;
  cvv: string;
  salvar: boolean;
  mostrarCvv: boolean;
  bandeiraDetectada: string | null;
  dicaSalvarCartaoOpcional?: string;
  onNomeChange: (e: ChangeEvent<HTMLInputElement>) => void;
  onSalvarChange: (e: ChangeEvent<HTMLInputElement>) => void;
  onToggleCvv: () => void;
  onNumeroChange: (e: ChangeEvent<HTMLInputElement>) => void;
  onValidadeChange: (e: ChangeEvent<HTMLInputElement>) => void;
  onCvvChange: (e: ChangeEvent<HTMLInputElement>) => void;
  onCancel?: () => void;
};

const SalvarCartaoCheckboxBlock = ({
  salvar,
  dicaSalvarCartaoOpcional,
  onSalvarChange,
}: {
  salvar: boolean;
  dicaSalvarCartaoOpcional?: string;
  onSalvarChange: (e: ChangeEvent<HTMLInputElement>) => void;
}) => (
  <div className={styles['form-group-checkbox']}>
    <label className={styles['checkbox-label']}>
      <input
        type="checkbox"
        checked={salvar}
        onChange={onSalvarChange}
        data-cy="checkout-save-card-checkbox"
      />
      <span>Salvar cartão para compras futuras</span>
    </label>
    {dicaSalvarCartaoOpcional ? (
      <p className={styles['cartao-form-hint']} data-cy="checkout-save-card-hint">
        {dicaSalvarCartaoOpcional}
      </p>
    ) : null}
  </div>
);

export const CartaoCreditoFormView = ({
  erros,
  numero,
  nomeTitular,
  validade,
  cvv,
  salvar,
  mostrarCvv,
  bandeiraDetectada,
  dicaSalvarCartaoOpcional,
  onNomeChange,
  onSalvarChange,
  onToggleCvv,
  onNumeroChange,
  onValidadeChange,
  onCvvChange,
  onCancel,
}: Props) => {
  const amex = detectarAmex(bandeiraDetectada);
  const configuracaoCvv = obterConfiguracaoCvv(amex);

  return (
    <>
      <div className={styles['cartao-form-header']}>
        <CreditCard size={24} />
        <h4>Novo Cartão de Crédito</h4>
      </div>

      <CartaoCreditoFormErros erros={erros} />

      <CartaoCreditoFormCampos
        numero={numero}
        nomeTitular={nomeTitular}
        validade={validade}
        cvv={cvv}
        mostrarCvv={mostrarCvv}
        bandeiraDetectada={bandeiraDetectada}
        cvvPlaceholder={configuracaoCvv.placeholder}
        cvvMaxLength={configuracaoCvv.maxLength}
        onNomeChange={onNomeChange}
        onNumeroChange={onNumeroChange}
        onValidadeChange={onValidadeChange}
        onCvvChange={onCvvChange}
        onToggleCvv={onToggleCvv}
      />

      <SalvarCartaoCheckboxBlock
        salvar={salvar}
        dicaSalvarCartaoOpcional={dicaSalvarCartaoOpcional}
        onSalvarChange={onSalvarChange}
      />

      <CartaoCreditoFormAcoes onCancel={onCancel} />
    </>
  );
};
