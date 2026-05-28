import { useState, useCallback, useRef, useEffect } from 'react';
import { IaRecomendacaoService } from '@/services/iaRecomendacaoService';
import type {
  IMensagemChat,
  RemetenteMensagem,
  IHistoricoMensagem,
  IProdutoRecomendado,
} from '@/interfaces/iaRecomendacao';

const CONTEUDO_BOAS_VINDAS =
  'Olá! Sou o assistente de recomendação da livraria. Conte-me seus gostos literários e encontrarei os livros perfeitos para você!';

function criarMensagemBoasVindas(): IMensagemChat {
  return { id: 'boas-vindas', conteudo: CONTEUDO_BOAS_VINDAS, remetente: 'assistente', timestamp: new Date() };
}

function gerarIdMensagem(): string {
  return `msg-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function criarMensagem(
  conteudo: string,
  remetente: RemetenteMensagem,
  produtosRecomendados?: IProdutoRecomendado[],
  contextoUsado?: boolean
): IMensagemChat {
  return {
    id: gerarIdMensagem(),
    conteudo,
    remetente,
    timestamp: new Date(),
    produtosRecomendados,
    contextoUsado,
  };
}

function construirHistorico(mensagens: IMensagemChat[]): IHistoricoMensagem[] {
  return mensagens
    .filter((m) => m.id !== 'boas-vindas')
    .map(({ remetente, conteudo }) => ({ remetente, conteudo }));
}

export function useChatRecomendacao() {
  const [mensagens, setMensagens] = useState<IMensagemChat[]>(() => [criarMensagemBoasVindas()]);
  const [textoEntrada, setTextoEntrada] = useState('');
  const [isEnviando, setIsEnviando] = useState(false);
  const [erroEnvio, setErroEnvio] = useState<string | null>(null);
  const [servicoIndisponivel, setServicoIndisponivel] = useState(false);
  const listaRef = useRef<HTMLDivElement>(null);

  // Verificar saúde do serviço ao montar
  useEffect(() => {
    const verificarSaude = async () => {
      try {
        await IaRecomendacaoService.verificarSaude();
        setServicoIndisponivel(false);
      } catch {
        setServicoIndisponivel(true);
      }
    };
    verificarSaude();
  }, []);

  const enviarMensagem = useCallback(async () => {
    const texto = textoEntrada.trim();

    if (!texto || isEnviando) return;

    setTextoEntrada('');
    setErroEnvio(null);
    setIsEnviando(true);

    const mensagemUsuario = criarMensagem(texto, 'usuario');
    setMensagens((prev) => [...prev, mensagemUsuario]);

    try {
      const historico = construirHistorico([...mensagens, mensagemUsuario]);
      const resposta = await IaRecomendacaoService.enviarMensagem({
        mensagem: texto,
        historico,
      });
      setMensagens((prev) => [
        ...prev,
        criarMensagem(
          resposta.resposta,
          'assistente',
          resposta.produtosRecomendados,
          resposta.contextoUsado
        ),
      ]);
    } catch {
      setErroEnvio(
        'Não foi possível obter uma resposta. Verifique sua conexão e tente novamente.',
      );
    } finally {
      setIsEnviando(false);
    }
  }, [textoEntrada, isEnviando, mensagens]);

  const limparConversa = useCallback(() => {
    setMensagens([criarMensagemBoasVindas()]);
    setErroEnvio(null);
    setTextoEntrada('');
  }, []);

  return {
    mensagens,
    textoEntrada,
    isEnviando,
    erroEnvio,
    servicoIndisponivel,
    listaRef,
    setTextoEntrada,
    enviarMensagem,
    limparConversa,
  };
}
