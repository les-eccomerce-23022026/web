import { Link } from 'react-router-dom';
import styles from './Carrinho.module.css';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { removerItem, atualizarQuantidade } from '@/store/slices/carrinhoSlice';

export function Carrinho() {
  const dispatch = useAppDispatch();
  const { data, error, status } = useAppSelector(state => state.carrinho);

  if (status === 'loading') return <p className={styles['carrinho-status-message']}>Carregando carrinho...</p>;
  if (status === 'failed' || error) return <p className={styles['carrinho-status-message']}>Erro ao carregar carrinho.</p>;
  if (!data) return <p className={styles['carrinho-status-message']}>Carrinho vazio.</p>;

  const handleUpdateQuantidade = (uuid: string, event: React.ChangeEvent<HTMLInputElement>) => {
    const qtd = parseInt(event.target.value, 10);
    if (qtd >= 1) {
      dispatch(atualizarQuantidade({ uuid, quantidade: qtd }));
    }
  };

  const handleRemover = (uuid: string) => {
    dispatch(removerItem(uuid));
  };

  return (
    <div className={styles['carrinho-page']}>
      <h1 className="page-title">Carrinho de Compras</h1>
      <hr className={styles['carrinho-separator']} />

      <table className={styles['carrinho-table']}>
        <thead>
          <tr className={styles['carrinho-table-header']}>
            <th className={styles['carrinho-th']}>Produto</th>
            <th className={styles['carrinho-th']}>Preço Unit.</th>
            <th className={styles['carrinho-th']}>Quant.</th>
            <th className={styles['carrinho-th']}>Subtotal</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {data.itens.map((item) => (
            <tr key={item.uuid}>
              <td className={styles['carrinho-td-product']}>
                <img src={item.imagem} alt="Livro" className={styles['carrinho-item-image']} />
                <div>
                  <strong>{item.titulo}</strong><br />
                  <span className={styles['carrinho-product-isbn']}>ISBN: {item.isbn}</span>
                </div>
              </td>
              <td className={styles['carrinho-td']} data-label="Preço Unit.">R$ {item.precoUnitario.toFixed(2).replace('.', ',')}</td>
              <td className={styles['carrinho-td']} data-label="Quant.">
                <input 
                  type="number" 
                  value={item.quantidade} 
                  onChange={(e) => handleUpdateQuantidade(item.uuid, e)} 
                  className={styles['carrinho-input-qty']} 
                />
              </td>
              <td className={styles['carrinho-td']} data-label="Subtotal">R$ {item.subtotal.toFixed(2).replace('.', ',')}</td>
              <td className={styles['carrinho-td']} data-label="Ações">
                <button 
                  onClick={() => handleRemover(item.uuid)} 
                  className={`btn-secondary ${styles['carrinho-btn-remove']}`}
                >
                  Remover
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className={`resumo ${styles['carrinho-resumo']}`}>
        <div className={`frete ${styles['carrinho-frete']}`}>
          <h4>Calcular Frete</h4>
          <div className={styles['carrinho-frete-input-group']}>
            <input type="text" placeholder="CEP (00000-000)" />
            <button className={`btn-secondary ${styles['carrinho-btn-frete']}`}>Calcular Frete</button>
          </div>
          <p className={styles['carrinho-frete-result']}>Frete Padrão: R$ {data.fretePadrao.valor.toFixed(2).replace('.', ',')} ({data.fretePadrao.prazo})</p>
        </div>
        
        <div className={`totalizador ${styles['carrinho-totalizador']}`}>
          <p>Subtotal: R$ {data.resumo.subtotal.toFixed(2).replace('.', ',')}</p>
          <p>Frete: R$ {data.resumo.frete.toFixed(2).replace('.', ',')}</p>
          <hr className={styles['carrinho-total-separator']} />
          <h2 className={styles['carrinho-total-header']}>Total: R$ {data.resumo.total.toFixed(2).replace('.', ',')}</h2>
          
          <Link to="/checkout"><button className={`btn-primary ${styles['carrinho-btn-finalizar']}`}>Finalizar Compra</button></Link>
        </div>
      </div>
    </div>
  );
}
