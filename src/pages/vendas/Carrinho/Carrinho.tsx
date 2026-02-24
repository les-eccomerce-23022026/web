import { Link } from 'react-router-dom';
import './Carrinho.css';
import { useCarrinho } from '@/hooks/useCarrinho';

export function Carrinho() {
  const { data, loading, error } = useCarrinho();

  if (loading) return <p style={{ padding: '20px' }}>Carregando carrinho...</p>;
  if (error) return <p style={{ padding: '20px' }}>Erro ao carregar carrinho.</p>;
  if (!data) return <p style={{ padding: '20px' }}>Carrinho vazio.</p>;

  return (
    <div className="carrinho-page">
      <h1 className="page-title">Carrinho de Compras</h1>
      <hr className="carrinho-separator" />

      <table className="carrinho-table">
        <thead>
          <tr className="carrinho-table-header">
            <th className="carrinho-th">Produto</th>
            <th className="carrinho-th">Preço Unit.</th>
            <th className="carrinho-th">Quant.</th>
            <th className="carrinho-th">Subtotal</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {data.itens.map((item) => (
            <tr key={item.uuid}>
              <td className="carrinho-td-product">
                <img src={item.imagem} alt="Livro" style={{width: '60px', height: '90px', objectFit:'cover', borderRadius:'4px', backgroundColor:'#e0e0e0'}} />
                <div>
                  <strong>{item.titulo}</strong><br />
                  <span className="carrinho-product-isbn">ISBN: {item.isbn}</span>
                </div>
              </td>
              <td className="carrinho-td" data-label="Preço Unit.">R$ {item.precoUnitario.toFixed(2).replace('.', ',')}</td>
              <td className="carrinho-td" data-label="Quant."><input type="number" defaultValue={item.quantidade} className="carrinho-input-qty" /></td>
              <td className="carrinho-td" data-label="Subtotal">R$ {item.subtotal.toFixed(2).replace('.', ',')}</td>
              <td className="carrinho-td" data-label="Ações"><button className="btn-secondary carrinho-btn-remove">Remover</button></td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="resumo carrinho-resumo">
        <div className="frete carrinho-frete">
          <h4>Calcular Frete</h4>
          <div className="carrinho-frete-input-group">
            <input type="text" placeholder="CEP (00000-000)" />
            <button className="btn-secondary carrinho-btn-frete">Calcular Frete</button>
          </div>
          <p className="carrinho-frete-result">Frete Padrão: R$ {data.fretePadrao.valor.toFixed(2).replace('.', ',')} ({data.fretePadrao.prazo})</p>
        </div>
        
        <div className="totalizador carrinho-totalizador">
          <p>Subtotal: R$ {data.resumo.subtotal.toFixed(2).replace('.', ',')}</p>
          <p>Frete: R$ {data.resumo.frete.toFixed(2).replace('.', ',')}</p>
          <hr className="carrinho-total-separator" />
          <h2 className="carrinho-total-header">Total: R$ {data.resumo.total.toFixed(2).replace('.', ',')}</h2>
          
          <Link to="/checkout"><button className="btn-primary carrinho-btn-finalizar">Finalizar Compra</button></Link>
        </div>
      </div>
    </div>
  );
}
