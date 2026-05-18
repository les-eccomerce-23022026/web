import { AlertOctagon, RefreshCw } from 'lucide-react';
import './ErrorState.css';

interface ErrorAction {
  label: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary';
}

interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
  className?: string;
  title?: string;
  actions?: ErrorAction[];
}

export const ErrorState = ({ 
  title = 'Algo deu errado',
  message = 'Não foi possível carregar os dados. Tente novamente mais tarde.', 
  onRetry,
  className = '',
  actions = []
}: ErrorStateProps) => {
  return (
    <div className={`error-state-container ${className}`}>
      <div className="error-state-icon">
        <AlertOctagon size={48} strokeWidth={1.5} />
      </div>
      <h3 className="error-state-title">{title}</h3>
      <p className="error-state-message">{message}</p>
      <div className="error-state-actions">
        {onRetry && (
          <button className="btn-primary error-state-retry-btn" onClick={onRetry}>
            <RefreshCw size={16} className="error-state-retry-icon" />
            Tentar Novamente
          </button>
        )}
        {actions.map((action, index) => (
          <button
            key={index}
            className={action.variant === 'secondary' ? 'btn-secondary' : 'btn-primary'}
            onClick={action.onClick}
          >
            {action.label}
          </button>
        ))}
      </div>
    </div>
  );
}
