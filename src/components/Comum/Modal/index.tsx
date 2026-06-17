'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
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
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    
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

  if (!isOpen || !mounted) return null;

  const modalContent = (
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

  // Renderiza no portal-root para evitar problemas de z-index com elementos pai
  if (typeof window !== 'undefined') {
    const portalRoot = document.getElementById('portal-root');
    if (portalRoot) {
      return createPortal(modalContent, portalRoot);
    }
  }

  return modalContent;
};
