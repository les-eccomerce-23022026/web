import { MapPin, Home, Building } from 'lucide-react';
import type { IEnderecoCliente } from '@/interfaces/pagamento';
import styles from './EnderecoEntregaCard.module.css';

interface EnderecoEntregaCardProps {
  enderecos: IEnderecoCliente[];
  selecionado?: string | null;
  onSelect: (enderecoUuid: string) => void;
  onEdit?: (enderecoUuid: string) => void;
  onAdd?: () => void;
}

export const EnderecoEntregaCard = ({
  enderecos,
  selecionado,
  onSelect,
  onEdit,
  onAdd
}: EnderecoEntregaCardProps) => {
  if (enderecos.length === 0) {
    return (
      <div className={styles['sem-enderecos']}>
        <MapPin size={48} strokeWidth={1.5} />
        <p>Nenhum endereço cadastrado</p>
        <span>Adicione um endereço para receber seu pedido</span>
        {onAdd && (
          <button 
            className="btn-secondary" 
            onClick={onAdd}
            data-cy="checkout-add-address-button"
          >
            + Adicionar Endereço
          </button>
        )}
      </div>
    );
  }

  return (
    <div className={styles['enderecos-list']} data-cy="checkout-addresses">
      {enderecos.map((endereco) => (
        <div
          key={endereco.uuid}
          className={`${styles['endereco-item']} ${selecionado === endereco.uuid ? styles['selecionado'] : ''}`}
          onClick={() => onSelect(endereco.uuid)}
          data-cy={`checkout-address-item-${endereco.uuid}`}
          data-selected={selecionado === endereco.uuid}
        >
          <div className={styles['endereco-conteudo']}>
            <div className={styles['endereco-icon']}>
              {endereco.tipo === 'cobranca' ? (
                <Building size={24} />
              ) : (
                <Home size={24} />
              )}
            </div>
            
            <div className={styles['endereco-info']}>
              <div className={styles['endereco-header']}>
                <span className={styles['endereco-tipo']}>
                  {endereco.tipo === 'cobranca' ? 'Cobrança' : endereco.tipo === 'entrega' ? 'Entrega' : 'Ambos'}
                </span>
                {endereco.principal && (
                  <span className={styles['principal-badge']}>Principal</span>
                )}
              </div>
              
              <p className={styles['endereco-logradouro']}>
                {endereco.logradouro}, {endereco.numero}
                {endereco.complemento && ` - ${endereco.complemento}`}
              </p>
              
              <p className={styles['endereco-complemento']}>
                {endereco.bairro} - {endereco.cidade}/{endereco.estado}
              </p>
              
              <p className={styles['endereco-cep']}>
                CEP: {endereco.cep}
              </p>
            </div>
          </div>
          
          {onEdit && (
            <div className={styles['endereco-actions']}>
              <button
                className={styles['action-btn']}
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(endereco.uuid);
                }}
                data-cy={`checkout-address-edit-${endereco.uuid}`}
              >
                Editar
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
