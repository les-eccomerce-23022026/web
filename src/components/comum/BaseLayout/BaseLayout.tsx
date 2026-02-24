import { Outlet } from 'react-router-dom';
import { Header } from '@/components/comum/Header/Header';
import { Footer } from '@/components/comum/Footer/Footer';
import './BaseLayout.css';

export function BaseLayout() {
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
