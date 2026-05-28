'use client';

import { useState } from 'react';
import { MessageCircle, X } from 'lucide-react';
import { ChatInterface } from './ChatInterface';
import styles from './ChatInterface.module.css';

export const ChatFlutuante = () => {
  const [isAberto, setIsAberto] = useState(false);

  const abrirChat = () => setIsAberto(true);
  const fecharChat = () => setIsAberto(false);

  return (
    <div className={styles.chatFlutuanteContainer}>
      {isAberto && <ChatInterface onFechar={fecharChat} />}
      <button
        className={styles.chatFlutuanteBotao}
        onClick={isAberto ? fecharChat : abrirChat}
        aria-label={
          isAberto
            ? 'Fechar assistente de recomendações'
            : 'Abrir assistente de recomendações'
        }
        aria-expanded={isAberto}
        data-cy="chat-flutuante-botao"
      >
        {isAberto ? <X size={22} /> : <MessageCircle size={22} />}
      </button>
    </div>
  );
};
