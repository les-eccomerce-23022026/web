import type { KeyboardEvent } from 'react';
import { Check, CreditCard, Star } from 'lucide-react';
import type { ICartaoSalvoPagamento } from '@/interfaces/pagamento';
import styles from './CartoesSalvosList.module.css';

interface CartoesSalvosListProps {
  cartoes: ICartaoSalvoPagamento[];
  selecionado?: string | null;
  onSelect: (cartaoUuid: string) => void;
  onEdit?: (cartaoUuid: string) => void;
  onDelete?: (cartaoUuid: string) => void;
}

function handleCartaoKeyDown(
  e: KeyboardEvent,
  cartaoUuid: string,
  onSelect: (uuid: string) => void,
) {
  if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault();
    onSelect(cartaoUuid);
  }
}

export const CartoesSalvosList = ({
  cartoes,
  selecionado,
  onSelect,
  onEdit,
  onDelete
}: CartoesSalvosListProps) => {
  if (cartoes.length === 0) {
    return null;
  }

  return (
    <div className={styles['cartoes-list']} data-cy="checkout-saved-cards">
      {cartoes.map((cartao) => {
        const isSel = selecionado === cartao.uuid;
        return (
        <div
          key={cartao.uuid}
          role="button"
          tabIndex={0}
          aria-pressed={isSel}
          aria-label={`Cartão ${cartao.bandeira} final ${cartao.ultimosDigitosCartao}. ${isSel ? 'Selecionado.' : 'Selecionar este cartão.'}`}
          className={`${styles['cartao-item']} ${isSel ? styles['selecionado'] : ''}`}
          onClick={() => onSelect(cartao.uuid)}
          onKeyDown={(e) => handleCartaoKeyDown(e, cartao.uuid, onSelect)}
          data-cy={`checkout-card-item-${cartao.ultimosDigitosCartao}`}
        >
          <div className={styles['cartao-conteudo']}>
            <div className={styles['cartao-icon']}>
              <CreditCard size={24} />
            </div>
            
            <div className={styles['cartao-info']}>
              <div className={styles['cartao-nome']}>
                <span className={styles['bandeira']}>{cartao.bandeira}</span>
                <span className={styles['final']}>•••• {cartao.ultimosDigitosCartao}</span>
              </div>
              <p className={styles['titular']}>{cartao.nomeCliente}</p>
            </div>
            
            {cartao.principal && (
              <div className={styles['principal-badge']} title="Cartão principal">
                <Star size={16} fill="currentColor" />
              </div>
            )}

            {isSel ? (
              <div className={styles['check-wrap']} aria-hidden>
                <Check className={styles['check-icon']} size={22} strokeWidth={2.5} />
              </div>
            ) : null}
          </div>
          
          <div className={styles['cartao-actions']}>
            {onEdit && (
              <button
                className={styles['action-btn']}
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(cartao.uuid);
                }}
                data-cy={`checkout-card-edit-${cartao.ultimosDigitosCartao}`}
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
                data-cy={`checkout-card-delete-${cartao.ultimosDigitosCartao}`}
              >
                Remover
              </button>
            )}
          </div>
        </div>
        );
      })}
    </div>
  );
}
