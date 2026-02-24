import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, ArcElement, Filler } from 'chart.js';
import { Line, Doughnut } from 'react-chartjs-2';
import './DashboardAdmin.css';
import { DashboardAdminService } from '@/services/DashboardAdminService';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, ArcElement, Filler);

export function DashboardAdmin() {
  const optionsCategoria = { responsive: true, plugins: { legend: { position: 'top' as const }, title: { display: true, text: 'Vendas por Categoria (Jan-Jun)' } } };
  const optionsReceita = { responsive: true, plugins: { legend: { position: 'top' as const }, title: { display: true, text: 'Receita Anual Crescente (R$)' } } };
  const optionsStatus = { responsive: true, plugins: { legend: { position: 'right' as const }, title: { display: true, text: 'Status dos Pedidos' } } };

  const [data, setData] = useState<any>(null);

  useEffect(() => {
    DashboardAdminService.getDashboardInfo().then(setData);
  }, []);

  if (!data) return <div className="admin-loading"><div className="spinner"></div><p>Carregando métricas corporativas...</p></div>;

  return (
    <div className="admin-dashboard">
      <div className="header-admin">
        <div className="header-admin-title">
          <h2>Painel Administrativo Corporativo</h2>
          <p>Visão de Retaguarda - Barnes & Noble System</p>
        </div>
        <Link to="/"><button className="btn-secondary">Sair do Painel (Loja)</button></Link>
      </div>

      <div className="dashboard-grid">
        {/* Menu Lateral Admin */}
        <aside className="sidebar-admin">
          <ul>
            <li className="sidebar-group-title">Menu Principal</li>
            <li className="active-admin">
              <Link to="/admin" className="sidebar-link active">📊 Dashboard Analytics</Link>
            </li>
            <li>
              <Link to="/admin/livros" className="sidebar-link">📚 Gestão de Catálogo</Link>
            </li>
            <li>
              <Link to="/admin/estoque" className="sidebar-link">📦 Controle de Estoque</Link>
            </li>
            <li className="sidebar-group-title">Atendimento</li>
            <li>
              <Link to="/admin/trocas" className="sidebar-link">🔄 Solicitações & Trocas</Link>
            </li>
            <li>
              <Link to="#/" className="sidebar-link disabled">👥 Gestão de Clientes</Link>
            </li>
          </ul>
        </aside>

        {/* Cópia Dashboard Conteúdo */}
        <div className="content-admin">
          {/* Métricas Principais */}
          <div className="painel-kpis">
            <div className="painel-kpi">
              <div className="painel-kpi__icone painel-kpi__icone--receita">💰</div>
              <div className="painel-kpi__info">
                <span className="painel-kpi__valor">R$ {data.metricas.totalVendasMes.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                <span className="painel-kpi__rotulo">Receita do Mês (<span className={`texto--${data.metricas.percentualCrescimento > 0 ? 'sucesso' : 'erro'}`}>{data.metricas.percentualCrescimento > 0 ? '+' : ''}{data.metricas.percentualCrescimento}%</span>)</span>
              </div>
            </div>
            
            <div className="painel-kpi">
              <div className="painel-kpi__icone painel-kpi__icone--vendas">🏷️</div>
              <div className="painel-kpi__info">
                <span className="painel-kpi__valor">R$ {data.metricas.ticketMedio.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                <span className="painel-kpi__rotulo">Ticket Médio</span>
              </div>
            </div>

            <div className="painel-kpi">
              <div className="painel-kpi__icone painel-kpi__icone--clientes">👥</div>
              <div className="painel-kpi__info">
                <span className="painel-kpi__valor">{data.metricas.clientesAtivos}</span>
                <span className="painel-kpi__rotulo">Clientes Ativos</span>
              </div>
            </div>
            
            <div className="painel-kpi">
              <div className="painel-kpi__icone painel-kpi__icone--estoque">📦</div>
              <div className="painel-kpi__info">
                <span className="painel-kpi__valor">{data.metricas.livrosBaixoEstoque}</span>
                <span className="painel-kpi__rotulo">Estoque Crítico</span>
              </div>
            </div>

            <div className="painel-kpi">
              <div className="painel-kpi__icone painel-kpi__icone--aviso">⚠️</div>
              <div className="painel-kpi__info">
                <span className="painel-kpi__valor">{data.metricas.trocasSolicitadas}</span>
                <span className="painel-kpi__rotulo">Trocas/Devoluções</span>
              </div>
            </div>
          </div>
          
          {/* Gráficos */}
          <div className="painel-graficos">
            <div className="painel-grafico large-chart">
               <h3 className="painel-grafico__titulo">Receita Anual Crescente</h3>
               <Line options={optionsReceita} data={data.graficoReceitaAnual} />
            </div>
            <div className="painel-grafico">
               <h3 className="painel-grafico__titulo">Status dos Pedidos</h3>
               <Doughnut options={optionsStatus} data={data.graficoStatusPedidos} />
            </div>
          </div>

          <div className="painel-graficos mt-20">
             <div className="painel-grafico">
               <h3 className="painel-grafico__titulo">Vendas por Categoria</h3>
               <Line options={optionsCategoria} data={data.graficoVendasPorCategoria} />
             </div>

             {/* Atividades Recentes */}
             <div className="card activity-card">
               <h4>Últimas Atividades</h4>
               <ul className="activity-list">
                 {data.atividadesRecentes.map((atividade: any) => (
                   <li key={atividade.id} className="activity-item">
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
      </div>
    </div>
  );
}

