import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import { LivroService } from '@/services/LivroService';
import type { ILivro } from '@/interfaces/ILivro';

interface LivroState {
  livros: ILivro[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: LivroState = {
  livros: [],
  status: 'idle',
  error: null,
};

// Thunk para carregar os livros inicialmente (integrando com o mock/API)
export const fetchLivros = createAsyncThunk('livro/fetchLivros', async () => {
  const response = await LivroService.getListaAdmin();
  return response;
});

const livroSlice = createSlice({
  name: 'livro',
  initialState,
  reducers: {
    adicionarLivro: (state, action: PayloadAction<ILivro>) => {
      state.livros.push(action.payload);
    },
    atualizarLivro: (state, action: PayloadAction<ILivro>) => {
      const index = state.livros.findIndex((l) => l.uuid === action.payload.uuid);
      if (index !== -1) {
        state.livros[index] = action.payload;
      }
    },
    removerLivro: (state, action: PayloadAction<string>) => {
      state.livros = state.livros.filter((l) => l.uuid !== action.payload);
    },
    alternarStatusLivro: (state, action: PayloadAction<string>) => {
      const livro = state.livros.find((l) => l.uuid === action.payload);
      if (livro) {
        livro.status = livro.status === 'Ativo' ? 'Inativo' : 'Ativo';
      }
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchLivros.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchLivros.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.livros = action.payload;
      })
      .addCase(fetchLivros.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'Erro ao carregar livros';
      });
  },
});

export const { adicionarLivro, atualizarLivro, removerLivro, alternarStatusLivro } = livroSlice.actions;

export default livroSlice.reducer;
