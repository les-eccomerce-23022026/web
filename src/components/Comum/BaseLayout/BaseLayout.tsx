import { Outlet } from '@/hooks/nextRouterCompat';
import { Header } from '@/components/Comum/Header/Header';
import { Footer } from '@/components/Comum/Footer/Footer';
import { GlobalErrorBanner } from '@/components/Comum/GlobalErrorBanner/GlobalErrorBanner';
import './BaseLayout.css';

export const BaseLayout = () => {
  return (
    <div className="base-layout">
      <Header />
      <GlobalErrorBanner />
      <main className="container main-content">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
