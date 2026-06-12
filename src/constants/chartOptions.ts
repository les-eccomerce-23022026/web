import type { ChartOptions } from 'chart.js';

export const CHART_OPTIONS_RECEITA: ChartOptions<'line'> = {
  responsive: true,
  plugins: {
    legend: { position: 'top' as const },
    title: { display: true, text: 'Evolução da Receita Anual (R$)' },
  },
};

export const CHART_OPTIONS_STATUS: ChartOptions<'bar'> = {
  responsive: true,
  indexAxis: 'y' as const,
  plugins: {
    legend: { display: false },
    title: { display: true, text: 'Status dos Pedidos' },
  },
  scales: {
    x: {
      beginAtZero: true,
    },
  },
};
