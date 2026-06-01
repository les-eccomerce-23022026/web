import './LoadingState.css';

interface LoadingStateProps {
  message?: string;
  className?: string;
}

export const LoadingState = ({ message = 'Carregando...', className = '' }: LoadingStateProps) => {
  return (
    <div className={`loading-state-container ${className}`} data-cy="loading">
      <div className="loading-state-spinner"></div>
      <p className="loading-state-message">{message}</p>
    </div>
  );
}
