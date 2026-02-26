import styles from './Checkout.module.css';
import { useCheckout } from '@/hooks/useCheckout';

export function Checkout() {
  const { data, loading, error } = useCheckout();

  if (loading) return <p className={styles['checkout-status-message']}>Carregando dados de checkout...</p>;
  if (error) return <p className={styles['checkout-status-message']}>Erro ao carregar checkout.</p>;
  if (!data) return <p className={styles['checkout-status-message']}>Nenhum dado de checkout encontrado.</p>;

  return (
    <div className={styles['checkout-page']}>
      <h1 className="page-title">Finalizar Compra</h1>
      <div className={`breadcrumb ${styles['checkout-breadcrumb']}`}>
        <strong>1. Identificação</strong> &gt; <strong>2. Entrega</strong> &gt; <span className={styles['checkout-breadcrumb-active']}>3. Pagamento</span>
      </div>

      <div className={styles['checkout-grid']}>
        <div className={styles['coluna-principal']}>
          <div className={`card ${styles['checkout-card-spaced']}`}>
             <h3>Endereço de Entrega</h3>
             <p>{data.enderecoEntrega.logradouro}, {data.enderecoEntrega.numero}, {data.enderecoEntrega.complemento}</p>
             <p>{data.enderecoEntrega.cidade} - {data.enderecoEntrega.estado}, CEP: {data.enderecoEntrega.cep}</p>
             <a href="#" className={styles['checkout-link-alt']}>Alterar endereço</a>
          </div>

          <div className={`card ${styles['checkout-card-spaced']}`}>
             <h3 className={styles['checkout-section-title']}>Forma de Pagamento (Cartões)</h3>
             <div className={`form-group ${styles['checkout-form-row']}`}>
               <select defaultValue="0" data-cy="checkout-card-select">
                 <option value="0">Selecionar Cartão Salvo</option>
                 {data.cartoesSalvos.map((cartao) => (
                   <option key={cartao.uuid} value={cartao.uuid}>**** **** **** {cartao.final} - {cartao.nomeCliente}</option>
                 ))}
               </select>
               <span className={styles['checkout-text-nowrap']}>ou</span>
               <button className={`btn-secondary ${styles['checkout-text-nowrap']}`} data-cy="checkout-add-card-button">+ Novo Cartão</button>
             </div>
             
             <div className={`form-group ${styles['checkout-form-spaced']}`}>
                <label>Pagar valor parcial com este cartão (Múltiplos Cartões)</label>
                <div className={styles['checkout-input-group']}>
                  <input type="number" placeholder={`R$ ${data.resumoPedido.total.toFixed(2).replace('.', ',')}`} data-cy="checkout-partial-value-input" />
                  <button className="btn-secondary" data-cy="checkout-add-payment-button">Adicionar Pagamento</button>
                </div>
             </div>
          </div>

          <div className="card">
             <h3 className={styles['checkout-section-title']}>Cupons de Troca / Promocional</h3>
             <div className={styles['checkout-input-group']}>
               <input type="text" placeholder="Código do cupom" data-cy="checkout-coupon-input" />
               <button className="btn-secondary" data-cy="checkout-apply-coupon-button">Aplicar</button>
             </div>
          </div>
        </div>

        <div className={styles['coluna-lateral']}>
           <div className={`card ${styles['checkout-summary-card']}`}>
              <h3 className={styles['checkout-summary-title']}>Resumo do Pedido</h3>
              <ul className={styles['checkout-summary-list']}>
                <li className={styles['checkout-summary-item']}><span>Subtotal ({data.resumoPedido.quantidadeItens} item):</span> <span>R$ {data.resumoPedido.subtotal.toFixed(2).replace('.', ',')}</span></li>
                <li className={styles['checkout-summary-item']}><span>Frete:</span> <span>R$ {data.resumoPedido.frete.toFixed(2).replace('.', ',')}</span></li>
                <li className={styles['checkout-summary-item-discount']}><span>Cupons Aplicados:</span> <span>- R$ {data.resumoPedido.descontoCupons.toFixed(2).replace('.', ',')}</span></li>
              </ul>
              
              <hr className={styles['checkout-summary-divider']} />
              
              <div className={styles['checkout-total-row']}>
                <span className={styles['checkout-total-label']}>Total a Pagar:</span>
                <span className={styles['checkout-total-value']}>R$ {data.resumoPedido.total.toFixed(2).replace('.', ',')}</span>
              </div>
              
              <button className={`btn-primary ${styles['checkout-btn-finish']}`} onClick={() => alert('Compra Finalizada com Sucesso!')} data-cy="checkout-finish-button">Concluir Pedido</button>
           </div>
        </div>
      </div>
    </div>
  );
}
