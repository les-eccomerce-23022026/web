'use client';

import type { IMensagemChat } from '@/interfaces/iaRecomendacao';
import { ProdutoRecomendadoCard } from './ProdutoRecomendadoCard';
import { ContextoBadge } from './ContextoBadge';
import { SemProdutosMensagem } from './SemProdutosMensagem';
import styles from './ChatInterface.module.css';

interface ChatMensagemProps {
  mensagem: IMensagemChat;
  onPerguntaFollowUp?: (pergunta: string) => void;
}

export const ChatMensagem = ({ mensagem, onPerguntaFollowUp }: ChatMensagemProps) => {
  const isAssistente = mensagem.remetente === 'assistente';
  const temProdutos = mensagem.produtosRecomendados && mensagem.produtosRecomendados.length > 0;
  const produtosVazios = mensagem.produtosRecomendados && mensagem.produtosRecomendados.length === 0;
  const modoEsclarecimento =
    mensagem.tipoResposta === 'esclarecimento' &&
    mensagem.perguntasFollowUp &&
    mensagem.perguntasFollowUp.length > 0;

  return (
    <div
      className={isAssistente ? styles.bolhaAssistente : styles.bolhaUsuario}
      data-cy={`chat-mensagem-${mensagem.remetente}`}
      data-tipo-resposta={mensagem.tipoResposta}
    >
      <p className={styles.textoMensagem}>{mensagem.conteudo}</p>

      {isAssistente && modoEsclarecimento && (
        <div className={styles.chipsFollowUp} data-cy="chat-perguntas-follow-up">
          {mensagem.perguntasFollowUp?.map((pergunta) => (
            <button
              key={pergunta}
              type="button"
              className={styles.chipPergunta}
              onClick={() => onPerguntaFollowUp?.(pergunta)}
            >
              {pergunta}
            </button>
          ))}
        </div>
      )}
      
      {isAssistente && mensagem.contextoUsado && (
        <ContextoBadge contextoUsado={mensagem.contextoUsado} />
      )}
      
      {isAssistente && temProdutos && mensagem.tipoResposta !== 'esclarecimento' && (
        <div className={styles.produtosContainer}>
          {mensagem.produtosRecomendados?.map((produto) => (
            <ProdutoRecomendadoCard key={produto.uuid} produto={produto} />
          ))}
        </div>
      )}
      
      {isAssistente && produtosVazios && !modoEsclarecimento && (
        <SemProdutosMensagem mensagem="Não encontramos livros correspondentes ao seu pedido. Tente ser mais específico sobre o gênero ou tema que você procura." />
      )}
    </div>
  );
};
