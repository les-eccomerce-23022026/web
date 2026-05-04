import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useEffect } from 'react';
import { useAppDispatch } from './store/hooks';
import { store } from './store';
import { fetchCarrinho } from './store/slices/carrinhoSlice';
import { fetchCategoriasCatalogo } from './store/slices/livroSlice';
import { fetchAdmins } from './store/slices/adminSlice';
import { restoreSession } from './store/slices/authSlice';
import { BaseLayout } from '@/components/Comum/BaseLayout/BaseLayout';
import { AdminLayout } from '@/components/Comum/AdminLayout/AdminLayout';
import { CatalogoLivros } from '@/pages/CadastroLivros/CatalogoLivros/CatalogoLivros';
import { DetalhesLivro } from '@/pages/CadastroLivros/DetalhesLivro/DetalhesLivro';
import { Carrinho } from '@/pages/Vendas/Carrinho/Carrinho';
import { FinalizarCompra } from '@/pages/Vendas/FinalizarCompra/FinalizarCompra';
import { PagamentoRedirecionaFinalizarCompra } from '@/pages/Vendas/Pagamento/Pagamento';
import { PedidoConfirmado } from '@/pages/Vendas/PedidoConfirmado/PedidoConfirmado';
import { PagamentoPix } from '@/pages/Vendas/PagamentoPix/PagamentoPix';
import { MeusPedidos } from '@/pages/Vendas/MeusPedidos/MeusPedidos';
import { SolicitarTroca } from '@/pages/Vendas/SolicitarTroca/SolicitarTroca';
import { AutenticacaoCliente } from '@/pages/CadastroClientes/AutenticacaoCliente/AutenticacaoCliente';
import { DashboardAdmin } from '@/pages/PainelAdmin/DashboardAdmin/DashboardAdmin';
import { GerenciarAdmins } from '@/pages/PainelAdmin/DashboardAdmin/GerenciarAdmins';
import { GerenciarTrocas } from '@/pages/PainelAdmin/GerenciarTrocas/GerenciarTrocas';
import { ListaLivrosAdmin } from '@/pages/CadastroLivros/ListaLivrosAdmin/ListaLivrosAdmin';
import { CadastrarLivroAdmin } from '@/pages/CadastroLivros/CadastrarLivroAdmin/CadastrarLivroAdmin';
import { GestaoClientes } from '@/pages/CadastroClientes/GestaoClientes/GestaoClientes';
import { GerenciarPedidos } from '@/pages/PainelAdmin/GerenciarPedidos/GerenciarPedidos';
import { ProtectedRoute } from '@/components/Comum/ProtectedRoute/ProtectedRoute';
import { MeuPerfil } from '@/pages/CadastroClientes/MeuPerfil/MeuPerfil';
import { ErrorBoundary } from '@/components/Comum/ErrorBoundary/ErrorBoundary';
import { NotificationProvider, NotificationContainer } from '@/components/Comum/Notification';

import { useActiveSessionValidation } from '@/hooks/useActiveSessionValidation';

const App = () => {
  console.log('[SENIOR-DEBUG] App Rendering');
  const dispatch = useAppDispatch();
  
  // 🔥 Ativa a validação de sessão em background (Senior UX)
  useActiveSessionValidation();

  useEffect(() => {
    // Restaura a sessão antes de qualquer outra busca para evitar redirect prematuro
    dispatch(restoreSession()).finally(() => {
      dispatch(fetchCarrinho());
      dispatch(fetchCategoriasCatalogo());
      const role = store.getState().auth.user?.role;
      if (role === 'admin') {
        dispatch(fetchAdmins());
      }
    });
  }, [dispatch]);

  return (
    <ErrorBoundary>
    <NotificationProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<BaseLayout />}>
            <Route index element={<CatalogoLivros />} />
            {/* Header navega para /categoria/* e /mais-vendidos — sem rota o Outlet ficava vazio */}
            <Route path="categoria/:slug" element={<CatalogoLivros />} />
            <Route path="mais-vendidos" element={<CatalogoLivros />} />
            <Route path="livro/:uuid" element={<DetalhesLivro />} />
            <Route path="carrinho" element={<Carrinho />} />
            <Route path="minha-conta" element={<AutenticacaoCliente />} />

            <Route element={<ProtectedRoute />}>
              <Route path="checkout" element={<FinalizarCompra />} />
              <Route path="pagamento" element={<PagamentoRedirecionaFinalizarCompra />} />
              <Route path="pagamento-pix" element={<PagamentoPix />} />
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
      <NotificationContainer />
    </NotificationProvider>
    </ErrorBoundary>
  );
}

export default App;
