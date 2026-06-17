'use client';

import { segmentarConteudoAssistente } from '@/utils/formatarConteudoAssistente';
import styles from './ChatInterface.module.css';

interface MensagemAssistenteConteudoProps {
  conteudo: string;
  classNameTexto?: string;
}

export const MensagemAssistenteConteudo = ({
  conteudo,
  classNameTexto = styles.textoMensagem,
}: MensagemAssistenteConteudoProps) => {
  const segmentos = segmentarConteudoAssistente(conteudo);
  const temTopicos = segmentos.some((s) => s.tipo === 'topico');

  if (!temTopicos) {
    return <p className={classNameTexto}>{conteudo}</p>;
  }

  return (
    <div className={styles.conteudoTopicos} data-cy="chat-mensagem-topicos">
      {segmentos.map((segmento, index) =>
        segmento.tipo === 'texto' ? (
          <p key={`t-${index}`} className={classNameTexto}>
            {segmento.valor}
          </p>
        ) : (
          <ul key={`l-${index}`} className={styles.listaTopicos}>
            {segmento.itens.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        )
      )}
    </div>
  );
};
