'use client';

/**
 * Dashboard Admin page - Client Component with Redux
 * Migrated from src/pages-react-router/PainelAdmin/DashboardAdmin/DashboardAdmin.tsx
 */

import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, ArcElement, Filler } from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';
import '@/pages-react-router/PainelAdmin/DashboardAdmin/DashboardAdmin.css';
import { useEffect, useState, useRef, useCallback, memo } from 'react';
import { useDashboardAdmin } from '@/hooks/useDashboardAdmin';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchLivrosAdmin } from '@/store/slices/livroSlice';
import { AdminKPIs } from '@/components/Admin/AdminKPIs';
import { ChartsCarousel } from '@/components/Admin/ChartsCarousel/ChartsCarousel';
import { GraficoAnaliseVendasDashboard } from '@/components/Admin/GraficoAnaliseVendasDashboard/GraficoAnaliseVendasDashboard';
import { DashboardAdminSistema } from '@/components/Admin/DashboardAdminSistema/DashboardAdminSistema';

// Memoiza o carrossel para evitar rerenders quando apenas os filtros mudam
const MemoizedChartsCarousel = memo(ChartsCarousel);
import { FiltroPeriodo, type PeriodoFiltro } from '@/components/Admin/FiltroPeriodo/FiltroPeriodo';
import { FiltroStatus, type StatusFiltro } from '@/components/Admin/FiltroStatus/FiltroStatus';
import { useGraficoReceita } from '@/hooks/useGraficoReceita';
import { useGraficoStatus } from '@/hooks/useGraficoStatus';
import { useDashboardKPIs } from '@/hooks/useDashboardKPIs';
import { CHART_OPTIONS_RECEITA, CHART_OPTIONS_STATUS } from '@/constants/chartOptions';

// Register Chart.js components at module level (runs once)
if (typeof ChartJS.register === 'function') {
  try {
    ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, ArcElement, Filler);
  } catch (e) {
    // Ignore if already registered
  }
}

/**
 * Dashboard do admin de loja (vendas, pedidos, estoque).
 * Extraído como componente separado para não violar Rules of Hooks.
 */
function DashboardAdminLoja() {
  const dispatch = useAppDispatch();
  const [periodoReceita, setPeriodoReceita] = useState<PeriodoFiltro>('1a');
  const [statusSelecionado, setStatusSelecionado] = useState<StatusFiltro>('todos');
  const carouselIndexRef = useRef(0);
  const [carouselIndex, setCarouselIndex] = useState(0);

  const handleIndexChange = useCallback((newIndex: number) => {
    carouselIndexRef.current = newIndex;
    setCarouselIndex(newIndex);
  }, []);

  const { data, isLoading, isFetching, error } = useDashboardAdmin({
    periodoReceita,
    statusFiltro: statusSelecionado,
  });

  useEffect(() => {
    void dispatch(fetchLivrosAdmin());
  }, [dispatch]);

  // Hooks must be called before early returns (Rules of Hooks)
  const graficoReceitaComCores = useGraficoReceita({
    graficoReceitaAnual: data?.graficoReceitaAnual || { labels: [], datasets: [] },
  });
  const graficoStatusComCores = useGraficoStatus({
    graficoStatusPedidos: data?.graficoStatusPedidos || { labels: [], datasets: [] },
    statusFiltro: statusSelecionado,
  });
  const kpis = useDashboardKPIs({
    totalVendasMes: data?.metricas.totalVendasMes ?? 0,
    percentualCrescimento: data?.metricas.percentualCrescimento ?? 0,
    ticketMedio: data?.metricas.ticketMedio ?? 0,
    livrosBaixoEstoque: data?.metricas.livrosBaixoEstoque ?? 0,
  });

  if (isLoading && !data) return <div className="admin-loading"><div className="spinner"></div><p>Carregando métricas corporativas...</p></div>;
  if (error) return <div className="admin-loading"><p>Erro ao carregar dashboard admin.</p></div>;
  if (!data) return <div className="admin-loading">Nenhum dado encontrado no dashboard admin.</div>;

  return (
    <div className="dashboard-content">
      {/* Métricas Principais (KPIS) */}
      <AdminKPIs kpis={kpis} layout="grid" columns={4} enableCarousel={true} />

      {/* Gráficos em Carrossel */}
      <MemoizedChartsCarousel currentIndex={carouselIndex} onIndexChange={handleIndexChange}>
        <div className="painel-grafico">
          <div className="painel-grafico__cabecalho">
            <h3 className="painel-grafico__titulo">Evolução da Receita Anual</h3>
            <FiltroPeriodo periodoSelecionado={periodoReceita} onChangePeriodo={setPeriodoReceita} />
          </div>
          <Line options={CHART_OPTIONS_RECEITA} data={graficoReceitaComCores} />
        </div>
        <div className="painel-grafico painel-grafico--compacto">
          <div className="painel-grafico__cabecalho">
            <h3 className="painel-grafico__titulo">
              Status dos Pedidos
              {isFetching && <span className="grafico-loading-badge">atualizando...</span>}
            </h3>
            <FiltroStatus statusSelecionado={statusSelecionado} onChangeStatus={setStatusSelecionado} />
          </div>
          <Bar options={CHART_OPTIONS_STATUS} data={graficoStatusComCores} />
        </div>
        <GraficoAnaliseVendasDashboard />
      </MemoizedChartsCarousel>

      {/* Atividades Recentes */}
      <div className="card activity-card mt-20">
        <h4>Últimas Atividades</h4>
        <ul className="activity-list">
          {data.atividadesRecentes.map((atividade) => (
            <li key={atividade.uuid} className="activity-item">
              <span className={`activity-icon ${atividade.sucesso ? 'sucesso' : 'alerta'}`}></span>
              <div className="activity-content">
                <p className="activity-desc"><strong>{atividade.tipo}</strong>: {atividade.descricao}</p>
                <span className="activity-time">{atividade.data}</span>
              </div>
            </li>
          ))}
        </ul>
        <button className="btn-link-admin">Ver todas as atividades →</button>
      </div>
    </div>
  );
}

export default function DashboardAdminPage() {
  const user = useAppSelector((state) => state.auth.user);

  if (user?.role === 'admin_sistema') {
    return <DashboardAdminSistema />;
  }

  return <DashboardAdminLoja />;
}
