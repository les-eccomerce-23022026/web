import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, ArcElement, Filler } from 'chart.js';
import { Line, Doughnut } from 'react-chartjs-2';
import { DollarSign, Percent, Users, Package, AlertTriangle, BookOpen, ShieldCheck } from 'lucide-react';
import './DashboardAdmin.css';
import type { ChartData } from 'chart.js';
import { useDashboardAdmin } from '@/hooks/useDashboardAdmin';
import { useAppSelector } from '@/store/hooks';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, ArcElement, Filler);

export function DashboardAdmin() {
  const optionsReceita = { responsive: true, plugins: { legend: { position: 'top' as const }, title: { display: true, text: 'Receita Anual Crescente (R$)' } } };
  const optionsStatus = { responsive: true, plugins: { legend: { position: 'right' as const }, title: { display: true, text: 'Status dos Pedidos' } } };
  const optionsCategoria = { responsive: true, plugins: { legend: { position: 'top' as const }, title: { display: true, text: 'Vendas por Categoria (Jan-Mar)' } } };

  const { data, loading, error } = useDashboardAdmin();
  
  // Dados vivos do Redux para interligação real
  const totalAdmins = useAppSelector((state) => state.admin.admins.length);
  const livros = useAppSelector((state) => state.livro.livros);
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
            <span className="painel-kpi__valor">R$ {data.metricas.totalVendasMes.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
            <span className="painel-kpi__rotulo">
              Receita do Mês
              <span className={`texto--${data.metricas.percentualCrescimento > 0 ? 'sucesso' : 'erro'} kpi-tendencia`}>
                ({data.metricas.percentualCrescimento > 0 ? '+' : ''}{data.metricas.percentualCrescimento}%)
              </span>
            </span>
          </div>
        </div>

        <div className="painel-kpi">
          <div className="painel-kpi__icone painel-kpi__icone--vendas">
            <Percent size={24} strokeWidth={2.5} />
          </div>
          <div className="painel-kpi__info">
            <span className="painel-kpi__valor">R$ {data.metricas.ticketMedio.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
            <span className="painel-kpi__rotulo">Ticket Médio</span>
          </div>
        </div>

        {/* KPI Livros (Vindo do Redux) */}
        <div className="painel-kpi">
          <div className="painel-kpi__icone" style={{ backgroundColor: 'rgba(74, 144, 226, 0.15)', color: '#4a90e2' }}>
            <BookOpen size={24} strokeWidth={2.5} />
          </div>
          <div className="painel-kpi__info">
            <span className="painel-kpi__valor">{totalLivros}</span>
            <span className="painel-kpi__rotulo">Livros no Catálogo</span>
          </div>
        </div>

        {/* KPI Estoque Crítico (Vindo do Redux) */}
        <div className="painel-kpi">
          <div className="painel-kpi__icone painel-kpi__icone--estoque">
            <Package size={24} strokeWidth={2.5} />
          </div>
          <div className="painel-kpi__info">
            <span className="painel-kpi__valor">{estoqueCriticoCount}</span>
            <span className="painel-kpi__rotulo">Estoque Crítico (≤ 5)</span>
          </div>
        </div>

        {/* KPI Administradores (Vindo do Redux) */}
        <div className="painel-kpi">
          <div className="painel-kpi__icone" style={{ backgroundColor: 'rgba(155, 89, 182, 0.15)', color: '#9b59b6' }}>
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
