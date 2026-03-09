import pedidosMock from '@/mocks/pedidosMock.json';
import livrosMock from '@/mocks/listaLivrosAdminMock.json';
import type { IDashboardAdminInfo, IAtividadeRecente } from '@/interfaces/IDashboardAdmin';
import type { IPedido } from '@/interfaces/IPedido';
import type { IDashboardAdminService } from '@/services/contracts/IDashboardAdminService';

export class DashboardAdminServiceMock implements IDashboardAdminService {
  async getDashboardInfo(): Promise<IDashboardAdminInfo> {
    console.log('[Mock] Calculando dashboard admin dinamicamente.');

    const pedidos = pedidosMock as IPedido[];
    const livros = livrosMock.livros;

    // Simulando Março como mês atual
    const dataAtual = new Date('2026-03-02');
    const mesAtual = dataAtual.getMonth();
    const anoAtual = dataAtual.getFullYear();

    const pedidosMesAtual = pedidos.filter((p) => {
      const d = new Date(p.data);
      return d.getMonth() === mesAtual && d.getFullYear() === anoAtual;
    });

    const pedidosMesAnterior = pedidos.filter((p) => {
      const d = new Date(p.data);
      return d.getMonth() === mesAtual - 1 && d.getFullYear() === anoAtual;
    });

    const totalVendasMes = pedidosMesAtual.reduce((acc, p) => acc + p.total, 0);
    const totalVendasAnterior = pedidosMesAnterior.reduce((acc, p) => acc + p.total, 0);
    const percentualCrescimento =
      totalVendasAnterior > 0
        ? Math.round((totalVendasMes / totalVendasAnterior - 1) * 100)
        : 100;

    const ticketMedio =
      pedidos.length > 0 ? pedidos.reduce((acc, p) => acc + p.total, 0) / pedidos.length : 0;

    const statusLabels = ['Entregues', 'Em Trânsito', 'Preparando', 'Pendentes', 'Devoluções'];
    const statusData = statusLabels.map((label) => pedidos.filter((p) => p.status === label).length);

    const mesesLabels = ['Jan', 'Fev', 'Mar'];
    const categorias = ['Ficção', 'Técnico'];

    const datasetsCategoria = categorias.map((cat) => ({
      label: cat,
      data: mesesLabels.map((_, i) =>
        pedidos
          .filter((p) => new Date(p.data).getMonth() === i)
          .reduce((acc, p) => acc + p.itens.filter((item) => item.categoria === cat).length, 0),
      ),
      borderColor: cat === 'Ficção' ? 'rgb(15, 76, 58)' : 'rgb(210, 180, 140)',
      backgroundColor: cat === 'Ficção' ? 'rgba(15, 76, 58, 0.5)' : 'rgba(210, 180, 140, 0.5)',
    }));

    const receitaMensal = mesesLabels.map((_, i) =>
      pedidos
        .filter((p) => new Date(p.data).getMonth() === i)
        .reduce((acc, p) => acc + p.total, 0),
    );

    const atividadesRecentes: IAtividadeRecente[] = pedidos
      .slice(-5)
      .reverse()
      .map((p) => ({
        uuid: p.uuid,
        tipo: 'Venda',
        descricao: `Pedido #${p.uuid.split('-')[1]} recebido - Total R$ ${p.total.toFixed(2)}`,
        data: 'Recentemente',
        sucesso: true,
      }));

    const dashboardInfo: IDashboardAdminInfo = {
      metricas: {
        totalVendasMes,
        percentualCrescimento,
        pedidosPendentes: pedidos.filter((p) => p.status === 'Pendentes').length,
        trocasSolicitadas: pedidos.filter((p) => p.status === 'Devoluções').length,
        ticketMedio,
        percentualCrescimentoTicket: 5.4,
        clientesAtivos: 2,
        percentualCrescimentoClientes: 10,
        livrosBaixoEstoque: livros.filter((l) => l.estoque <= 5).length,
      },
      graficoVendasPorCategoria: {
        labels: mesesLabels,
        datasets: datasetsCategoria,
      },
      graficoReceitaAnual: {
        labels: mesesLabels,
        datasets: [
          {
            label: 'Receita (R$) 2026',
            data: receitaMensal,
            borderColor: 'rgb(46, 139, 87)',
            backgroundColor: 'rgba(46, 139, 87, 0.2)',
            fill: true,
            tension: 0.4,
          },
        ],
      },
      graficoStatusPedidos: {
        labels: statusLabels,
        datasets: [
          {
            label: 'Status dos Pedidos',
            data: statusData,
            backgroundColor: [
              'rgba(15, 76, 58, 0.8)',
              'rgba(46, 139, 87, 0.8)',
              'rgba(210, 180, 140, 0.8)',
              'rgba(255, 165, 0, 0.8)',
              'rgba(201, 48, 44, 0.8)',
            ],
          },
        ],
      },
      atividadesRecentes,
    };

    return new Promise((resolve) => setTimeout(() => resolve(dashboardInfo), 300));
  }
}
