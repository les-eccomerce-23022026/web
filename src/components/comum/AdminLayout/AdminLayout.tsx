import { useNavigate, Outlet, Link } from 'react-router-dom';
import { ChevronLeft, Home } from 'lucide-react';
import styles from './AdminLayout.module.css';
import { AdminLayoutNav } from './AdminLayoutNav';
import { useAppSelector } from '@/store/hooks';

interface AdminLayoutProps {
  title: string;
  subtitle?: string;
}

export const AdminLayout = ({ title, subtitle }: AdminLayoutProps) => {
  const navigate = useNavigate();
  const { user } = useAppSelector((state) => state.auth);

  return (
    <div className={styles.adminDashboard}>
      <div className={styles.headerAdmin}>
        <div>
          <h2>{title}</h2>
          {subtitle && <p>{subtitle}</p>}
        </div>
        
        <div className={styles.headerNav}>
          <button 
            className={styles.navIconBtn} 
            onClick={() => navigate(-1)} 
            title="Voltar"
          >
            <ChevronLeft size={24} strokeWidth={2.5} />
          </button>
          
          <Link to="/" className={styles.navIconBtn} title="Home da Loja">
            <Home size={24} strokeWidth={2.5} />
          </Link>
        </div>
      </div>

      <div className={styles.dashboardGrid}>
        <AdminLayoutNav eAdminMestre={user?.eAdminMestre} />

        <div className={styles.contentAdmin}>
          <Outlet />
        </div>
      </div>
    </div>
  );
}
