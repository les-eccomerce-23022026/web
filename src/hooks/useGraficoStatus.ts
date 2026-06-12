import { useMemo } from 'react';
import { CHART_COLORS } from '@/constants/chartColors';
import type { ChartData } from 'chart.js';
import type { StatusFiltro } from '@/components/Admin/FiltroStatus/FiltroStatus';

interface UseGraficoStatusParams {
  graficoStatusPedidos: ChartData<'doughnut', number[], unknown>;
  statusFiltro?: StatusFiltro;
}

const STATUS_MAP: Record<StatusFiltro, string> = {
  'todos': 'Todos',
  'entregue': 'Entregues',
  'transito': 'Em Trânsito',
  'preparando': 'Preparando',
  'pendente': 'Pendentes',
  'devolucao': 'Devoluções',
};

export function useGraficoStatus({ graficoStatusPedidos, statusFiltro }: UseGraficoStatusParams) {
  return useMemo(() => {
    const labels = graficoStatusPedidos.labels || [];
    const data = graficoStatusPedidos.datasets[0]?.data || [];
    
    // Mapeamento de labels para índices de cores
    const backgroundColors = [
      CHART_COLORS.STATUS_SUCCESS,
      CHART_COLORS.STATUS_SUCCESS_LIGHT,
      CHART_COLORS.STATUS_WARNING,
      CHART_COLORS.STATUS_ALERT,
      CHART_COLORS.STATUS_ERROR,
    ];

    // Se não houver filtro ou for 'todos', retorna dados completos com cores normais
    if (!statusFiltro || statusFiltro === 'todos') {
      return {
        labels: labels.map((label, index) => {
          const valor = data[index] || 0;
          return `${label} (${valor})`;
        }),
        datasets: [{
          type: 'bar' as const,
          label: 'Status dos Pedidos',
          data,
          backgroundColor: backgroundColors,
        }],
      };
    }

    // Encontra o índice do status selecionado
    const statusLabel = STATUS_MAP[statusFiltro];
    const selectedIndex = labels.findIndex(label => label === statusLabel);

    // Se o status não for encontrado, retorna dados vazios
    if (selectedIndex === -1) {
      return {
        labels: [statusLabel],
        datasets: [{
          type: 'bar' as const,
          label: 'Status dos Pedidos',
          data: [0],
          backgroundColor: [backgroundColors[0]],
        }],
      };
    }

    // Filtra apenas o status selecionado
    const filteredLabels = [labels[selectedIndex]];
    const filteredData = [data[selectedIndex]];
    const filteredColors = [backgroundColors[selectedIndex]];

    return {
      labels: filteredLabels.map((label, index) => {
        const valor = filteredData[index] || 0;
        return `${label} (${valor})`;
      }),
      datasets: [{
        type: 'bar' as const,
        label: 'Status dos Pedidos',
        data: filteredData,
        backgroundColor: filteredColors,
      }],
    };
  }, [graficoStatusPedidos, statusFiltro]);
}
