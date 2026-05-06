'use client';

import { useEffect } from 'react';
import { X } from 'lucide-react';
import styles from './style.module.css';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  variant?: 'default' | 'large';
}

export const Modal = ({ isOpen, onClose, title, children, footer, variant = 'default' }: ModalProps) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = 'unset';
      };
    }
    document.body.style.overflow = 'unset';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={onClose} role="dialog" aria-modal="true" data-cy="modal-overlay">
      <div className={`${styles.modal} ${variant === 'large' ? styles.large : ''}`} onClick={(e) => e.stopPropagation()} data-cy="modal-content">
        {title && (
          <div className={styles.header}>
            <h2 className={styles.title} data-cy="modal-title">{title}</h2>
            <button onClick={onClose} className={styles.closeButton} aria-label="Fechar modal" data-cy="modal-close-button">
              <X size={20} />
            </button>
          </div>
        )}
        <div className={styles.content} data-cy="modal-body">{children}</div>
        {footer && <div className={styles.footer} data-cy="modal-footer">{footer}</div>}
      </div>
    </div>
  );
};
