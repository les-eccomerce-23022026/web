'use client';

/**
 * Dashboard Admin page - Client Component with Redux
 * Migrated from src/pages-react-router/PainelAdmin/DashboardAdmin/DashboardAdmin.tsx
 */

import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, ArcElement, Filler } from 'chart.js';
import { Line, Doughnut } from 'react-chartjs-2';
import { DollarSign, Users, Package, AlertTriangle, BookOpen, ShieldCheck } from 'lucide-react';
import '@/pages-react-router/PainelAdmin/DashboardAdmin/DashboardAdmin.css';
import { useEffect } from 'react';
import { useDashboardAdmin } from '@/hooks/useDashboardAdmin';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchLivrosAdmin } from '@/store/slices/livroSlice';

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

  return (
    <div className="dashboard-content">
      {/* Métricas Principais (KPIS) */}
      <div className="painel-kpis">
        <div className="painel-kpi">
          <div className="painel-kpi__icone painel-kpi__icone--receita">
            <DollarSign size={24} strokeWidth={2.5} />
          </div>
          <div className="painel-kpi__info">
            <span className="painel-kpi__valor">{data.metricas.totalVendasMes.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
            <span className="painel-kpi__rotulo">
              Receita do Mês
              <span className={`texto--${data.metricas.percentualCrescimento > 0 ? 'sucesso' : 'erro'} kpi-tendencia`}>
                ({data.metricas.percentualCrescimento > 0 ? '+' : ''}{data.metricas.percentualCrescimento}%)
              </span>
            </span>
          </div>
        </div>

        <div className="painel-kpi">
          <div className="painel-kpi__icone painel-kpi__icone--pedidos">
            <Package size={24} strokeWidth={2.5} />
          </div>
          <div className="painel-kpi__info">
            <span className="painel-kpi__valor">0</span>
            <span className="painel-kpi__rotulo">Pedidos do Mês</span>
          </div>
        </div>

        <div className="painel-kpi">
          <div className="painel-kpi__icone painel-kpi__icone--clientes">
            <Users size={24} strokeWidth={2.5} />
          </div>
          <div className="painel-kpi__info">
            <span className="painel-kpi__valor">0</span>
            <span className="painel-kpi__rotulo">Clientes Ativos</span>
          </div>
        </div>

        <div className="painel-kpi">
          <div className="painel-kpi__icone painel-kpi__icone--livros">
            <BookOpen size={24} strokeWidth={2.5} />
          </div>
          <div className="painel-kpi__info">
            <span className="painel-kpi__valor">{totalLivros}</span>
            <span className="painel-kpi__rotulo">Livros no Catálogo</span>
          </div>
        </div>

        <div className="painel-kpi">
          <div className="painel-kpi__icone painel-kpi__icone--estoque">
            <AlertTriangle size={24} strokeWidth={2.5} />
          </div>
          <div className="painel-kpi__info">
            <span className="painel-kpi__valor">{estoqueCriticoCount}</span>
            <span className="painel-kpi__rotulo">Estoque Crítico</span>
          </div>
        </div>

        <div className="painel-kpi">
          <div className="painel-kpi__icone painel-kpi__icone--admins">
            <ShieldCheck size={24} strokeWidth={2.5} />
          </div>
          <div className="painel-kpi__info">
            <span className="painel-kpi__valor">{totalAdmins}</span>
            <span className="painel-kpi__rotulo">Administradores</span>
          </div>
        </div>
      </div>

      {/* Gráficos */}
      <div className="painel-graficos">
        <div className="painel-grafico">
          <Line data={{ labels: [], datasets: [] }} options={optionsReceita} />
        </div>
        <div className="painel-grafico">
          <Doughnut data={{ labels: [], datasets: [] }} options={optionsStatus} />
        </div>
        <div className="painel-grafico">
          <Doughnut data={{ labels: [], datasets: [] }} options={optionsCategoria} />
        </div>
      </div>
    </div>
  );
}
