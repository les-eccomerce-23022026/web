'use client';

import { Modal } from '../../../components/Comum/Modal';
import styles from './style.module.css';

interface ModalJustificativaStatusProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  justificativaTexto: string;
  setJustificativaTexto: (valor: string) => void;
  justificativaCategoria: string;
  setJustificativaCategoria: (valor: string) => void;
  erroModal: string | null;
}

export function ModalJustificativaStatus({
  isOpen,
  onClose,
  onConfirm,
  justificativaTexto,
  setJustificativaTexto,
  justificativaCategoria,
  setJustificativaCategoria,
  erroModal,
}: ModalJustificativaStatusProps) {
  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title="Justificar Alteração de Status"
    >
      <div className={styles.modalContent}>
        {erroModal && (
          <div className={styles.erroModal}>
            <p>{erroModal}</p>
          </div>
        )}
        <div className={styles.modalField}>
          <label>Categoria da Ação *</label>
          <select 
            value={justificativaCategoria}
            onChange={(e) => {
              setJustificativaCategoria(e.target.value);
            }}
            className={styles.modalSelect}
          >
            <option value="">Selecione...</option>
            <option value="Fora de Mercado">Fora de Mercado</option>
            <option value="Reedição">Reedição Prevista</option>
            <option value="Avariado">Lote Avariado</option>
            <option value="Novo Lote">Fim de Indisponibilidade/Novo Lote</option>
          </select>
        </div>
        <div className={styles.modalField}>
          <label>Justificativa Descritiva *</label>
          <textarea 
            rows={4}
            value={justificativaTexto}
            onChange={(e) => {
              setJustificativaTexto(e.target.value);
            }}
            className={styles.modalTextarea}
            placeholder="Descreva o motivo detalhado..."
          />
        </div>
        <div className={styles.modalActions}>
          <button 
            onClick={onClose} 
            className={styles.btnCancelar}
          >
            Cancelar
          </button>
          <button 
            onClick={onConfirm}
            className={styles.btnConfirmar}
          >
            Confirmar Alteração
          </button>
        </div>
      </div>
    </Modal>
  );
}
