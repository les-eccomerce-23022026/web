import './EmptyState.css';

interface EmptyStateProps {
  title?: string;
  message?: string;
  className?: string;
  icon?: React.ReactNode;
}

export function EmptyState({ 
  title = 'Nenhum resultado', 
  message = 'Não encontramos dados para exibir no momento.', 
  className = '',
  icon
}: EmptyStateProps) {
  return (
    <div className={`empty-state-container ${className}`}>
      <div className="empty-state-icon">
        {icon || '📦'}
      </div>
      <h3 className="empty-state-title">{title}</h3>
      <p className="empty-state-message">{message}</p>
    </div>
  );
}
