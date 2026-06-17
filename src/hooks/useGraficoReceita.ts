import { useMemo } from 'react';
import { CHART_COLORS } from '@/constants/chartColors';
import type { ChartData } from 'chart.js';

interface UseGraficoReceitaParams {
  graficoReceitaAnual: ChartData<'line', unknown[], unknown>;
}

export function useGraficoReceita({ graficoReceitaAnual }: UseGraficoReceitaParams) {
  return useMemo(() => ({
    ...graficoReceitaAnual,
    datasets: graficoReceitaAnual.datasets.map(dataset => ({
      ...dataset,
      borderColor: CHART_COLORS.PRIMARY,
      backgroundColor: CHART_COLORS.PRIMARY_ALPHA,
    })),
  }), [graficoReceitaAnual]);
}
