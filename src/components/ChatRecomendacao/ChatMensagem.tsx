'use client';

import type { IMensagemChat } from '@/interfaces/iaRecomendacao';
import styles from './ChatInterface.module.css';

interface ChatMensagemProps {
  mensagem: IMensagemChat;
}

export const ChatMensagem = ({ mensagem }: ChatMensagemProps) => {
  const isAssistente = mensagem.remetente === 'assistente';

  return (
    <div
      className={isAssistente ? styles.bolhaAssistente : styles.bolhaUsuario}
      data-cy={`chat-mensagem-${mensagem.remetente}`}
    >
      <p className={styles.textoMensagem}>{mensagem.conteudo}</p>
    </div>
  );
};
