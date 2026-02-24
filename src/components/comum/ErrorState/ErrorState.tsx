import './ErrorState.css';

interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
  className?: string;
}

export function ErrorState({ 
  message = 'Não foi possível carregar os dados. Tente novamente mais tarde.', 
  onRetry,
  className = '' 
}: ErrorStateProps) {
  return (
    <div className={`error-state-container ${className}`}>
      <div className="error-state-icon">!</div>
      <p className="error-state-message">{message}</p>
      {onRetry && (
        <button className="btn-primary error-state-retry-btn" onClick={onRetry}>
          Tentar Novamente
        </button>
      )}
    </div>
  );
}
