'use client';

import { BookOpen } from 'lucide-react';
import styles from './SemProdutosMensagem.module.css';

interface SemProdutosMensagemProps {
  mensagem: string;
}

export const SemProdutosMensagem = ({ mensagem }: SemProdutosMensagemProps) => {
  return (
    <div
      className={styles.container}
      data-cy="ia-sem-produtos"
      role="status"
      aria-label="Nenhum produto encontrado"
    >
      <BookOpen size={20} className={styles.icon} />
      <p className={styles.texto}>{mensagem}</p>
    </div>
  );
};
