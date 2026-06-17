'use client';

import { useState, useCallback, memo } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';
import { Users, UserCheck, Settings, ShieldCheck } from 'lucide-react';
import { AdminKPIs } from '@/components/Admin/AdminKPIs';
import { ChartsCarousel } from '@/components/Admin/ChartsCarousel/ChartsCarousel';
import { FiltroPeriodo, type PeriodoFiltro } from '@/components/Admin/FiltroPeriodo/FiltroPeriodo';
import { useDashboardAdminSistema } from '@/hooks/useDashboardAdminSistema';
import type { StatusClienteFiltro } from '@/services/contracts/dashboardAdminSistemaService';
import type { ItemKPI } from '@/components/Admin/AdminKPIs/types';
import styles from './DashboardAdminSistema.module.css';

// Register Chart.js components
if (typeof ChartJS.register === 'function') {
  try {
    ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend);
  } catch {
    // Ignore if already registered
  }
}

const MemoizedChartsCarousel = memo(ChartsCarousel);

const CHART_OPTIONS_CLIENTES_MES = {
  responsive: true,
  plugins: {
    legend: { display: false },
    title: { display: false },
  },
  scales: {
    y: {
      beginAtZero: true,
      ticks: { stepSize: 5 },
    },
  },
} as const;

const CHART_OPTIONS_DISTRIBUICAO = {
  responsive: true,
  plugins: {
    legend: {
      position: 'bottom' as const,
    },
  },
} as const;

const STATUS_CLIENTE_LABELS: Record<StatusClienteFiltro, string> = {
  todos: 'Todos',
  ativos: 'Ativos',
  inativos: 'Inativos',
};

export function DashboardAdminSistema() {
  const [periodo, setPeriodo] = useState<PeriodoFiltro>('1a');
  const [statusCliente, setStatusCliente] = useState<StatusClienteFiltro>('todos');
  const [carouselIndex, setCarouselIndex] = useState(0);

  const handleIndexChange = useCallback((newIndex: number) => {
    setCarouselIndex(newIndex);
  }, []);

  const { data, isLoading, error } = useDashboardAdminSistema({ periodo, statusCliente });

  if (isLoading && !data) {
    return (
      <div className={styles.loading} data-cy="dashboard-admin-sistema-loading">
        <div className={styles.spinner} />
        <p>Carregando painel administrativo...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.erro} data-cy="dashboard-admin-sistema-erro">
        <p>Erro ao carregar o painel. Tente novamente.</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className={styles.erro} data-cy="dashboard-admin-sistema-vazio">
        <p>Nenhum dado encontrado.</p>
      </div>
    );
  }

  const kpis: ItemKPI[] = [
    {
      id: 'total-clientes',
      label: 'Total de Clientes',
      value: data.metricas.totalClientes,
      icon: Users,
      variant: 'default',
    },
    {
      id: 'clientes-ativos',
      label: 'Clientes Ativos',
      value: data.metricas.clientesAtivos,
      icon: UserCheck,
      variant: 'receita',
    },
    {
      id: 'total-admins',
      label: 'Admins de Loja',
      value: data.metricas.totalAdmins,
      icon: Settings,
      variant: 'default',
    },
    {
      id: 'admins-ativos',
      label: 'Admins Ativos',
      value: data.metricas.adminsAtivos,
      icon: ShieldCheck,
      variant: 'receita',
    },
  ];

  return (
    <div className={styles.dashboardAdminSistema} data-cy="dashboard-admin-sistema">
      {/* Filtro de status dos clientes para os KPIs */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--bn-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Filtrar por:
        </span>
        {(Object.keys(STATUS_CLIENTE_LABELS) as StatusClienteFiltro[]).map((status) => (
          <button
            key={status}
            onClick={() => setStatusCliente(status)}
            data-cy={`filtro-status-${status}`}
            style={{
              padding: '0.35rem 0.85rem',
              borderRadius: '999px',
              border: '1px solid',
              fontSize: '0.8rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s',
              borderColor: statusCliente === status ? 'var(--bn-primary)' : 'var(--bn-border-light)',
              backgroundColor: statusCliente === status ? 'var(--bn-primary)' : 'transparent',
              color: statusCliente === status ? '#fff' : 'var(--bn-text-muted)',
            }}
          >
            {STATUS_CLIENTE_LABELS[status]}
          </button>
        ))}
      </div>

      {/* KPI Cards */}
      <AdminKPIs kpis={kpis} layout="grid" columns={4} enableCarousel={true} />

      {/* Gráficos em Carrossel */}
      <MemoizedChartsCarousel currentIndex={carouselIndex} onIndexChange={handleIndexChange}>
        <div className={styles.painelGrafico} data-cy="grafico-clientes-por-mes">
          <div className={styles.painelGraficoCabecalho}>
            <h3 className={styles.painelGraficoTitulo}>Clientes Cadastrados por Mês</h3>
            <div className={styles.cabecalhoFiltros}>
              <FiltroPeriodo periodoSelecionado={periodo} onChangePeriodo={setPeriodo} />
            </div>
          </div>
          <Bar
            options={CHART_OPTIONS_CLIENTES_MES}
            data={data.graficoClientesPorMes as Parameters<typeof Bar>[0]['data']}
          />
        </div>

        <div className={styles.painelGrafico} data-cy="grafico-distribuicao-clientes">
          <div className={styles.painelGraficoCabecalho}>
            <h3 className={styles.painelGraficoTitulo}>Distribuição: Clientes Ativos vs Inativos</h3>
          </div>
          <Doughnut
            options={CHART_OPTIONS_DISTRIBUICAO}
            data={data.graficoDistribuicaoClientes as Parameters<typeof Doughnut>[0]['data']}
          />
        </div>
      </MemoizedChartsCarousel>
    </div>
  );
}
