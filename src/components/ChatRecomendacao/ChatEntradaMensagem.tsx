'use client';

import type { KeyboardEvent } from 'react';
import { forwardRef, useEffect } from 'react';
import { Send } from 'lucide-react';
import styles from './ChatInterface.module.css';

interface ChatEntradaMensagemProps {
  valor: string;
  isEnviando: boolean;
  onChange: (valor: string) => void;
  onEnviar: () => void;
}

export const ChatEntradaMensagem = forwardRef<HTMLTextAreaElement, ChatEntradaMensagemProps>(
  ({ valor, isEnviando, onChange, onEnviar }, ref) => {
    const handleTeclaPressionada = (e: KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key !== 'Enter' || e.shiftKey) return;
      e.preventDefault();
      onEnviar();
    };

    // Foca automaticamente no textarea quando não está enviando
    useEffect(() => {
      if (!isEnviando && ref && 'current' in ref && ref.current) {
        ref.current.focus();
      }
    }, [isEnviando, ref]);

    return (
      <div className={styles.entradaContainer}>
        <textarea
          ref={ref}
          className={styles.entradaTextarea}
          value={valor}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleTeclaPressionada}
          placeholder="Pergunte sobre livros ou peça recomendações..."
          disabled={isEnviando}
          rows={2}
          aria-label="Digite sua mensagem"
          data-cy="chat-entrada-mensagem"
        />
        <button
          className={styles.botaoEnviar}
          onClick={onEnviar}
          disabled={isEnviando || !valor.trim()}
          aria-label="Enviar mensagem"
          data-cy="chat-botao-enviar"
        >
          <Send size={18} />
        </button>
      </div>
    );
  }
);

ChatEntradaMensagem.displayName = 'ChatEntradaMensagem';
