'use client';

import { useEffect } from 'react';
import { MessageSquare, RotateCcw } from 'lucide-react';
import { useChatRecomendacao } from '@/hooks/useChatRecomendacao';
import { ChatMensagem } from './ChatMensagem';
import { ChatEntradaMensagem } from './ChatEntradaMensagem';
import styles from './ChatInterface.module.css';

interface ChatInterfaceProps {
  onFechar: () => void;
}

export const ChatInterface = ({ onFechar }: ChatInterfaceProps) => {
  const {
    mensagens,
    textoEntrada,
    isEnviando,
    erroEnvio,
    listaRef,
    setTextoEntrada,
    enviarMensagem,
    limparConversa,
  } = useChatRecomendacao();

  useEffect(() => {
    if (!listaRef.current) return;
    listaRef.current.scrollTop = listaRef.current.scrollHeight;
  }, [mensagens, listaRef]);

  return (
    <div
      className={styles.painel}
      role="dialog"
      aria-label="Assistente de recomendação de livros"
      data-cy="chat-painel"
    >
      <div className={styles.cabecalho}>
        <div className={styles.cabecalhoTitulo}>
          <MessageSquare size={16} />
          <span className={styles.tituloChat}>Assistente de Livros</span>
        </div>
        <div className={styles.cabecalhoAcoes}>
          <button
            className={styles.botaoAcao}
            onClick={limparConversa}
            aria-label="Limpar conversa"
            title="Limpar conversa"
            data-cy="chat-botao-limpar"
          >
            <RotateCcw size={14} />
          </button>
          <button
            className={styles.botaoFechar}
            onClick={onFechar}
            aria-label="Fechar assistente"
            data-cy="chat-botao-fechar"
          >
            ✕
          </button>
        </div>
      </div>

      <div
        ref={listaRef}
        className={styles.listaMensagens}
        role="log"
        aria-live="polite"
        aria-label="Histórico da conversa"
      >
        {mensagens.map((mensagem) => (
          <ChatMensagem key={mensagem.id} mensagem={mensagem} />
        ))}
        {isEnviando && (
          <div className={styles.indicadorDigitando} aria-label="Assistente digitando">
            <span className={styles.pontoDigitando} />
            <span className={styles.pontoDigitando} />
            <span className={styles.pontoDigitando} />
          </div>
        )}
      </div>

      {erroEnvio && (
        <p className={styles.mensagemErro} role="alert" data-cy="chat-erro">
          {erroEnvio}
        </p>
      )}

      <ChatEntradaMensagem
        valor={textoEntrada}
        isEnviando={isEnviando}
        onChange={setTextoEntrada}
        onEnviar={() => void enviarMensagem()}
      />
    </div>
  );
};
