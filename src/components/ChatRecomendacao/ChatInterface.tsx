'use client';

import { useEffect } from 'react';
import { MessageSquare, RotateCcw, AlertCircle } from 'lucide-react';
import { useChatRecomendacao } from '@/hooks/useChatRecomendacao';
import { ChatMensagem } from './ChatMensagem';
import { ChatHistoricoIteracoes } from './ChatHistoricoIteracoes';
import { ChatEntradaMensagem } from './ChatEntradaMensagem';
import { ChatLoadingIndicator } from './ChatLoadingIndicator';
import styles from './ChatInterface.module.css';

/** Sugestões rápidas exibidas na abertura do chat */
const SUGESTOES_RAPIDAS = [
  'Status do meu pedido',
  'Livros mais vendidos em Fantasia',
  'Presente para adolescente',
] as const;

/**
 * Conteúdo do chat — layout coluna full-height.
 * Projetado para ser renderizado dentro de PainelLateral.
 * O cabeçalho externo (título + botão fechar) é responsabilidade do PainelLateral.
 */
export const ChatInterface = () => {
  const {
    mensagens,
    boasVindas,
    iteracoesAnteriores,
    iteracaoAtual,
    textoEntrada,
    isEnviando,
    erroEnvio,
    servicoIndisponivel,
    listaRef,
    entradaRef,
    setTextoEntrada,
    enviarMensagem,
    enviarPerguntaFollowUp,
    limparConversa,
    continuarDaIteracao,
  } = useChatRecomendacao();

  const mostrarSugestoes =
    mensagens.length <= 1 && !isEnviando && !iteracaoAtual;

  useEffect(() => {
    if (!listaRef.current) return;
    listaRef.current.scrollTop = listaRef.current.scrollHeight;
  }, [mensagens, listaRef]);

  return (
    <div
      className={styles.painel}
      aria-label="Assistente da Livraria"
      data-cy="chat-painel"
    >
      {/* Sub-cabeçalho do chat: ícone + título + limpar conversa */}
      <div className={styles.cabecalho}>
        <div className={styles.cabecalhoTitulo}>
          <MessageSquare size={16} />
          <span className={styles.tituloChat}>Assistente da Livraria</span>
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
        </div>
      </div>

      {/* Sugestões rápidas — visíveis apenas no início da conversa */}
      {mostrarSugestoes && (
        <div
          className={styles.sugestoesContainer}
          aria-label="Sugestões rápidas"
        >
          {SUGESTOES_RAPIDAS.map((sugestao) => (
            <button
              key={sugestao}
              className={styles.chipSugestao}
              onClick={() => enviarPerguntaFollowUp(sugestao)}
              disabled={isEnviando}
            >
              {sugestao}
            </button>
          ))}
        </div>
      )}

      {/* Lista de mensagens */}
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

        {mensagens.length <= 1 && !iteracaoAtual ? (
          mensagens.map((mensagem) => (
            <ChatMensagem
              key={mensagem.id}
              mensagem={mensagem}
              onPerguntaFollowUp={enviarPerguntaFollowUp}
            />
          ))
        ) : (
          <ChatHistoricoIteracoes
            boasVindas={boasVindas}
            iteracoesAnteriores={iteracoesAnteriores}
            iteracaoAtual={iteracaoAtual}
            isEnviando={isEnviando}
            onPerguntaFollowUp={enviarPerguntaFollowUp}
            onContinuarDaIteracao={continuarDaIteracao}
          />
        )}

        {isEnviando && <ChatLoadingIndicator />}
      </div>

      {erroEnvio && (
        <p className={styles.mensagemErro} role="alert" data-cy="chat-erro">
          {erroEnvio}
        </p>
      )}

      <ChatEntradaMensagem
        ref={entradaRef}
        valor={textoEntrada}
        isEnviando={isEnviando}
        onChange={setTextoEntrada}
        onEnviar={() => void enviarMensagem()}
      />
    </div>
  );
};
