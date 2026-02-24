import { useState, useEffect } from 'react';
import './Checkout.css';
import { CheckoutService } from '@/services/CheckoutService';

export function Checkout() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    CheckoutService.getCheckoutInfo().then(setData);
  }, []);

  if (!data) return <p style={{ padding: '20px' }}>Carregando dados de checkout...</p>;

  return (
    <div className="checkout-page">
      <h1 className="page-title">Finalizar Compra</h1>
      <div className="breadcrumb checkout-breadcrumb">
        <strong>1. Identificação</strong> &gt; <strong>2. Entrega</strong> &gt; <span className="checkout-breadcrumb-active">3. Pagamento</span>
      </div>

      <div className="checkout-grid">
        <div className="coluna-principal">
          <div className="card checkout-card-spaced">
             <h3>Endereço de Entrega</h3>
             <p>{data.enderecoEntrega.logradouro}, {data.enderecoEntrega.numero}, {data.enderecoEntrega.complemento}</p>
             <p>{data.enderecoEntrega.cidade} - {data.enderecoEntrega.estado}, CEP: {data.enderecoEntrega.cep}</p>
             <a href="#" className="checkout-link-alt">Alterar endereço</a>
          </div>

          <div className="card checkout-card-spaced">
             <h3 className="checkout-section-title">Forma de Pagamento (Cartões)</h3>
             <div className="form-group checkout-form-row">
               <select defaultValue="0">
                 <option value="0">Selecionar Cartão Salvo</option>
                 {data.cartoesSalvos.map((cartao: any) => (
                   <option key={cartao.uuid} value={cartao.uuid}>**** **** **** {cartao.final} - {cartao.nomeCliente}</option>
                 ))}
               </select>
               <span className="checkout-text-nowrap">ou</span>
               <button className="btn-secondary checkout-text-nowrap">+ Novo Cartão</button>
             </div>
             
             <div className="form-group checkout-form-spaced">
                <label>Pagar valor parcial com este cartão (Múltiplos Cartões)</label>
                <div className="checkout-input-group">
                  <input type="number" placeholder={`R$ ${data.resumoPedido.total.toFixed(2).replace('.', ',')}`} />
                  <button className="btn-secondary">Adicionar Pagamento</button>
                </div>
             </div>
          </div>

          <div className="card">
             <h3 className="checkout-section-title">Cupons de Troca / Promocional</h3>
             <div className="checkout-input-group">
               <input type="text" placeholder="Código do cupom" />
               <button className="btn-secondary">Aplicar</button>
             </div>
          </div>
        </div>

        <div className="coluna-lateral">
           <div className="card checkout-summary-card">
              <h3 className="checkout-summary-title">Resumo do Pedido</h3>
              <ul className="checkout-summary-list">
                <li className="checkout-summary-item"><span>Subtotal ({data.resumoPedido.quantidadeItens} item):</span> <span>R$ {data.resumoPedido.subtotal.toFixed(2).replace('.', ',')}</span></li>
                <li className="checkout-summary-item"><span>Frete:</span> <span>R$ {data.resumoPedido.frete.toFixed(2).replace('.', ',')}</span></li>
                <li className="checkout-summary-item-discount"><span>Cupons Aplicados:</span> <span>- R$ {data.resumoPedido.descontoCupons.toFixed(2).replace('.', ',')}</span></li>
              </ul>
              
              <hr className="checkout-summary-divider" />
              
              <div className="checkout-total-row">
                <span className="checkout-total-label">Total a Pagar:</span>
                <span className="checkout-total-value">R$ {data.resumoPedido.total.toFixed(2).replace('.', ',')}</span>
              </div>
              
              <button className="btn-primary checkout-btn-finish" onClick={() => alert('Compra Finalizada com Sucesso!')}>Concluir Pedido</button>
           </div>
        </div>
      </div>
    </div>
  );
}
