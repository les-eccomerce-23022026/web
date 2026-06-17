import type { IMensagemChat } from '@/interfaces/iaRecomendacao';

/** Máximo de iterações anteriores exibidas em dropdown (fora a atual). */
export const LIMITE_ITERACOES_DROPDOWN = 3;

export interface IIteracaoChat {
  indice: number;
  perguntaUsuario: IMensagemChat;
  respostaAssistente?: IMensagemChat;
}

export interface IChatAgrupadoPorIteracao {
  boasVindas?: IMensagemChat;
  iteracoes: IIteracaoChat[];
}

function truncarTexto(texto: string, max = 52): string {
  const limpo = texto.trim().replace(/\s+/g, ' ');
  if (limpo.length <= max) return limpo;
  return `${limpo.slice(0, max - 1)}…`;
}

/** Agrupa mensagens em turnos (pergunta + resposta), ignorando boas-vindas. */
export function agruparMensagensEmIteracoes(mensagens: IMensagemChat[]): IChatAgrupadoPorIteracao {
  const boasVindas = mensagens.find((m) => m.id === 'boas-vindas');
  const conversa = mensagens.filter((m) => m.id !== 'boas-vindas');

  const iteracoes: IIteracaoChat[] = [];
  let indice = 0;

  for (let i = 0; i < conversa.length; i++) {
    const msg = conversa[i];
    if (msg.remetente !== 'usuario') continue;

    indice += 1;
    const proxima = conversa[i + 1];
    const respostaAssistente =
      proxima?.remetente === 'assistente' ? proxima : undefined;

    iteracoes.push({
      indice,
      perguntaUsuario: msg,
      respostaAssistente,
    });

    if (respostaAssistente) {
      i += 1;
    }
  }

  return { boasVindas, iteracoes };
}

/** Retorna até 3 iterações anteriores à atual (exclui a última). */
export function obterIteracoesAnteriores(
  iteracoes: IIteracaoChat[],
  limite = LIMITE_ITERACOES_DROPDOWN
): IIteracaoChat[] {
  if (iteracoes.length <= 1) return [];
  return iteracoes.slice(0, -1).slice(-limite);
}

export function obterIteracaoAtual(iteracoes: IIteracaoChat[]): IIteracaoChat | undefined {
  return iteracoes.at(-1);
}

/** Rótulo do dropdown — intenção resumida (backend) ou pergunta truncada em português. */
export function rotuloIteracao(iteracao: IIteracaoChat): string {
  const intencao = iteracao.respostaAssistente?.intencaoResumida?.trim();
  const pergunta = iteracao.perguntaUsuario.conteudo;
  
  if (intencao) {
    return traduzirIntencao(intencao);
  }
  
  return truncarTexto(pergunta);
}

/** Traduz intenções do backend para português com contexto. */
function traduzirIntencao(intencao: string): string {
  const mapaTraducoes: Record<string, string> = {
    'recomendacao': 'Recomendação de livros',
    'status_pedido': 'Status do pedido',
    'mais_vendidos': 'Livros mais vendidos',
    'categoria': 'Busca por categoria',
    'autor': 'Busca por autor',
    'titulo': 'Busca por título',
  };
  
  // Intentions compostas (ex: "recomendacao · ficcao_cientifica")
  if (intencao.includes(' · ')) {
    return intencao
      .split(' · ')
      .map((parte) => mapaTraducoes[parte] || formatarCategoria(parte))
      .join(' • ');
  }
  
  return mapaTraducoes[intencao] || formatarCategoria(intencao);
}

/** Formata nomes de categorias para português. */
function formatarCategoria(texto: string): string {
  return texto
    .split('_')
    .map((palavra) => palavra.charAt(0).toUpperCase() + palavra.slice(1).toLowerCase())
    .join(' ');
}

/** Mensagens até o fim da iteração escolhida (inclusive), preservando boas-vindas. */
export function mensagensAteIteracao(
  mensagens: IMensagemChat[],
  indiceIteracao: number
): IMensagemChat[] {
  const { boasVindas, iteracoes } = agruparMensagensEmIteracoes(mensagens);
  const alvo = iteracoes.find((it) => it.indice === indiceIteracao);
  if (!alvo) return mensagens;

  const resultado: IMensagemChat[] = [];
  if (boasVindas) resultado.push(boasVindas);

  for (const it of iteracoes) {
    resultado.push(it.perguntaUsuario);
    if (it.respostaAssistente) resultado.push(it.respostaAssistente);
    if (it.indice === indiceIteracao) break;
  }

  return resultado;
}
