import { Modal } from '../../../components/Comum/Modal';
import styles from './style.module.css';
import type { ILoja } from '../../../interfaces/loja';
import type { ILojaFormState } from '../../../interfaces/loja';

type Props = {
  isOpen: boolean;
  editingLoja: ILoja | null;
  form: ILojaFormState;
  modalMessage: string;
  modalMessageType: 'success' | 'error';
  isConfirmModalOpen: boolean;
  onClose: () => void;
  onTriggerSaveConfirm: () => void;
  onFieldChange: (field: keyof ILojaFormState, value: string) => void;
  onGerarSlug?: (nome: string) => void;
};

export const GerenciarLojasModalFormulario = ({
  isOpen,
  editingLoja,
  form,
  modalMessage,
  modalMessageType,
  isConfirmModalOpen,
  onClose,
  onTriggerSaveConfirm,
  onFieldChange,
  onGerarSlug,
}: Props) => (
  <Modal
    isOpen={isOpen}
    onClose={onClose}
    title={editingLoja ? 'Editar Loja' : 'Nova Loja'}
    footer={
      <>
        <button className="btn-secondary" onClick={onClose} data-cy="btn-cancelar-loja">
          Cancelar
        </button>
        <button
          className="btn-primary"
          onClick={onTriggerSaveConfirm}
          data-cy="btn-salvar-loja"
        >
          {editingLoja ? 'Atualizar Loja' : 'Criar Loja'}
        </button>
      </>
    }
  >
    <div className="form-container">
      {/* Mensagem de erro/sucesso do modal */}
      {modalMessage && !isConfirmModalOpen && (
        <p
          className={
            modalMessageType === 'success' ? styles.messageSuccess : styles.errorMessage
          }
          data-cy="modal-message-loja"
        >
          {modalMessage}
        </p>
      )}

      {/* Campo Nome */}
      <div className="form-group">
        <label htmlFor="nome-loja">Nome da Loja</label>
        <input
          id="nome-loja"
          name="nome"
          type="text"
          placeholder="Ex: Loja Centro"
          value={form.nome}
          onChange={(e) => onFieldChange('nome', e.target.value)}
          data-cy="input-nome-loja"
        />
      </div>

      {/* Campo Slug com gerador */}
      <div className="form-group">
        <label htmlFor="slug-loja">Slug</label>
        <div style={{ display: 'flex', gap: '8px' }}>
          <input
            id="slug-loja"
            name="slug"
            type="text"
            placeholder="Ex: loja-centro"
            value={form.slug}
            onChange={(e) => {
              // Força minúsculas e remove caracteres inválidos
              const valor = e.target.value.toLowerCase().replace(/[^\w\-]/g, '');
              onFieldChange('slug', valor);
            }}
            style={{ flex: 1 }}
            data-cy="input-slug-loja"
          />
          <button
            type="button"
            className="btn-secondary"
            onClick={() => onGerarSlug?.(form.nome)}
            disabled={!form.nome}
            title="Gerar slug automaticamente a partir do nome"
            data-cy="btn-gerar-slug"
          >
            Gerar
          </button>
        </div>
      </div>

      {/* Campo CNPJ */}
      <div className="form-group">
        <label htmlFor="cnpj-loja">CNPJ</label>
        <input
          id="cnpj-loja"
          name="cnpj"
          type="text"
          placeholder="Ex: 12.345.678/0001-90"
          value={form.cnpj}
          onChange={(e) => {
            // Aplica máscara CNPJ
            const valor = e.target.value.replace(/\D/g, '').slice(0, 14);
            let cnpjMascarado = valor;

            if (valor.length > 0) {
              cnpjMascarado = valor.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
            }

            onFieldChange('cnpj', cnpjMascarado);
          }}
          data-cy="input-cnpj-loja"
        />
      </div>
    </div>
  </Modal>
);
