interface CarrinhoTabelaProps {
  itens: Array<{
    uuid: string;
    imagem: string;
    titulo: string;
    isbn: string;
    precoUnitario: number;
    quantidade: number;
    subtotal: number;
  }>;
  onUpdateQuantidade: (uuid: string, event: React.ChangeEvent<HTMLInputElement>) => void;
  onRemover: (uuid: string) => void;
}

export const CarrinhoTabela = ({ itens, onUpdateQuantidade, onRemover }: CarrinhoTabelaProps) => (
  <table className="carrinho-table" data-cy="carrinho-table">
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
      {itens.map((item) => (
        <tr key={item.uuid} data-cy="carrinho-item-row">
          <td className="carrinho-td-product">
            <img src={item.imagem} alt="Livro" className="carrinho-item-image" />
            <div>
              <strong>{item.titulo}</strong><br />
              <span className="carrinho-product-isbn">ISBN: {item.isbn}</span>
            </div>
          </td>
          <td className="carrinho-td" data-label="Preço Unit.">R$ {item.precoUnitario.toFixed(2).replace('.', ',')}</td>
          <td className="carrinho-td" data-label="Quant.">
            <input
              type="number"
              value={item.quantidade}
              onChange={(e) => onUpdateQuantidade(item.uuid, e)}
              className="carrinho-input-qty"
              data-cy="carrinho-item-quantidade"
            />
          </td>
          <td className="carrinho-td" data-label="Subtotal">R$ {item.subtotal.toFixed(2).replace('.', ',')}</td>
          <td className="carrinho-td" data-label="Ações">
            <button
              onClick={() => onRemover(item.uuid)}
              className="btn-secondary carrinho-btn-remove"
              data-cy="carrinho-item-remover"
            >
              Remover
            </button>
          </td>
        </tr>
      ))}
    </tbody>
  </table>
);
