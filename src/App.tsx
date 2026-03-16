import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useEffect } from 'react';
import { useAppDispatch } from './store/hooks';
import { fetchCarrinho } from './store/slices/carrinhoSlice';
import { fetchLivros } from './store/slices/livroSlice';
import { fetchAdmins } from './store/slices/adminSlice';
import { restoreSession } from './store/slices/authSlice';
import { BaseLayout } from '@/components/comum/BaseLayout/BaseLayout';
import { AdminLayout } from '@/components/comum/AdminLayout/AdminLayout';
import { HomeCatalogo } from '@/pages/cadastro_livros/HomeCatalogo/HomeCatalogo';
import { DetalhesLivro } from '@/pages/cadastro_livros/DetalhesLivro/DetalhesLivro';
import { Carrinho } from '@/pages/vendas/Carrinho/Carrinho';
import { Checkout } from '@/pages/vendas/Checkout/Checkout';
import { Pagamento } from '@/pages/vendas/Pagamento/Pagamento';
import { PedidoConfirmado } from '@/pages/vendas/PedidoConfirmado/PedidoConfirmado';
import { MeusPedidos } from '@/pages/vendas/MeusPedidos/MeusPedidos';
import { SolicitarTroca } from '@/pages/vendas/SolicitarTroca/SolicitarTroca';
import { LoginArea } from '@/pages/cadastro_clientes/LoginArea/LoginArea';
import { DashboardAdmin } from '@/pages/analise/DashboardAdmin/DashboardAdmin';
import { GerenciarAdmins } from '@/pages/analise/DashboardAdmin/GerenciarAdmins';
import { GerenciarTrocas } from '@/pages/analise/GerenciarTrocas/GerenciarTrocas';
import { ListaLivrosAdmin } from '@/pages/cadastro_livros/ListaLivrosAdmin/ListaLivrosAdmin';
import { CadastrarLivroAdmin } from '@/pages/cadastro_livros/CadastrarLivroAdmin/CadastrarLivroAdmin';
import { GestaoClientes } from '@/pages/cadastro_clientes/GestaoClientes/GestaoClientes';
import { GerenciarPedidos } from '@/pages/analise/GerenciarPedidos/GerenciarPedidos';
import { ProtectedRoute } from '@/components/comum/ProtectedRoute/ProtectedRoute';
import { MeuPerfil } from '@/pages/cadastro_clientes/MeuPerfil/MeuPerfil';

function App() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    // Restaura a sessão antes de qualquer outra busca para evitar redirect prematuro
    dispatch(restoreSession()).finally(() => {
      dispatch(fetchCarrinho());
      dispatch(fetchLivros());
      dispatch(fetchAdmins());
    });
  }, [dispatch]);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<BaseLayout />}>
          <Route index element={<HomeCatalogo />} />
          <Route path="livro/:uuid" element={<DetalhesLivro />} />
          <Route path="carrinho" element={<Carrinho />} />
          <Route path="minha-conta" element={<LoginArea />} />

          <Route element={<ProtectedRoute />}>
            <Route path="checkout" element={<Checkout />} />
            <Route path="pagamento" element={<Pagamento />} />
            <Route path="pedido-confirmado" element={<PedidoConfirmado />} />
            <Route path="perfil" element={<MeuPerfil />} />
            <Route path="pedidos" element={<MeusPedidos />} />
            <Route path="pedidos/:uuid/troca" element={<SolicitarTroca />} />
          </Route>
        </Route>

        {/* Painel Administrativo — todas as rotas compartilham o AdminLayout */}
        <Route path="/admin" element={<ProtectedRoute requireAction="access_admin_panel" />}>
          <Route
            element={
              <AdminLayout
                title="Painel Administrativo Corporativo"
                subtitle="Visão de Retaguarda - Barnes & Noble System"
              />
            }
          >
            <Route index element={<DashboardAdmin />} />
            <Route path="administradores" element={<GerenciarAdmins />} />
            <Route path="livros" element={<ListaLivrosAdmin />} />
            <Route path="livros/novo" element={<CadastrarLivroAdmin />} />
            <Route path="pedidos" element={<GerenciarPedidos />} />
            <Route path="trocas" element={<GerenciarTrocas />} />
            <Route path="clientes" element={<GestaoClientes />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
