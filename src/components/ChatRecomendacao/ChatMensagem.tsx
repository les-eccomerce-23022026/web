'use client';

import type { IMensagemChat } from '@/interfaces/iaRecomendacao';
import { ProdutoRecomendadoCard } from './ProdutoRecomendadoCard';
import { ContextoBadge } from './ContextoBadge';
import { SemProdutosMensagem } from './SemProdutosMensagem';
import { MensagemAssistenteConteudo } from './MensagemAssistenteConteudo';
import styles from './ChatInterface.module.css';

interface ChatMensagemProps {
  mensagem: IMensagemChat;
  onPerguntaFollowUp?: (pergunta: string) => void;
}

export const ChatMensagem = ({ mensagem, onPerguntaFollowUp }: ChatMensagemProps) => {
  const isAssistente = mensagem.remetente === 'assistente';
  const temProdutos = mensagem.produtosRecomendados && mensagem.produtosRecomendados.length > 0;
  const produtosVazios = mensagem.produtosRecomendados && mensagem.produtosRecomendados.length === 0;
  const temChipsFollowUp =
    mensagem.perguntasFollowUp !== undefined && mensagem.perguntasFollowUp.length > 0;

  const exibirGradeProdutos =
    isAssistente && temProdutos && mensagem.tipoResposta !== 'esclarecimento';

  if (!isAssistente) {
    return (
      <div
        className={styles.bolhaUsuario}
        data-cy={`chat-mensagem-${mensagem.remetente}`}
        data-tipo-resposta={mensagem.tipoResposta}
      >
        <p className={styles.textoMensagem}>{mensagem.conteudo}</p>
      </div>
    );
  }

  return (
    <div
      className={exibirGradeProdutos ? styles.blocoMensagemAssistente : styles.bolhaAssistente}
      data-cy={`chat-mensagem-${mensagem.remetente}`}
      data-tipo-resposta={mensagem.tipoResposta}
    >
      <div className={styles.bolhaAssistente}>
        <MensagemAssistenteConteudo conteudo={mensagem.conteudo} />

        {temChipsFollowUp && (
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

        {mensagem.contextoUsado && <ContextoBadge contextoUsado={mensagem.contextoUsado} />}
      </div>

      {exibirGradeProdutos && (
        <div className={styles.produtosContainer}>
          {mensagem.produtosRecomendados?.map((produto) => (
            <ProdutoRecomendadoCard key={produto.uuid} produto={produto} />
          ))}
        </div>
      )}

      {produtosVazios && !temChipsFollowUp && (
        <SemProdutosMensagem mensagem="Não encontramos livros correspondentes ao seu pedido. Tente ser mais específico sobre o gênero ou tema que você procura." />
      )}
    </div>
  );
};
