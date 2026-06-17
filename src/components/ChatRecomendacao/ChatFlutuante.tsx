'use client';

import { useState, useEffect } from 'react';
import { MessageCircle, X } from 'lucide-react';
import { useAppSelector } from '@/store/hooks';
import { ChatInterface } from './ChatInterface';
import { PainelLateral } from '@/components/Comum/PainelLateral';
import styles from './ChatInterface.module.css';

/**
 * FAB fixo (canto inferior direito) que abre o PainelLateral
 * com o Assistente da Livraria.
 * Visível para clientes e administradores autenticados.
 */
export const ChatFlutuante = () => {
  const [isAberto, setIsAberto] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [historicoAberto, setHistoricoAberto] = useState(false);
  const { isAuthenticated, user, sessionLoading } = useAppSelector((state) => state.auth);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  // Bloqueia scroll do body enquanto o painel estiver aberto
  useEffect(() => {
    document.body.style.overflow = isAberto ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [isAberto]);

  // Permite acesso a clientes e administradores (admin e admin_sistema)
  const temPapelAutorizado = user?.papeis?.some(
    (papel) => papel === 'cliente' || papel === 'admin' || papel === 'admin_sistema'
  );

  const exibirChat =
    mounted && !sessionLoading && isAuthenticated && temPapelAutorizado;

  const abrirChat = () => setIsAberto(true);
  const fecharChat = () => setIsAberto(false);

  const larguraPainel = historicoAberto ? 'min(750px, 90vw)' : 'min(500px, 90vw)';

  if (!exibirChat) {
    return null;
  }

  return (
    <>
      {/* Painel lateral com o chat — PainelLateral gerencia overlay, Escape e botão fechar */}
      <PainelLateral
        aberto={isAberto}
        onFechar={fecharChat}
        titulo="Assistente da Livraria"
        lado="esquerda"
        largura={larguraPainel}
        dataCy="chat-sidebar"
      >
        <ChatInterface
          onHistoricoToggle={setHistoricoAberto}
        />
      </PainelLateral>

      {/* FAB fixo — canto inferior direito */}
      <div className={styles.chatFlutuanteContainer}>
        <button
          className={styles.chatFlutuanteBotao}
          onClick={isAberto ? fecharChat : abrirChat}
          aria-label={
            isAberto
              ? 'Fechar assistente da livraria'
              : 'Abrir assistente da livraria'
          }
          aria-expanded={isAberto}
          data-cy="chat-flutuante-botao"
        >
          {isAberto ? <X size={22} /> : <MessageCircle size={22} />}
        </button>
      </div>
    </>
  );
};
