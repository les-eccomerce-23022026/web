import { BASE_URL, API_ENDPOINTS } from '@/config/apiConfig';

/**
 * Hook customizado para fornecer as configurações e rotas da API.
 * Retorna a BASE_URL e o objeto de endpoints configurados.
 */
export const useApi = () => {
  return { BASE_URL, API_ENDPOINTS };
};
