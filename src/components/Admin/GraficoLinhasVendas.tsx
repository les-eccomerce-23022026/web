import { useMemo, useState, useCallback, useRef } from 'react';
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
import type { ChartEvent, ActiveElement } from 'chart.js';
import type { IRespostaAnaliseVendas } from '../../services/contracts/analiseVendasService';
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

interface IGraficoLinhasVendasProps {
  dados: IRespostaAnaliseVendas | null;
}

function formatarData(dataISO: string): string {
  const data = new Date(dataISO);
  const mes = data.toLocaleString('pt-BR', { month: 'short' });
  const ano = data.getFullYear();
  return `${mes}/${ano}`;
}

const CORES = [
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

function dimColor(cor: string): string {
  return cor.replace(/, 1\)$/, ', 0.12)');
}

export function GraficoLinhasVendas({ dados }: IGraficoLinhasVendasProps) {
  const [categoriaAtiva, setCategoriaAtiva] = useState<string | null>(null);
  const chartRef = useRef<ChartJS<'line'> | null>(null);

  const mesesUnicos = useMemo(() => {
    if (!dados || dados.dados.length === 0) return [];
    return Array.from(new Set(dados.dados.map(d => d.mes))).sort();
  }, [dados]);

  const categoriasUnicas = useMemo(() => {
    if (!dados || dados.dados.length === 0) return [];
    return Array.from(new Set(dados.dados.map(d => d.categoria)));
  }, [dados]);

  const chartData = useMemo(() => {
    if (!dados || dados.dados.length === 0) return null;

    const datasets = categoriasUnicas.map((categoria, index) => {
      const cor = CORES[index % CORES.length];
      const ativa = categoriaAtiva === null || categoriaAtiva === categoria;
      const corLinha = ativa ? cor : dimColor(cor);
      const corPonto = ativa ? cor : dimColor(cor);

      return {
        label: categoria,
        data: mesesUnicos.map(mes => {
          const dado = dados.dados.find(d => d.categoria === categoria && d.mes === mes);
          return dado ? dado.quantidade : 0;
        }),
        borderColor: corLinha,
        backgroundColor: ativa ? cor.replace('1)', '0.1)') : dimColor(cor),
        borderWidth: categoriaAtiva === categoria ? 4 : 3,
        pointRadius: categoriaAtiva === categoria ? 6 : 4,
        pointBackgroundColor: corPonto,
        pointBorderColor: ativa ? '#fff' : 'transparent',
        pointBorderWidth: 2,
        tension: 0.3,
        fill: false,
        order: categoriaAtiva === categoria ? 0 : 1,
      };
    });

    return {
      labels: mesesUnicos.map(formatarData),
      datasets,
    };
  }, [dados, mesesUnicos, categoriasUnicas, categoriaAtiva]);

  const handleClick = useCallback(
    (event: ChartEvent, _elements: ActiveElement[], chart: ChartJS) => {
      const nativeEvent = event.native;
      if (!nativeEvent) return;

      // Usa 'nearest' para detectar a linha mais próxima do clique
      const nearest = chart.getElementsAtEventForMode(
        nativeEvent as Event,
        'nearest',
        { intersect: false },
        false,
      );

      if (nearest.length === 0) {
        setCategoriaAtiva(null);
        return;
      }

      const label = chart.data.datasets[nearest[0].datasetIndex]?.label as string;
      if (!label) return;
      setCategoriaAtiva(prev => (prev === label ? null : label));
    },
    [],
  );

  const options = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'top' as const,
          labels: {
            usePointStyle: true,
            padding: 16,
          },
          onClick: (_e: ChartEvent, legendItem: { text?: string }) => {
            const label = legendItem.text;
            if (!label) return;
            setCategoriaAtiva(prev => (prev === label ? null : label));
          },
        },
        title: {
          display: true,
          text: 'Volume de Vendas por Categoria',
        },
        tooltip: {
          callbacks: {
            title: (context: { dataIndex?: number }[]) => {
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
          title: { display: true, text: 'Quantidade Vendida' },
        },
        x: {
          title: { display: true, text: 'Período' },
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
      onClick: handleClick,
      onHover: (_event: ChartEvent, elements: ActiveElement[], chart: ChartJS) => {
        const canvas = chart.canvas;
        canvas.style.cursor = elements.length > 0 ? 'pointer' : 'default';
      },
    }),
    [mesesUnicos, handleClick],
  );

  if (!chartData) {
    return (
      <div className={styles.estadoVazioGrafico}>
        <div className={styles.estadoVazioConteudo}>
          <svg className={styles.estadoVazioIcone} fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
    <div className={styles.wrapperGrafico}>
      {categoriaAtiva && (
        <div className={styles.badgeFiltroAtivo}>
          <span className={styles.badgeTexto}>
            Filtrando: <strong>{categoriaAtiva}</strong>
          </span>
          <button
            className={styles.badgeLimpar}
            onClick={() => setCategoriaAtiva(null)}
            aria-label="Remover filtro de categoria"
          >
            ×
          </button>
        </div>
      )}
      <div className={styles.containerGrafico}>
        <Line ref={chartRef} data={chartData} options={options} />
      </div>
      {!categoriaAtiva && (
        <p className={styles.dicaClique}>Clique em uma linha para filtrar por categoria</p>
      )}
    </div>
  );
}
