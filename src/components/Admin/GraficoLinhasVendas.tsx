import { useMemo } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import type { RespostaAnaliseVendas } from '../../services/contracts/analiseVendasService';
import styles from './GraficoLinhasVendas.module.css';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface GraficoLinhasVendasProps {
  dados: RespostaAnaliseVendas | null;
}

// Função para formatar data de ISO para formato legível
function formatarData(dataISO: string): string {
  const data = new Date(dataISO);
  const mes = data.toLocaleString('pt-BR', { month: 'short' });
  const ano = data.getFullYear();
  return `${mes}/${ano}`;
}

export function GraficoLinhasVendas({ dados }: GraficoLinhasVendasProps) {
  const mesesUnicos = useMemo(() => {
    if (!dados || dados.dados.length === 0) {
      return [];
    }
    return Array.from(new Set(dados.dados.map(d => d.mes))).sort();
  }, [dados]);

  const chartData = useMemo(() => {
    if (!dados || dados.dados.length === 0) {
      return null;
    }

    const categoriasUnicas = Array.from(new Set(dados.dados.map(d => d.categoria)));

    const cores = [
      'rgba(59, 130, 246, 1)',
      'rgba(16, 185, 129, 1)',
      'rgba(245, 158, 11, 1)',
      'rgba(239, 68, 68, 1)',
      'rgba(139, 92, 246, 1)',
      'rgba(236, 72, 153, 1)',
      'rgba(20, 184, 166, 1)',
      'rgba(249, 115, 22, 1)',
      'rgba(107, 114, 128, 1)',
      'rgba(99, 102, 241, 1)',
      'rgba(168, 85, 247, 1)',
      'rgba(217, 70, 239, 1)',
      'rgba(234, 88, 12, 1)',
      'rgba(34, 197, 94, 1)',
      'rgba(6, 182, 212, 1)',
    ];

    const datasets = categoriasUnicas.map((categoria, index) => {
      const dadosCategoria = dados.dados.filter(d => d.categoria === categoria);
      const dataPorMes = mesesUnicos.map(mes => {
        const dado = dadosCategoria.find(d => d.mes === mes);
        return dado ? dado.quantidade : 0;
      });

      return {
        label: categoria,
        data: dataPorMes,
        borderColor: cores[index % cores.length],
        backgroundColor: cores[index % cores.length].replace('1)', '0.1)'),
        borderWidth: 3,
        pointRadius: 4,
        pointBackgroundColor: cores[index % cores.length],
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        tension: 0.3,
        fill: false,
      };
    });

    return {
      labels: mesesUnicos.map(formatarData),
      datasets,
    };
  }, [dados, mesesUnicos]);

  const options = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Volume de Vendas por Categoria',
      },
      tooltip: {
        callbacks: {
          title: (context: any) => {
            const dataIndex = context[0]?.dataIndex;
            if (dataIndex !== undefined && mesesUnicos) {
              return formatarData(mesesUnicos[dataIndex]);
            }
            return '';
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Quantidade Vendida',
        },
      },
      x: {
        title: {
          display: true,
          text: 'Período',
        },
        ticks: {
          maxRotation: 45,
          minRotation: 45,
          autoSkip: true,
          maxTicksLimit: 12,
        },
      },
    },
    interaction: {
      mode: 'index' as const,
      intersect: false,
    },
  }), []);

  if (!chartData) {
    return (
      <div className={styles.estadoVazioGrafico}>
        <div className={styles.estadoVazioConteudo}>
          <svg
            className={styles.estadoVazioIcone}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
            />
          </svg>
          <h3>Nenhum dado disponível</h3>
          <p>Selecione as categorias e aplique os filtros para visualizar o gráfico de vendas.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.containerGrafico}>
      <Line data={chartData} options={options} />
    </div>
  );
}
