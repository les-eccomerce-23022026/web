export type SegmentoMensagemAssistente =
  | { tipo: 'texto'; valor: string }
  | { tipo: 'topico'; itens: string[] };

const REGEX_TOPICO = /^[\s]*(?:[•\-*]|\d+\.)\s+(.+)$/;

/**
 * Divide o texto do assistente em parágrafos e listas de tópicos (•, -, * ou 1.).
 */
export function segmentarConteudoAssistente(conteudo: string): SegmentoMensagemAssistente[] {
  const segmentos: SegmentoMensagemAssistente[] = [];
  const linhas = conteudo.split('\n');
  let bufferTexto: string[] = [];
  let bufferTopicos: string[] = [];

  const flushTexto = () => {
    const texto = bufferTexto.join('\n').trim();
    if (texto) {
      segmentos.push({ tipo: 'texto', valor: texto });
    }
    bufferTexto = [];
  };

  const flushTopicos = () => {
    if (bufferTopicos.length > 0) {
      segmentos.push({ tipo: 'topico', itens: [...bufferTopicos] });
      bufferTopicos = [];
    }
  };

  for (const linha of linhas) {
    const matchTopico = linha.match(REGEX_TOPICO);
    if (matchTopico) {
      flushTexto();
      bufferTopicos.push(matchTopico[1].trim());
      continue;
    }

    if (linha.trim() === '') {
      flushTexto();
      flushTopicos();
      continue;
    }

    flushTopicos();
    bufferTexto.push(linha);
  }

  flushTexto();
  flushTopicos();

  if (segmentos.length === 0 && conteudo.trim()) {
    segmentos.push({ tipo: 'texto', valor: conteudo.trim() });
  }

  return segmentos;
}
