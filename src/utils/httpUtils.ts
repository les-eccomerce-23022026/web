interface FetchOptionsParams {
  params?: Record<string, string>;
}

export interface FetchOptions extends RequestInit, FetchOptionsParams {}

type ApiErrorBody = {
  mensagem?: string;
  erro?: string;
};

export function buildUrl(endpoint: string, params?: Record<string, string>): string {
  if (!params) return endpoint;
  const query = new URLSearchParams(params).toString();
  return `${endpoint}?${query}`;
}

async function parseErrorMessageFromJson(response: Response): Promise<string> {
  const errorData = (await response.json().catch(() => ({}))) as ApiErrorBody;
  return errorData.mensagem || errorData.erro || `Erro na requisição: ${response.status}`;
}

function unwrapEnvelope<T>(resposta: unknown): T {
  if (
    resposta &&
    typeof resposta === 'object' &&
    'sucesso' in resposta &&
    'dados' in resposta &&
    (resposta as { sucesso: boolean }).sucesso === true
  ) {
    return (resposta as { dados: T }).dados;
  }
  return resposta as T;
}

async function parseJsonBody<T>(response: Response): Promise<T> {
  if (response.status === 204) {
    return {} as T;
  }
  const resposta = await response.json();
  return unwrapEnvelope<T>(resposta);
}

async function responseToResult<T>(url: string, response: Response): Promise<T> {
  if (response.status === 401) {
    const { handleUnauthorized } = await import('./authHandlers');
    return handleUnauthorized<T>(url, response);
  }
  if (response.status === 403) {
    throw new Error('Você não tem permissão para acessar este recurso.');
  }
  if (!response.ok) {
    const msg = await parseErrorMessageFromJson(response);
    const errorBody = await response.json().catch(() => ({ erro: msg }));
    console.error(`[API Error] Status: ${response.status}, URL: ${url}, Body:`, errorBody);
    throw new Error(msg);
  }
  return parseJsonBody<T>(response);
}

function rethrowNetworkError(error: unknown): never {
  console.error('[API Error]:', error);
  const err = error as Error;
  if (err?.message === 'Failed to fetch') {
    throw new Error(
      'Não foi possível conectar ao servidor. Verifique se o backend está rodando e tente novamente.',
    );
  }
  throw error;
}

export { parseJsonBody, responseToResult, rethrowNetworkError, unwrapEnvelope, parseErrorMessageFromJson };
