/**
 * Factory de IaRecomendacaoService.
 *
 * Seleciona automaticamente a implementação correta:
 * - NEXT_PUBLIC_USE_MOCK=true  → sem mock definido (usa API diretamente)
 * - NEXT_PUBLIC_USE_MOCK=false → IaRecomendacaoServiceApi (chamadas ao backend real)
 */
import { IaRecomendacaoServiceApi } from './api/iaRecomendacaoServiceApi';
import type { IIaRecomendacaoService } from './contracts/iaRecomendacaoService';

export const IaRecomendacaoService: IIaRecomendacaoService = new IaRecomendacaoServiceApi();

export type { IIaRecomendacaoService };
