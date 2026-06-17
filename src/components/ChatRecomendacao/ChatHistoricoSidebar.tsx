'use client';

import { useState } from 'react';
import { History, MessageSquare, X, ChevronRight } from 'lucide-react';
import type { IIteracaoChat } from '@/utils/chatIteracoes';
import { rotuloIteracao } from '@/utils/chatIteracoes';
import styles from './ChatInterface.module.css';

interface ChatHistoricoSidebarProps {
  iteracoes: IIteracaoChat[];
  iteracaoSelecionada?: number;
  onSelecionarIteracao: (indice: number) => void;
  onFechar: () => void;
}

export const ChatHistoricoSidebar = ({
  iteracoes,
  iteracaoSelecionada,
  onSelecionarIteracao,
  onFechar,
}: ChatHistoricoSidebarProps) => {
  const [iteracaoExpandida, setIteracaoExpandida] = useState<number | null>(null);

  const handleToggleExpansao = (indice: number) => {
    setIteracaoExpandida(iteracaoExpandida === indice ? null : indice);
  };

  return (
    <aside className={styles.historicoSidebar} aria-label="Histórico de conversa">
      <div className={styles.historicoSidebarHeader}>
        <div className={styles.historicoSidebarTitulo}>
          <History size={16} />
          <span>Histórico</span>
        </div>
        <button
          className={styles.historicoSidebarFechar}
          onClick={onFechar}
          aria-label="Fechar histórico"
        >
          <X size={14} />
        </button>
      </div>

      <div className={styles.historicoSidebarLista}>
        {iteracoes.length === 0 ? (
          <p className={styles.historicoVazio}>Nenhuma conversa anterior</p>
        ) : (
          iteracoes.map((iteracao) => (
            <div
              key={iteracao.indice}
              className={`${styles.historicoItem} ${
                iteracaoSelecionada === iteracao.indice ? styles.historicoItemAtivo : ''
              }`}
            >
              <button
                className={styles.historicoItemResumo}
                onClick={() => {
                  onSelecionarIteracao(iteracao.indice);
                  handleToggleExpansao(iteracao.indice);
                }}
                aria-expanded={iteracaoExpandida === iteracao.indice}
              >
                <div className={styles.historicoItemCabecalho}>
                  <MessageSquare size={14} />
                  <span className={styles.historicoItemTexto}>
                    {rotuloIteracao(iteracao)}
                  </span>
                  <ChevronRight
                    size={12}
                    className={`${styles.historicoItemChevron} ${
                      iteracaoExpandida === iteracao.indice ? styles.historicoItemChevronAberto : ''
                    }`}
                  />
                </div>
              </button>

              {iteracaoExpandida === iteracao.indice && (
                <div className={styles.historicoItemConteudo}>
                  <div className={styles.historicoMensagem}>
                    <span className={styles.historicoMensagemRotulo}>Você:</span>
                    <p className={styles.historicoMensagemTexto}>
                      {iteracao.perguntaUsuario.conteudo}
                    </p>
                  </div>
                  {iteracao.respostaAssistente && (
                    <div className={styles.historicoMensagem}>
                      <span className={styles.historicoMensagemRotulo}>IA:</span>
                      <p className={styles.historicoMensagemTexto}>
                        {iteracao.respostaAssistente.conteudo}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </aside>
  );
};
