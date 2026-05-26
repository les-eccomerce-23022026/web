/**
 * Slice de Notificações
 * 
 * Gerencia o estado de notificações do usuário no Redux.
 */

import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import { ApiClient } from '@/services/apiClient';

export interface INotificacao {
  uuid: string;
  usuarioUuid: string;
  vendaUuid?: string;
  tipo: 'RASTREIO' | 'TROCA_AUTORIZADA' | 'TROCA_FINALIZADA' | 'TROCA_REJEITADA';
  titulo: string;
  mensagem: string;
  codigoRastreio?: string;
  lida: boolean;
  criadoEm: string;
  atualizadoEm: string;
}

interface NotificacoesState {
  notificacoes: INotificacao[];
  quantidadeNaoLidas: number;
  carregando: boolean;
  erro: string | null;
}

const estadoInicial: NotificacoesState = {
  notificacoes: [],
  quantidadeNaoLidas: 0,
  carregando: false,
  erro: null,
};

export const buscarNotificacoes = createAsyncThunk(
  'notificacoes/buscarNotificacoes',
  async (apenasNaoLidas: boolean = false) => {
    const params: Record<string, string> = { apenasNaoLidas: apenasNaoLidas.toString() };
    const response = await ApiClient.get<{ notificacoes: INotificacao[] }>('/notificacoes', params);
    return response.notificacoes;
  }
);

export const contarNaoLidas = createAsyncThunk(
  'notificacoes/contarNaoLidas',
  async () => {
    const response = await ApiClient.get<{ quantidade: number }>('/notificacoes/contar-nao-lidas');
    return response.quantidade;
  }
);

export const marcarComoLida = createAsyncThunk(
  'notificacoes/marcarComoLida',
  async (uuid: string) => {
    await ApiClient.put(`/notificacoes/${uuid}/lida`);
    return uuid;
  }
);

export const marcarTodasComoLidas = createAsyncThunk(
  'notificacoes/marcarTodasComoLidas',
  async () => {
    await ApiClient.put('/notificacoes/marcar-todas-lidas');
  }
);

const notificacoesSlice = createSlice({
  name: 'notificacoes',
  initialState: estadoInicial,
  reducers: {
    limparErro: (state) => {
      state.erro = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // buscarNotificacoes
      .addCase(buscarNotificacoes.pending, (state) => {
        state.carregando = true;
        state.erro = null;
      })
      .addCase(buscarNotificacoes.fulfilled, (state, action: PayloadAction<INotificacao[]>) => {
        state.carregando = false;
        state.notificacoes = action.payload;
      })
      .addCase(buscarNotificacoes.rejected, (state, action) => {
        state.carregando = false;
        state.erro = action.error.message || 'Erro ao buscar notificações';
      })
      // contarNaoLidas
      .addCase(contarNaoLidas.fulfilled, (state, action: PayloadAction<number>) => {
        state.quantidadeNaoLidas = action.payload;
      })
      // marcarComoLida
      .addCase(marcarComoLida.fulfilled, (state, action: PayloadAction<string>) => {
        const notificacao = state.notificacoes.find((n) => n.uuid === action.payload);
        if (notificacao) {
          notificacao.lida = true;
        }
        state.quantidadeNaoLidas = Math.max(0, state.quantidadeNaoLidas - 1);
      })
      // marcarTodasComoLidas
      .addCase(marcarTodasComoLidas.fulfilled, (state) => {
        state.notificacoes.forEach((n) => {
          n.lida = true;
        });
        state.quantidadeNaoLidas = 0;
      });
  },
});

export const { limparErro } = notificacoesSlice.actions;
export default notificacoesSlice.reducer;
