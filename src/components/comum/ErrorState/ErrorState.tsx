import { AlertOctagon, RefreshCw } from 'lucide-react';
import './ErrorState.css';

interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
  className?: string;
  title?: string;
}

export const ErrorState = ({ 
  title = 'Algo deu errado',
  message = 'Não foi possível carregar os dados. Tente novamente mais tarde.', 
  onRetry,
  className = '' 
}: ErrorStateProps) => {
  return (
    <div className={`error-state-container ${className}`}>
      <div className="error-state-icon">
        <AlertOctagon size={48} strokeWidth={1.5} />
      </div>
      <h3 className="error-state-title">{title}</h3>
      <p className="error-state-message">{message}</p>
      {onRetry && (
        <button className="btn-primary error-state-retry-btn" onClick={onRetry}>
          <RefreshCw size={16} className="error-state-retry-icon" />
          Tentar Novamente
        </button>
      )}
    </div>
  );
}
