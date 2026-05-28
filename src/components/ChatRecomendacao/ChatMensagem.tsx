'use client';

import type { IMensagemChat } from '@/interfaces/iaRecomendacao';
import { ProdutoRecomendadoCard } from './ProdutoRecomendadoCard';
import { ContextoBadge } from './ContextoBadge';
import { SemProdutosMensagem } from './SemProdutosMensagem';
import styles from './ChatInterface.module.css';

interface ChatMensagemProps {
  mensagem: IMensagemChat;
}

export const ChatMensagem = ({ mensagem }: ChatMensagemProps) => {
  const isAssistente = mensagem.remetente === 'assistente';
  const temProdutos = mensagem.produtosRecomendados && mensagem.produtosRecomendados.length > 0;
  const produtosVazios = mensagem.produtosRecomendados && mensagem.produtosRecomendados.length === 0;

  return (
    <div
      className={isAssistente ? styles.bolhaAssistente : styles.bolhaUsuario}
      data-cy={`chat-mensagem-${mensagem.remetente}`}
    >
      <p className={styles.textoMensagem}>{mensagem.conteudo}</p>
      
      {isAssistente && mensagem.contextoUsado && (
        <ContextoBadge contextoUsado={mensagem.contextoUsado} />
      )}
      
      {isAssistente && temProdutos && (
        <div className={styles.produtosContainer}>
          {mensagem.produtosRecomendados?.map((produto) => (
            <ProdutoRecomendadoCard key={produto.uuid} produto={produto} />
          ))}
        </div>
      )}
      
      {isAssistente && produtosVazios && (
        <SemProdutosMensagem mensagem="Não encontramos livros correspondentes ao seu pedido. Tente ser mais específico sobre o gênero ou tema que você procura." />
      )}
    </div>
  );
};
