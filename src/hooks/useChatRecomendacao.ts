import { useState, useCallback, useRef, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { IaRecomendacaoService } from '@/services/iaRecomendacaoService';
import type { RootState } from '@/store';
import {
  agruparMensagensEmIteracoes,
  mensagensAteIteracao,
  obterIteracaoAtual,
  obterIteracoesAnteriores,
} from '@/utils/chatIteracoes';
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
  return `${saudacao} Sou o Assistente da Livraria. Posso ajudar com recomendações personalizadas, status de pedidos e as últimas tendências literárias. Como posso te ajudar hoje?${regiao}`;
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
    intencaoResumida?: string;
    numeroTurno?: number;
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
    intencaoResumida: opcoes?.intencaoResumida,
    numeroTurno: opcoes?.numeroTurno,
  };
}

/** Mapeia mensagens para a API, incluindo livros já exibidos (multi-turno). */
function construirHistorico(mensagens: IMensagemChat[]): IHistoricoMensagem[] {
  return mensagens
    .filter((m) => m.id !== 'boas-vindas')
    .map(({ remetente, conteudo, produtosRecomendados }) => ({
      remetente,
      conteudo,
      produtosMencionados: produtosRecomendados?.map((p) => ({
        uuid: p.uuid,
        titulo: p.titulo,
      })),
    }));
}

export function useChatRecomendacao() {
  const authUser = useSelector((state: RootState) => state.auth.user);
  const enderecosCliente = useSelector((state: RootState) => state.cliente.enderecos);

  // Para administradores, não usa estado do endereço (não tem enderecos de cliente)
  const estadoPerfil =
    authUser?.papeis?.includes('admin') || authUser?.papeis?.includes('admin_sistema')
      ? undefined
      : enderecosCliente.find((e) => e.principal)?.estado ?? enderecosCliente[0]?.estado;

  const [mensagens, setMensagens] = useState<IMensagemChat[]>(() => [
    criarMensagemBoasVindas(authUser?.nome, estadoPerfil),
  ]);
  const [textoEntrada, setTextoEntrada] = useState('');
  const [isEnviando, setIsEnviando] = useState(false);
  const [erroEnvio, setErroEnvio] = useState<string | null>(null);
  const [servicoIndisponivel, setServicoIndisponivel] = useState(false);
  const listaRef = useRef<HTMLDivElement>(null);
  const entradaRef = useRef<HTMLTextAreaElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  /** Aborta a request de stream em andamento (se houver). */
  const cancelar = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    setIsEnviando(false);
  }, []);

  useEffect(() => {
    return () => {
      abortRef.current?.abort();
      abortRef.current = null;
    };
  }, []);

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
      // Mensagem do assistente vazia: o texto é acumulado a cada onDelta.
      const mensagemAssistente = criarMensagem('', 'assistente');
      const idAssistente = mensagemAssistente.id;
      setMensagens((prev) => [...prev, mensagemUsuario, mensagemAssistente]);

      // Aborta um stream anterior e cria um novo controller para esta request.
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;
      const { signal } = controller;

      /** Atualiza a mensagem do assistente em andamento de forma imutável. */
      const atualizarAssistente = (
        patch: (msg: IMensagemChat) => IMensagemChat,
      ): void => {
        setMensagens((prev) =>
          prev.map((m) => (m.id === idAssistente ? patch(m) : m)),
        );
      };

      const historico = construirHistorico([...mensagens, mensagemUsuario]);

      try {
        await IaRecomendacaoService.enviarMensagemStream(
          {
            mensagem: texto,
            historico,
            clienteUuid: authUser?.uuid,
          },
          {
            onMeta: (meta) => {
              atualizarAssistente((m) => ({
                ...m,
                tipoResposta: meta.tipoResposta ?? m.tipoResposta,
                intencaoResumida: meta.intencaoResumida ?? m.intencaoResumida,
                contextoUsado: meta.contextoUsado ?? m.contextoUsado,
                numeroTurno: meta.numeroTurno ?? m.numeroTurno,
              }));
            },
            onProdutos: (produtos) => {
              atualizarAssistente((m) => ({ ...m, produtosRecomendados: produtos }));
            },
            onDelta: (delta) => {
              atualizarAssistente((m) => ({ ...m, conteudo: m.conteudo + delta }));
            },
            onDone: (resposta) => {
              if (signal.aborted) return;
              atualizarAssistente((m) => ({
                ...m,
                conteudo: resposta.resposta || m.conteudo,
                produtosRecomendados: resposta.produtosRecomendados ?? m.produtosRecomendados,
                contextoUsado: resposta.contextoUsado ?? m.contextoUsado,
                tipoResposta: resposta.tipoResposta ?? m.tipoResposta,
                perguntasFollowUp: resposta.perguntasFollowUp ?? m.perguntasFollowUp,
                intencaoResumida: resposta.intencaoResumida ?? m.intencaoResumida,
                numeroTurno: resposta.numeroTurno ?? m.numeroTurno,
              }));
              setIsEnviando(false);
            },
            onError: (mensagemErro) => {
              if (signal.aborted) return;
              setErroEnvio(mensagemErro);
              // Remove a mensagem vazia do assistente em caso de erro.
              setMensagens((prev) => prev.filter((m) => m.id !== idAssistente));
              setIsEnviando(false);
            },
          },
          signal,
        );
      } catch (erro) {
        if (signal.aborted) {
          return;
        }
        console.error('[useChatRecomendacao] Erro ao enviar mensagem:', erro);
        const mensagemErro =
          erro instanceof Error
            ? erro.message
            : 'Não foi possível obter uma resposta. Verifique sua conexão e tente novamente.';
        setErroEnvio(mensagemErro);
        setMensagens((prev) => prev.filter((m) => m.id !== idAssistente));
        setIsEnviando(false);
      } finally {
        if (abortRef.current === controller) {
          abortRef.current = null;
        }
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

  const continuarDaIteracao = useCallback(
    (indiceIteracao: number) => {
      setMensagens((prev) => mensagensAteIteracao(prev, indiceIteracao));
      setErroEnvio(null);
      setTextoEntrada('');
    },
    []
  );

  const chatAgrupado = agruparMensagensEmIteracoes(mensagens);
  const iteracoesAnteriores = obterIteracoesAnteriores(chatAgrupado.iteracoes);
  const iteracaoAtual = obterIteracaoAtual(chatAgrupado.iteracoes);

  return {
    mensagens,
    boasVindas: chatAgrupado.boasVindas,
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
    cancelar,
  };
}
