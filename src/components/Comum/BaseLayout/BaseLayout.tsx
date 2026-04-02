import { Outlet } from 'react-router-dom';
import { Header } from '@/components/Comum/Header/Header';
import { Footer } from '@/components/Comum/Footer/Footer';
import './BaseLayout.css';

export const BaseLayout = () => {
  return (
    <div className="base-layout">
      <Header />
      <main className="container main-content">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
