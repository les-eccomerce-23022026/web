import { useState, useCallback, useRef, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { IaRecomendacaoService } from '@/services/iaRecomendacaoService';
import type { RootState } from '@/store';
import type {
  IMensagemChat,
  RemetenteMensagem,
  IHistoricoMensagem,
  IProdutoRecomendado,
  TipoRespostaChat,
} from '@/interfaces/iaRecomendacao';

function montarBoasVindas(nomeUsuario?: string, estado?: string): string {
  const primeiroNome = nomeUsuario?.trim().split(/\s+/)[0];
  const saudacao = primeiroNome ? `Olá, ${primeiroNome}!` : 'Olá!';
  const regiao =
    estado && estado.length === 2
      ? ` Enviamos para todo o Brasil — se você está em ${estado}, o prazo costuma ser um pouco menor na sua região.`
      : '';
  return `${saudacao} Sou o assistente de recomendação da livraria. Conte-me seus gostos literários e encontrarei os livros perfeitos para você!${regiao}`;
}

function criarMensagemBoasVindas(nomeUsuario?: string, estado?: string): IMensagemChat {
  return {
    id: 'boas-vindas',
    conteudo: montarBoasVindas(nomeUsuario, estado),
    remetente: 'assistente',
    timestamp: new Date(),
  };
}

function gerarIdMensagem(): string {
  return `msg-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function criarMensagem(
  conteudo: string,
  remetente: RemetenteMensagem,
  opcoes?: {
    produtosRecomendados?: IProdutoRecomendado[];
    contextoUsado?: boolean;
    tipoResposta?: TipoRespostaChat;
    perguntasFollowUp?: string[];
  }
): IMensagemChat {
  return {
    id: gerarIdMensagem(),
    conteudo,
    remetente,
    timestamp: new Date(),
    produtosRecomendados: opcoes?.produtosRecomendados,
    contextoUsado: opcoes?.contextoUsado,
    tipoResposta: opcoes?.tipoResposta,
    perguntasFollowUp: opcoes?.perguntasFollowUp,
  };
}

/** Mapeia remetente do frontend para papel esperado pela API */
function construirHistorico(mensagens: IMensagemChat[]): IHistoricoMensagem[] {
  return mensagens
    .filter((m) => m.id !== 'boas-vindas')
    .map(({ remetente, conteudo }) => ({ remetente, conteudo }));
}

export function useChatRecomendacao() {
  const authUser = useSelector((state: RootState) => state.auth.user);
  const enderecosCliente = useSelector((state: RootState) => state.cliente.enderecos);

  const estadoPerfil =
    enderecosCliente.find((e) => e.principal)?.estado ?? enderecosCliente[0]?.estado;

  const [mensagens, setMensagens] = useState<IMensagemChat[]>(() => [
    criarMensagemBoasVindas(authUser?.nome, estadoPerfil),
  ]);
  const [textoEntrada, setTextoEntrada] = useState('');
  const [isEnviando, setIsEnviando] = useState(false);
  const [erroEnvio, setErroEnvio] = useState<string | null>(null);
  const [servicoIndisponivel, setServicoIndisponivel] = useState(false);
  const listaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!authUser?.nome) {
      return;
    }
    setMensagens((prev) => {
      if (prev.length !== 1 || prev[0].id !== 'boas-vindas') {
        return prev;
      }
      return [criarMensagemBoasVindas(authUser.nome, estadoPerfil)];
    });
  }, [authUser?.nome, estadoPerfil]);

  useEffect(() => {
    const verificarSaude = async () => {
      try {
        await IaRecomendacaoService.verificarSaude();
        setServicoIndisponivel(false);
      } catch {
        setServicoIndisponivel(true);
      }
    };
    void verificarSaude();
  }, []);

  const enviarMensagem = useCallback(
    async (textoOverride?: string) => {
      const texto = (textoOverride ?? textoEntrada).trim();

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
          clienteUuid: authUser?.uuid,
        });
        setMensagens((prev) => [
          ...prev,
          criarMensagem(resposta.resposta, 'assistente', {
            produtosRecomendados: resposta.produtosRecomendados,
            contextoUsado: resposta.contextoUsado,
            tipoResposta: resposta.tipoResposta,
            perguntasFollowUp: resposta.perguntasFollowUp,
          }),
        ]);
      } catch {
        setErroEnvio(
          'Não foi possível obter uma resposta. Verifique sua conexão e tente novamente.',
        );
      } finally {
        setIsEnviando(false);
      }
    },
    [textoEntrada, isEnviando, mensagens, authUser?.uuid],
  );

  const enviarPerguntaFollowUp = useCallback(
    (pergunta: string) => {
      void enviarMensagem(pergunta);
    },
    [enviarMensagem],
  );

  const limparConversa = useCallback(() => {
    setMensagens([criarMensagemBoasVindas(authUser?.nome, estadoPerfil)]);
    setErroEnvio(null);
    setTextoEntrada('');
  }, [authUser?.nome, estadoPerfil]);

  return {
    mensagens,
    textoEntrada,
    isEnviando,
    erroEnvio,
    servicoIndisponivel,
    listaRef,
    setTextoEntrada,
    enviarMensagem,
    enviarPerguntaFollowUp,
    limparConversa,
  };
}
