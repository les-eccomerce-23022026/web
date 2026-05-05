import type { IResumoPagamentosVenda } from '@/interfaces/pagamento';

export function vendaStatusNorm(s: string): string {
  return s.trim().toUpperCase();
}

export function temPixRecusado(resumo: IResumoPagamentosVenda | null): boolean {
  if (!resumo) return false;
  return resumo.pagamentos.some((p) => p.tipo === 'pix' && p.status === 'recusado');
}

export function formatPixCountdown(expiraMs: number, nowMs: number): string {
  const left = Math.max(0, expiraMs - nowMs);
  const totalSec = Math.floor(left / 1000);
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  if (left <= 0) return 'Expirado';
  return `${m} min ${String(s).padStart(2, '0')} s`;
}

export function isPagamentoFalhou(resumo: IResumoPagamentosVenda | null): boolean {
  if (!resumo) return false;
  const vs = vendaStatusNorm(resumo.vendaStatus);
  return vs === 'REPROVADA' || temPixRecusado(resumo);
}
