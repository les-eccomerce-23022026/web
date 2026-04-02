/**
 * Factory de LivroService.
 *
 * Seleciona automaticamente a implementação correta:
 * - VITE_USE_MOCK=true  → LivroServiceMock  (dados JSON locais, sem HTTP)
 * - VITE_USE_MOCK=false → LivroServiceApi   (chamadas ao backend real)
 */
import { USE_MOCK } from '@/config/apiConfig';
import { LivroServiceMock } from '@/services/mock/livroServiceMock';
import { LivroServiceApi } from '@/services/api/livroServiceApi';
import type { ILivroService } from '@/services/contracts/livroService';

export const LivroService: ILivroService = USE_MOCK
  ? new LivroServiceMock()
  : new LivroServiceApi();

export type { ILivroService };
