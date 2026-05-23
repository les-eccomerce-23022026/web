import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft, Home } from 'lucide-react';
import styles from './style.module.css';
import { ROTAS } from '@/config/rotas';

interface AdminLayoutProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}

export const AdminLayout = ({ title, subtitle, children }: AdminLayoutProps) => {
  const router = useRouter();

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
            onClick={() => router.back()} 
            title="Voltar"
          >
            <ChevronLeft size={24} strokeWidth={2.5} />
          </button>
          
          <Link href={ROTAS.HOME} className={styles.navIconBtn} title="Home">
            <Home size={24} strokeWidth={2.5} />
          </Link>
        </div>
      </div>

      <div className={styles.adminContent}>
        {children}
      </div>
    </div>
  );
}
