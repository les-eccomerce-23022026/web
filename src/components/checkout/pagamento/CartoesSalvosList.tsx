import { CreditCard, Star } from 'lucide-react';
import type { ICartaoSalvoPagamento } from '@/interfaces/IPagamento';
import styles from './CartoesSalvosList.module.css';

interface CartoesSalvosListProps {
  cartoes: ICartaoSalvoPagamento[];
  selecionado?: string | null;
  onSelect: (cartaoUuid: string) => void;
  onEdit?: (cartaoUuid: string) => void;
  onDelete?: (cartaoUuid: string) => void;
}

export function CartoesSalvosList({
  cartoes,
  selecionado,
  onSelect,
  onEdit,
  onDelete
}: CartoesSalvosListProps) {
  if (cartoes.length === 0) {
    return (
      <div className={styles['sem-cartoes']}>
        <CreditCard size={48} strokeWidth={1.5} />
        <p>Nenhum cartão salvo</p>
        <span>Adicione um novo cartão para comprar mais rápido</span>
      </div>
    );
  }

  return (
    <div className={styles['cartoes-list']} data-cy="checkout-saved-cards">
      {cartoes.map((cartao) => (
        <div
          key={cartao.uuid}
          className={`${styles['cartao-item']} ${selecionado === cartao.uuid ? styles['selecionado'] : ''}`}
          onClick={() => onSelect(cartao.uuid)}
          data-cy={`checkout-card-item-${cartao.final}`}
        >
          <div className={styles['cartao-conteudo']}>
            <div className={styles['cartao-icon']}>
              <CreditCard size={24} />
            </div>
            
            <div className={styles['cartao-info']}>
              <div className={styles['cartao-nome']}>
                <span className={styles['bandeira']}>{cartao.bandeira}</span>
                <span className={styles['final']}>•••• {cartao.final}</span>
              </div>
              <p className={styles['titular']}>{cartao.nomeCliente}</p>
            </div>
            
            {cartao.principal && (
              <div className={styles['principal-badge']} title="Cartão principal">
                <Star size={16} fill="currentColor" />
              </div>
            )}
          </div>
          
          <div className={styles['cartao-actions']}>
            {onEdit && (
              <button
                className={styles['action-btn']}
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(cartao.uuid);
                }}
                data-cy={`checkout-card-edit-${cartao.final}`}
              >
                Editar
              </button>
            )}
            {onDelete && (
              <button
                className={styles['action-btn-delete']}
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(cartao.uuid);
                }}
                data-cy={`checkout-card-delete-${cartao.final}`}
              >
                Remover
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
