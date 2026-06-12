/**
 * Status Pedido Utils
 * 
 * Responsabilidade única: Gerenciar mapeamento e normalização de status de pedidos.
 * Segue SRP (Single Responsibility Principle) do SOLID.
 * 
 * Este utilitário centraliza toda a lógica de status, incluindo:
 * - Mapeamento de status para classes CSS
 * - Normalização entre formatos (legível vs snake_case)
 * - Verificações de status (isTroca, isDevolucao, etc.)
 */

import type { StatusPedido } from '@/interfaces/pedido';

/**
 * Mapeamento de status para classes CSS
 * Suporta ambos os formatos: legível (frontend) e snake_case (backend)
 */
export const STATUS_CSS_MAP: Record<string, string> = {
  // Status de troca - formato legível
  'Em Troca': 'statusEmTroca',
  'Troca Autorizada': 'statusTrocaAutorizada',
  'Trocado': 'statusTrocado',
  'Troca Rejeitada': 'statusTrocaRejeitada',
  
  // Status de devolução - formato legível
  'Em Devolução': 'statusEmTroca',
  'Devolução Autorizada': 'statusTrocaAutorizada',
  'Devolvido': 'statusTrocado',
  'Devolução Rejeitada': 'statusTrocaRejeitada',
  
  // Status de troca - formato snake_case (backend)
  'EM_TROCA': 'statusEmTroca',
  'TROCA_AUTORIZADA': 'statusTrocaAutorizada',
  'TROCADO': 'statusTrocado',
  'TROCA_REJEITADA': 'statusTrocaRejeitada',
  
  // Status de devolução - formato snake_case (backend)
  'EM_DEVOLUCAO': 'statusEmTroca',
  'DEVOLUCAO_AUTORIZADA': 'statusTrocaAutorizada',
  'DEVOLVIDO': 'statusTrocado',
  'DEVOLUCAO_REJEITADA': 'statusTrocaRejeitada',
};

/**
 * Mapeamento de normalização: converte qualquer formato para o formato legível padrão
 */
export const STATUS_NORMALIZATION_MAP: Record<string, string> = {
  // Snake_case -> Legível
  'EM_TROCA': 'Em Troca',
  'TROCA_AUTORIZADA': 'Troca Autorizada',
  'TROCADO': 'Trocado',
  'TROCA_REJEITADA': 'Troca Rejeitada',
  'EM_DEVOLUCAO': 'Em Devolução',
  'DEVOLUCAO_AUTORIZADA': 'Devolução Autorizada',
  'DEVOLVIDO': 'Devolvido',
  'DEVOLUCAO_REJEITADA': 'Devolução Rejeitada',
};

/**
 * Conjunto de status que indicam troca em andamento
 */
export const STATUS_TROCA_EM_ANDAMENTO = new Set<string>([
  'Em Troca',
  'EM_TROCA',
]);

/**
 * Conjunto de status que indicam devolução em andamento
 */
export const STATUS_DEVOLUCAO_EM_ANDAMENTO = new Set<string>([
  'Em Devolução',
  'EM_DEVOLUCAO',
]);

/**
 * Conjunto de status que indicam troca autorizada
 */
export const STATUS_TROCA_AUTORIZADA = new Set<string>([
  'Troca Autorizada',
  'TROCA_AUTORIZADA',
]);

/**
 * Conjunto de status que indicam devolução autorizada
 */
export const STATUS_DEVOLUCAO_AUTORIZADA = new Set<string>([
  'Devolução Autorizada',
  'DEVOLUCAO_AUTORIZADA',
]);

/**
 * Conjunto de status que indicam troca/devolução concluída
 */
export const STATUS_CONCLUIDO = new Set<string>([
  'Trocado',
  'TROCADO',
  'Devolvido',
  'DEVOLVIDO',
]);

/**
 * Obtém a classe CSS para um determinado status
 * @param status - Status do pedido
 * @returns Nome da classe CSS ou string vazia se não encontrado
 */
export function getStatusCssClass(status: string): string {
  return STATUS_CSS_MAP[status] || '';
}

/**
 * Normaliza o status para o formato legível padrão
 * @param status - Status em qualquer formato (legível ou snake_case)
 * @returns Status normalizado no formato legível
 */
export function normalizeStatus(status: string): string {
  return STATUS_NORMALIZATION_MAP[status] || status;
}

/**
 * Verifica se o status indica uma troca em andamento
 * @param status - Status do pedido
 * @returns true se o status indica troca em andamento
 */
export function isTrocaEmAndamento(status: string): boolean {
  return STATUS_TROCA_EM_ANDAMENTO.has(status);
}

/**
 * Verifica se o status indica uma devolução em andamento
 * @param status - Status do pedido
 * @returns true se o status indica devolução em andamento
 */
export function isDevolucaoEmAndamento(status: string): boolean {
  return STATUS_DEVOLUCAO_EM_ANDAMENTO.has(status);
}

/**
 * Verifica se o status indica uma troca autorizada
 * @param status - Status do pedido
 * @returns true se o status indica troca autorizada
 */
export function isTrocaAutorizada(status: string): boolean {
  return STATUS_TROCA_AUTORIZADA.has(status);
}

/**
 * Verifica se o status indica uma devolução autorizada
 * @param status - Status do pedido
 * @returns true se o status indica devolução autorizada
 */
export function isDevolucaoAutorizada(status: string): boolean {
  return STATUS_DEVOLUCAO_AUTORIZADA.has(status);
}

/**
 * Verifica se o status indica uma troca ou devolução concluída
 * @param status - Status do pedido
 * @returns true se o status indica conclusão
 */
export function isConcluido(status: string): boolean {
  return STATUS_CONCLUIDO.has(status);
}

/**
 * Verifica se o status é de devolução (qualquer status de devolução)
 * @param status - Status do pedido
 * @returns true se o status é de devolução
 */
export function isDevolucao(status: string): boolean {
  return (
    isDevolucaoEmAndamento(status) ||
    isDevolucaoAutorizada(status) ||
    status === 'Devolvido' ||
    status === 'DEVOLVIDO' ||
    status === 'Devolução Rejeitada' ||
    status === 'DEVOLUCAO_REJEITADA'
  );
}

/**
 * Verifica se o status é de troca (qualquer status de troca)
 * @param status - Status do pedido
 * @returns true se o status é de troca
 */
export function isTroca(status: string): boolean {
  return (
    isTrocaEmAndamento(status) ||
    isTrocaAutorizada(status) ||
    status === 'Trocado' ||
    status === 'TROCADO' ||
    status === 'Troca Rejeitada' ||
    status === 'TROCA_REJEITADA'
  );
}
