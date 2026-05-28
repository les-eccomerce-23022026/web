import type { LucideIcon } from 'lucide-react';

/**
 * Variantes de KPI para diferentes contextos de negócio
 */
export type VarianteKPI = 'default' | 'receita' | 'estoque' | 'critico';

/**
 * Tipo de layout para exibição dos KPIs
 */
export type LayoutKPI = 'grid' | 'flex';

/**
 * Interface para dados de tendência (crescimento/decrescimento)
 */
export interface TendenciaKPI {
  valor: number;
  label?: string;
}

/**
 * Interface para um item de KPI individual
 */
export interface ItemKPI {
  id: string;
  label: string;
  value: string | number;
  icon: LucideIcon;
  trend?: TendenciaKPI;
  color?: string;
  variant?: VarianteKPI;
}

/**
 * Props do componente AdminKPIs
 */
export interface AdminKPIsProps {
  kpis: ItemKPI[];
  layout?: LayoutKPI;
  columns?: number;
  enableCarousel?: boolean;
}
