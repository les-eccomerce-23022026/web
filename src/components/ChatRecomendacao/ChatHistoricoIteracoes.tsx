'use client';

import { ChevronDown, CornerDownLeft } from 'lucide-react';
import type { IMensagemChat } from '@/interfaces/iaRecomendacao';
import type { IIteracaoChat } from '@/utils/chatIteracoes';
import { rotuloIteracao } from '@/utils/chatIteracoes';
import { ChatMensagem } from './ChatMensagem';
import styles from './ChatInterface.module.css';

interface ChatHistoricoIteracoesProps {
  boasVindas?: IMensagemChat;
  iteracoesAnteriores: IIteracaoChat[];
  iteracaoAtual?: IIteracaoChat;
  isEnviando: boolean;
  onPerguntaFollowUp?: (pergunta: string) => void;
  onContinuarDaIteracao: (indice: number) => void;
}

export const ChatHistoricoIteracoes = ({
  boasVindas,
  iteracoesAnteriores,
  iteracaoAtual,
  isEnviando,
  onPerguntaFollowUp,
  onContinuarDaIteracao,
}: ChatHistoricoIteracoesProps) => {
  return (
    <>
      {boasVindas && (
        <ChatMensagem mensagem={boasVindas} onPerguntaFollowUp={onPerguntaFollowUp} />
      )}

      {iteracoesAnteriores.map((iteracao) => (
        <details
          key={iteracao.perguntaUsuario.id}
          className={styles.iteracaoDropdown}
          data-cy="chat-iteracao-anterior"
          data-indice={iteracao.indice}
        >
          <summary className={styles.iteracaoResumo}>
            <span className={styles.iteracaoRotulo}>
              <span className={styles.iteracaoNumero}>Turno {iteracao.indice}</span>
              {rotuloIteracao(iteracao)}
            </span>
            <ChevronDown size={14} className={styles.iteracaoChevron} aria-hidden />
          </summary>

          <div className={styles.iteracaoConteudo}>
            <ChatMensagem
              mensagem={iteracao.perguntaUsuario}
              onPerguntaFollowUp={undefined}
            />
            {iteracao.respostaAssistente && (
              <ChatMensagem
                mensagem={iteracao.respostaAssistente}
                onPerguntaFollowUp={undefined}
              />
            )}

            <button
              type="button"
              className={styles.botaoContinuarIteracao}
              onClick={() => onContinuarDaIteracao(iteracao.indice)}
              disabled={isEnviando}
              data-cy="chat-continuar-iteracao"
            >
              <CornerDownLeft size={13} aria-hidden />
              Continuar deste turno
            </button>
          </div>
        </details>
      ))}

      {iteracaoAtual && (
        <section
          className={styles.iteracaoAtual}
          data-cy="chat-iteracao-atual"
          data-indice={iteracaoAtual.indice}
        >
          <ChatMensagem
            mensagem={iteracaoAtual.perguntaUsuario}
            onPerguntaFollowUp={onPerguntaFollowUp}
          />
          {iteracaoAtual.respostaAssistente && (
            <ChatMensagem
              mensagem={iteracaoAtual.respostaAssistente}
              onPerguntaFollowUp={onPerguntaFollowUp}
            />
          )}
        </section>
      )}
    </>
  );
};
