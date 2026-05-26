/**
 * Função pura para mapear erros técnicos para mensagens seguras ao usuário.
 * Preserva linguagem de negócio enquanto sanitiza detalhes técnicos sensíveis.
 *
 * @param err - Erro desconhecido (Error, string, objeto, null, undefined, etc.)
 * @returns Mensagem de erro amigável e segura em português
 */

function isNetworkError(message: string): boolean {
  return (
    message.includes('failed to fetch') ||
    message.includes('networkerror') ||
    message.includes('network error') ||
    message.includes('fetch failed')
  );
}

function isBusinessMessage(message: string): boolean {
  const lowerMessage = message.toLowerCase();
  return (
    lowerMessage.includes('recusado') ||
    lowerMessage.includes('recusada') ||
    lowerMessage.includes('refused') ||
    lowerMessage.includes('declined') ||
    lowerMessage.includes('inválido') ||
    lowerMessage.includes('inválida') ||
    lowerMessage.includes('obrigatório') ||
    lowerMessage.includes('obrigatória') ||
    lowerMessage.includes('required') ||
    lowerMessage.includes('invalid')
  );
}

function isTechnicalError(message: string): boolean {
  const lowerMessage = message.toLowerCase();
  return (
    lowerMessage.includes('sql') ||
    lowerMessage.includes('select ') ||
    lowerMessage.includes('insert ') ||
    lowerMessage.includes('update ') ||
    lowerMessage.includes('delete ') ||
    lowerMessage.includes('stack trace') ||
    lowerMessage.includes('internal server error') ||
    lowerMessage.includes('500') ||
    lowerMessage.includes('exception')
  );
}

function handleErrorMessage(err: Error): string {
  const message = err.message.toLowerCase();

  if (isNetworkError(message)) {
    return 'Erro de conexão. Verifique sua internet e tente novamente.';
  }

  if (isBusinessMessage(message)) {
    return err.message;
  }

  if (isTechnicalError(message)) {
    return 'Ocorreu um erro ao processar sua solicitação. Tente novamente.';
  }

  return 'Ocorreu um erro ao processar sua solicitação. Tente novamente.';
}

function handleStringError(err: string): string {
  const message = err.toLowerCase();

  if (isBusinessMessage(message)) {
    return err;
  }

  return 'Ocorreu um erro ao processar sua solicitação. Tente novamente.';
}

export function mapearErroUsuario(err: unknown): string {
  if (err instanceof Error) {
    return handleErrorMessage(err);
  }

  if (err === null || err === undefined || err === '') {
    return 'Ocorreu um erro inesperado. Tente novamente.';
  }

  if (typeof err === 'string') {
    return handleStringError(err);
  }

  return 'Ocorreu um erro inesperado. Tente novamente.';
}
