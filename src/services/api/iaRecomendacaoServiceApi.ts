import { ApiClient } from '../apiClient';
import { API_ENDPOINTS } from '@/config/apiConfig';
import type { RootState } from '@/store';
import type { IIaRecomendacaoService } from '../contracts/iaRecomendacaoService';
import type {
  IRequisicaoChat,
  IRespostaChat,
  ICallbacksChatStream,
  IMetaChatStream,
  IProdutosChatStream,
  IDeltaChatStream,
} from '@/interfaces/iaRecomendacao';

interface IEventoSse {
  event: string;
  data: string;
}

export class IaRecomendacaoServiceApi implements IIaRecomendacaoService {
  async enviarMensagem(requisicao: IRequisicaoChat): Promise<IRespostaChat> {
    return ApiClient.post<IRespostaChat>(API_ENDPOINTS.chatRecomendacao, requisicao);
  }

  /**
   * Monta os headers reutilizando a mesma fonte de token do ApiClient
   * (JWT no Redux + cookie HttpOnly via `credentials: 'include'`).
   */
  private async montarHeaders(): Promise<Headers> {
    const headers = new Headers();
    headers.set('Content-Type', 'application/json');
    headers.set('Accept', 'text/event-stream');

    const { store } = await import('@/store');
    const state = store.getState() as RootState;
    const token = state.auth.token;
    if (token && token.split('.').length === 3) {
      headers.set('Authorization', `Bearer ${token}`);
    }

    if (typeof document !== 'undefined') {
      const cookieLojaUuid = document.cookie
        .split('; ')
        .find((linha) => linha.startsWith('x-loja-uuid='))
        ?.split('=')[1];
      if (cookieLojaUuid) {
        headers.set('x-loja-uuid', cookieLojaUuid);
      }
    }

    return headers;
  }

  async enviarMensagemStream(
    requisicao: IRequisicaoChat,
    callbacks: ICallbacksChatStream,
    signal?: AbortSignal
  ): Promise<void> {
    // Fallback imediato quando streaming não está disponível no ambiente.
    if (
      typeof fetch !== 'function' ||
      typeof ReadableStream === 'undefined' ||
      typeof TextDecoder === 'undefined'
    ) {
      await this.executarFallback(requisicao, callbacks, signal);
      return;
    }

    let response: Response;
    try {
      const headers = await this.montarHeaders();
      response = await fetch(API_ENDPOINTS.chatRecomendacao, {
        method: 'POST',
        headers,
        body: JSON.stringify(requisicao),
        credentials: 'include',
        signal,
      });
    } catch (erro: unknown) {
      if (signal?.aborted) return;
      // Falha de rede no fetch → tenta o caminho bloqueante tradicional.
      await this.executarFallback(requisicao, callbacks, signal);
      return;
    }

    if (!response.ok) {
      const mensagem = await this.lerMensagemErro(response);
      callbacks.onError?.(mensagem);
      return;
    }

    const contentType = response.headers.get('Content-Type') ?? '';
    const ehSse = contentType.includes('text/event-stream');

    // Backend respondeu JSON normal (não-SSE) ou sem corpo legível → fallback.
    if (!ehSse || !response.body) {
      try {
        const dados = (await response.json()) as IRespostaChat;
        this.emitirRespostaCompleta(dados, callbacks);
      } catch {
        await this.executarFallback(requisicao, callbacks, signal);
      }
      return;
    }

    await this.consumirStream(response.body, callbacks, signal);
  }

  private async consumirStream(
    body: ReadableStream<Uint8Array>,
    callbacks: ICallbacksChatStream,
    signal?: AbortSignal
  ): Promise<void> {
    const reader = body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    try {
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        // Eventos SSE são separados por linha em branco.
        let separadorIndex = buffer.indexOf('\n\n');
        while (separadorIndex !== -1) {
          const bruto = buffer.slice(0, separadorIndex);
          buffer = buffer.slice(separadorIndex + 2);
          const evento = this.parsearEvento(bruto);
          if (evento) {
            this.despacharEvento(evento, callbacks);
          }
          separadorIndex = buffer.indexOf('\n\n');
        }
      }
    } catch (erro: unknown) {
      if (signal?.aborted) return;
      const mensagem =
        erro instanceof Error ? erro.message : 'Falha ao ler o streaming de resposta.';
      callbacks.onError?.(mensagem);
    } finally {
      reader.releaseLock();
    }
  }

  private parsearEvento(bruto: string): IEventoSse | null {
    const linhas = bruto.split(/\r?\n/);
    let event = 'message';
    const dataPartes: string[] = [];

    for (const linha of linhas) {
      if (linha.startsWith(':')) continue; // comentário/keep-alive
      if (linha.startsWith('event:')) {
        event = linha.slice('event:'.length).trim();
      } else if (linha.startsWith('data:')) {
        dataPartes.push(linha.slice('data:'.length).replace(/^ /, ''));
      }
    }

    if (dataPartes.length === 0) return null;
    return { event, data: dataPartes.join('\n') };
  }

  private despacharEvento(evento: IEventoSse, callbacks: ICallbacksChatStream): void {
    switch (evento.event) {
      case 'meta': {
        const meta = this.parsearJson<IMetaChatStream>(evento.data);
        if (meta) callbacks.onMeta?.(meta);
        break;
      }
      case 'produtos': {
        const payload = this.parsearJson<IProdutosChatStream>(evento.data);
        if (payload) callbacks.onProdutos?.(payload.produtosRecomendados);
        break;
      }
      case 'token': {
        const payload = this.parsearJson<IDeltaChatStream>(evento.data);
        if (payload && typeof payload.delta === 'string') callbacks.onDelta?.(payload.delta);
        break;
      }
      case 'done': {
        const resposta = this.parsearJson<IRespostaChat>(evento.data);
        if (resposta) callbacks.onDone?.(resposta);
        break;
      }
      case 'error': {
        const payload = this.parsearJson<{ message: string }>(evento.data);
        callbacks.onError?.(payload?.message ?? 'Erro no streaming de resposta.');
        break;
      }
      default:
        break;
    }
  }

  private parsearJson<T>(texto: string): T | null {
    try {
      return JSON.parse(texto) as T;
    } catch {
      return null;
    }
  }

  private emitirRespostaCompleta(dados: IRespostaChat, callbacks: ICallbacksChatStream): void {
    callbacks.onMeta?.({
      tipoResposta: dados.tipoResposta,
      intencaoResumida: dados.intencaoResumida,
      contextoUsado: dados.contextoUsado,
      numeroTurno: dados.numeroTurno,
    });
    if (dados.produtosRecomendados) {
      callbacks.onProdutos?.(dados.produtosRecomendados);
    }
    if (dados.resposta) {
      callbacks.onDelta?.(dados.resposta);
    }
    callbacks.onDone?.(dados);
  }

  private async executarFallback(
    requisicao: IRequisicaoChat,
    callbacks: ICallbacksChatStream,
    signal?: AbortSignal
  ): Promise<void> {
    try {
      const dados = await this.enviarMensagem(requisicao);
      if (signal?.aborted) return;
      this.emitirRespostaCompleta(dados, callbacks);
    } catch (erro: unknown) {
      if (signal?.aborted) return;
      const mensagem =
        erro instanceof Error
          ? erro.message
          : 'Não foi possível obter uma resposta. Verifique sua conexão e tente novamente.';
      callbacks.onError?.(mensagem);
    }
  }

  private async lerMensagemErro(response: Response): Promise<string> {
    try {
      const corpo = (await response.json()) as { message?: string };
      if (corpo?.message) return corpo.message;
    } catch {
      // ignora corpo não-JSON
    }
    return `Falha na requisição (HTTP ${response.status}).`;
  }

  async verificarSaude(): Promise<{ status: string; servico: string; timestamp: string }> {
    return ApiClient.get<{ status: string; servico: string; timestamp: string }>(
      API_ENDPOINTS.saudeIA
    );
  }
}
