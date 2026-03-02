import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import type { IAdmin } from '@/interfaces/IAdmin';
import { AuthService } from '@/services/AuthService';

interface AdminState {
  admins: IAdmin[];
  isLoading: boolean;
  error: string | null;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
}

const initialState: AdminState = {
  admins: [],
  isLoading: false,
  error: null,
  status: 'idle',
};

// Thunk para carregar admins via Service (Abstração)
export const fetchAdmins = createAsyncThunk('admin/fetchAdmins', async () => {
  const response = await AuthService.getAdmins();
  return response;
});

const adminSlice = createSlice({
  name: 'admin',
  initialState,
  reducers: {
    setAdmins: (state, action: PayloadAction<IAdmin[]>) => {
      state.admins = action.payload;
    },
    addAdmin: (state, action: PayloadAction<IAdmin>) => {
      state.admins.push(action.payload);
    },
    updateAdmin: (state, action: PayloadAction<IAdmin>) => {
      const index = state.admins.findIndex((a) => a.uuid === action.payload.uuid);
      if (index !== -1) {
        state.admins[index] = action.payload;
      }
    },
    deleteAdmin: (state, action: PayloadAction<string>) => {
      state.admins = state.admins.filter((a) => a.uuid !== action.payload);
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAdmins.pending, (state) => {
        state.status = 'loading';
        state.isLoading = true;
      })
      .addCase(fetchAdmins.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.isLoading = false;
        state.admins = action.payload;
      })
      .addCase(fetchAdmins.rejected, (state, action) => {
        state.status = 'failed';
        state.isLoading = false;
        state.error = action.error.message || 'Erro ao carregar administradores';
      });
  },
});

export const {
  setAdmins,
  addAdmin,
  updateAdmin,
  deleteAdmin,
  setLoading,
  setError,
} = adminSlice.actions;

export default adminSlice.reducer;
