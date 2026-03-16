import './LoadingState.css';

interface LoadingStateProps {
  message?: string;
  className?: string;
}

export function LoadingState({ message = 'Carregando...', className = '' }: LoadingStateProps) {
  return (
    <div className={`loading-state-container ${className}`} data-cy="loading-state">
      <div className="loading-state-spinner"></div>
      <p className="loading-state-message">{message}</p>
    </div>
  );
}
