'use client';

/**
 * Dashboard Admin page - Client Component with Redux
 * Migrated from src/pages-react-router/PainelAdmin/DashboardAdmin/DashboardAdmin.tsx
 */

import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, ArcElement, Filler } from 'chart.js';
import { Line, Doughnut } from 'react-chartjs-2';
import { DollarSign, Percent, Users, Package, AlertTriangle, BookOpen, ShieldCheck } from 'lucide-react';
import '@/pages-react-router/PainelAdmin/DashboardAdmin/DashboardAdmin.css';
import type { ChartData } from 'chart.js';
import { useEffect } from 'react';
import { useDashboardAdmin } from '@/hooks/useDashboardAdmin';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchLivrosAdmin } from '@/store/slices/livroSlice';
import { AdminKPIs } from '@/components/Admin/AdminKPIs';
import type { ItemKPI } from '@/components/Admin/AdminKPIs/types';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, ArcElement, Filler);

export default function DashboardAdminPage() {
  const dispatch = useAppDispatch();
  const optionsReceita = { responsive: true, plugins: { legend: { position: 'top' as const }, title: { display: true, text: 'Receita Anual Crescente (R$)' } } };
  const optionsStatus = { responsive: true, plugins: { legend: { position: 'right' as const }, title: { display: true, text: 'Status dos Pedidos' } } };
  const optionsCategoria = { responsive: true, plugins: { legend: { position: 'top' as const }, title: { display: true, text: 'Vendas por Categoria (Jan-Mar)' } } };

  const { data, loading, error } = useDashboardAdmin();

  useEffect(() => {
    void dispatch(fetchLivrosAdmin());
  }, [dispatch]);

  // Dados vivos do Redux para interligação real
  const totalAdmins = useAppSelector((state) => state.admin.admins.length);
  const livros = useAppSelector((state) => state.livro.livrosAdmin);
  const totalLivros = livros.length;
  const estoqueCriticoCount = livros.filter(l => l.estoque <= 5).length;

  if (loading) return <div className="admin-loading"><div className="spinner"></div><p>Carregando métricas corporativas...</p></div>;
  if (error) return <div className="admin-loading"><p>Erro ao carregar dashboard admin.</p></div>;
  if (!data) return <div className="admin-loading">Nenhum dado encontrado no dashboard admin.</div>;

  const kpis: ItemKPI[] = [
    {
      id: 'receita-mes',
      label: 'Receita do Mês',
      value: `R$ ${data.metricas.totalVendasMes.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
      icon: DollarSign,
      variant: 'receita',
      trend: { valor: data.metricas.percentualCrescimento },
    },
    {
      id: 'ticket-medio',
      label: 'Ticket Médio',
      value: `R$ ${data.metricas.ticketMedio.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
      icon: Percent,
      variant: 'default',
    },
    {
      id: 'livros-catalogo',
      label: 'Livros no Catálogo',
      value: totalLivros,
      icon: BookOpen,
      variant: 'default',
    },
    {
      id: 'estoque-critico',
      label: 'Estoque Crítico (≤ 5)',
      value: estoqueCriticoCount,
      icon: Package,
      variant: 'critico',
    },
    {
      id: 'administradores',
      label: 'Administradores',
      value: totalAdmins,
      icon: ShieldCheck,
      variant: 'default',
    },
  ];

  return (
    <div className="dashboard-content">
      {/* Métricas Principais (KPIS) */}
      <AdminKPIs kpis={kpis} layout="grid" columns={5} enableCarousel={true} />

      {/* Gráficos */}
      <div className="painel-graficos">
        <div className="painel-grafico large-chart">
          <h3 className="painel-grafico__titulo">Receita Anual Crescente</h3>
          <Line options={optionsReceita} data={data.graficoReceitaAnual as unknown as ChartData<'line'>} />
        </div>
        <div className="painel-grafico">
          <h3 className="painel-grafico__titulo">Status dos Pedidos</h3>
          <Doughnut options={optionsStatus} data={data.graficoStatusPedidos as unknown as ChartData<'doughnut'>} />
        </div>
      </div>

      <div className="painel-graficos mt-20">
        <div className="painel-grafico">
          <h3 className="painel-grafico__titulo">Vendas por Categoria</h3>
          <div className="kpi-secundario-container">
             <div className="kpi-secundario">
                <Users size={18} />
                <span>{data.metricas.clientesAtivos} Clientes Ativos</span>
             </div>
             <div className="kpi-secundario">
                <AlertTriangle size={18} />
                <span>{data.metricas.trocasSolicitadas} Trocas Ativas</span>
             </div>
          </div>
          <Line options={optionsCategoria} data={data.graficoVendasPorCategoria as unknown as ChartData<'line'>} />
        </div>

        {/* Atividades Recentes */}
        <div className="card activity-card">
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
    </div>
  );
}
