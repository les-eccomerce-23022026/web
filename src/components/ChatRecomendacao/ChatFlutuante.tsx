'use client';

import { useState, useEffect } from 'react';
import { MessageCircle, X } from 'lucide-react';
import { useAppSelector } from '@/store/hooks';
import { ChatInterface } from './ChatInterface';
import styles from './ChatInterface.module.css';

export const ChatFlutuante = () => {
  const [isAberto, setIsAberto] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { isAuthenticated, user, sessionLoading } = useAppSelector((state) => state.auth);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  const exibirParaClienteLogado =
    mounted && !sessionLoading && isAuthenticated && user?.role === 'cliente';

  const abrirChat = () => setIsAberto(true);
  const fecharChat = () => setIsAberto(false);

  if (!exibirParaClienteLogado) {
    return null;
  }

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
