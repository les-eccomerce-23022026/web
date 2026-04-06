import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import { logout } from '@/store/slices/authSlice';
import { LivroService } from '@/services/livroService';
import type { ICategoriaMenu, IFiltroCatalogoLivros } from '@/interfaces/catalogoLivros';
import type { ILivro } from '@/interfaces/livro';

type LoadStatus = 'idle' | 'loading' | 'succeeded' | 'failed';

interface LivroState {
  /** Página atual do catálogo público (GET /livros). */
  livrosDestaque: ILivro[];
  totalCatalogo: number;
  paginaCatalogo: number;
  itensPorPaginaCatalogo: number;
  statusDestaque: LoadStatus;
  errorDestaque: string | null;
  categoriasMenu: ICategoriaMenu[];
  statusCategoriasMenu: LoadStatus;
  errorCategoriasMenu: string | null;
  /** Lista administrativa (GET /admin/livros). */
  livrosAdmin: ILivro[];
  statusAdmin: LoadStatus;
  errorAdmin: string | null;
  termoBusca: string;
}

const initialState: LivroState = {
  livrosDestaque: [],
  totalCatalogo: 0,
  paginaCatalogo: 1,
  itensPorPaginaCatalogo: 10,
  statusDestaque: 'idle',
  errorDestaque: null,
  categoriasMenu: [],
  statusCategoriasMenu: 'idle',
  errorCategoriasMenu: null,
  livrosAdmin: [],
  statusAdmin: 'idle',
  errorAdmin: null,
  termoBusca: '',
};

/** Catálogo (GET /livros) com paginação e filtros. */
export const fetchLivros = createAsyncThunk('livro/fetchLivros', async (filtro?: IFiltroCatalogoLivros) => {
  return LivroService.getCatalogo({
    pagina: filtro?.pagina ?? 1,
    itensPorPagina: filtro?.itensPorPagina ?? 10,
    categoria: filtro?.categoria,
    ordenacao: filtro?.ordenacao ?? 'recentes',
  });
});

/** Categorias com livros no catálogo (GET /categorias/catalogo). */
export const fetchCategoriasCatalogo = createAsyncThunk(
  'livro/fetchCategoriasCatalogo',
  async () => LivroService.getCategoriasMenu(),
);

/** Lista administrativa (GET /admin/livros). */
export const fetchLivrosAdmin = createAsyncThunk('livro/fetchLivrosAdmin', async () => {
  return LivroService.getListaAdmin();
});

const livroSlice = createSlice({
  name: 'livro',
  initialState,
  reducers: {
    adicionarLivro: (state, action: PayloadAction<ILivro>) => {
      state.livrosAdmin.push(action.payload);
    },
    atualizarLivro: (state, action: PayloadAction<ILivro>) => {
      const index = state.livrosAdmin.findIndex((l) => l.uuid === action.payload.uuid);
      if (index !== -1) {
        state.livrosAdmin[index] = action.payload;
      }
      const ixD = state.livrosDestaque.findIndex((l) => l.uuid === action.payload.uuid);
      if (ixD !== -1) {
        state.livrosDestaque[ixD] = action.payload;
      }
    },
    removerLivro: (state, action: PayloadAction<string>) => {
      state.livrosAdmin = state.livrosAdmin.filter((l) => l.uuid !== action.payload);
      state.livrosDestaque = state.livrosDestaque.filter((l) => l.uuid !== action.payload);
    },
    alternarStatusLivro: (
      state,
      action: PayloadAction<{ uuid: string; justificativa: string; categoriaInativacao?: string }>,
    ) => {
      const livro =
        state.livrosAdmin.find((l) => l.uuid === action.payload.uuid) ||
        state.livrosDestaque.find((l) => l.uuid === action.payload.uuid);
      if (livro) {
        livro.status = livro.status === 'Ativo' ? 'Inativo' : 'Ativo';
      }
    },
    setTermoBusca: (state, action: PayloadAction<string>) => {
      state.termoBusca = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchLivros.pending, (state) => {
        state.statusDestaque = 'loading';
      })
      .addCase(fetchLivros.fulfilled, (state, action) => {
        state.statusDestaque = 'succeeded';
        state.livrosDestaque = action.payload.livros;
        state.totalCatalogo = action.payload.total;
        state.paginaCatalogo = action.payload.pagina;
        state.itensPorPaginaCatalogo = action.payload.itensPorPagina;
        state.errorDestaque = null;
      })
      .addCase(fetchLivros.rejected, (state, action) => {
        state.statusDestaque = 'failed';
        state.errorDestaque = action.error.message || 'Erro ao carregar livros';
      })
      .addCase(fetchCategoriasCatalogo.pending, (state) => {
        state.statusCategoriasMenu = 'loading';
      })
      .addCase(fetchCategoriasCatalogo.fulfilled, (state, action) => {
        state.statusCategoriasMenu = 'succeeded';
        state.categoriasMenu = action.payload;
        state.errorCategoriasMenu = null;
      })
      .addCase(fetchCategoriasCatalogo.rejected, (state, action) => {
        state.statusCategoriasMenu = 'failed';
        state.errorCategoriasMenu = action.error.message || 'Erro ao carregar categorias';
      })
      .addCase(fetchLivrosAdmin.pending, (state) => {
        state.statusAdmin = 'loading';
      })
      .addCase(fetchLivrosAdmin.fulfilled, (state, action) => {
        state.statusAdmin = 'succeeded';
        state.livrosAdmin = action.payload;
        state.errorAdmin = null;
      })
      .addCase(fetchLivrosAdmin.rejected, (state, action) => {
        state.statusAdmin = 'failed';
        state.errorAdmin = action.error.message || 'Erro ao carregar livros';
      })
      .addCase(logout, () => ({ ...initialState }));
  },
});

export const { adicionarLivro, atualizarLivro, removerLivro, alternarStatusLivro, setTermoBusca } =
  livroSlice.actions;

export default livroSlice.reducer;
