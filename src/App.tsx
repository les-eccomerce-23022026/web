import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useEffect } from 'react';
import { useAppDispatch } from './store/hooks';
import { fetchCarrinho } from './store/slices/carrinhoSlice';
import { BaseLayout } from '@/components/comum/BaseLayout/BaseLayout';
import { HomeCatalogo } from '@/pages/cadastro_livros/HomeCatalogo/HomeCatalogo';
import { DetalhesLivro } from '@/pages/cadastro_livros/DetalhesLivro/DetalhesLivro';
import { Carrinho } from '@/pages/vendas/Carrinho/Carrinho';
import { Checkout } from '@/pages/vendas/Checkout/Checkout';
import { LoginArea } from '@/pages/cadastro_clientes/LoginArea/LoginArea';
import { DashboardAdmin } from '@/pages/analise/DashboardAdmin/DashboardAdmin';
import { GerenciarAdmins } from '@/pages/analise/DashboardAdmin/GerenciarAdmins';
import { ListaLivrosAdmin } from '@/pages/cadastro_livros/ListaLivrosAdmin/ListaLivrosAdmin';
import { CadastrarLivroAdmin } from '@/pages/cadastro_livros/CadastrarLivroAdmin/CadastrarLivroAdmin';
import { ProtectedRoute } from '@/components/comum/ProtectedRoute/ProtectedRoute';
import { MeuPerfil } from '@/pages/cadastro_clientes/MeuPerfil/MeuPerfil';

function App() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(fetchCarrinho());
  }, [dispatch]);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<BaseLayout />}>
          <Route index element={<HomeCatalogo />} />
          <Route path="livro/:id" element={<DetalhesLivro />} />
          <Route path="carrinho" element={<Carrinho />} />
          <Route path="minha-conta" element={<LoginArea />} />
          
          <Route element={<ProtectedRoute />}>
            <Route path="checkout" element={<Checkout />} />
            <Route path="perfil" element={<MeuPerfil />} />
          </Route>
        </Route>
        
        {/* Painel Administrativo Layout Simplificado */}
        <Route path="/admin" element={<ProtectedRoute requiredRole="admin" />}>
          <Route index element={<DashboardAdmin />} />
          <Route path="administradores" element={<GerenciarAdmins />} />
          <Route path="livros" element={<ListaLivrosAdmin />} />
          <Route path="livros/novo" element={<CadastrarLivroAdmin />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
