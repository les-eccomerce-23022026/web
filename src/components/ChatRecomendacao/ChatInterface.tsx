'use client';

import { useEffect } from 'react';
import { MessageSquare, RotateCcw, AlertCircle } from 'lucide-react';
import { useChatRecomendacao } from '@/hooks/useChatRecomendacao';
import { ChatMensagem } from './ChatMensagem';
import { ChatEntradaMensagem } from './ChatEntradaMensagem';
import { ChatLoadingIndicator } from './ChatLoadingIndicator';
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
    servicoIndisponivel,
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
        {servicoIndisponivel && (
          <div
            className={styles.mensagemErro}
            role="alert"
            data-cy="ia-servico-indisponivel"
            style={{ marginBottom: '8px' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <AlertCircle size={14} />
              <span>Serviço de recomendação temporariamente indisponível</span>
            </div>
          </div>
        )}
        
        {mensagens.map((mensagem) => (
          <ChatMensagem key={mensagem.id} mensagem={mensagem} />
        ))}
        
        {isEnviando && <ChatLoadingIndicator />}
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
