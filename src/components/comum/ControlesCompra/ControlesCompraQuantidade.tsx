import { ShoppingCart, Plus, Minus } from 'lucide-react';
type Props = {
  variant: 'card' | 'detalhes';
  quantidade: number;
  onDiminuir: (e: React.MouseEvent) => void;
  onAumentar: (e: React.MouseEvent) => void;
};

export const ControlesCompraQuantidade = ({
  variant,
  quantidade,
  onDiminuir,
  onAumentar,
}: Props) => {
  const iconSize = variant === 'card' ? 14 : 18;
  const cartSize = variant === 'card' ? 16 : 20;

  return (
    <div className="controles-compra__ctrl-qtd">
      <button
        className="ctrl-qtd__btn"
        onClick={onDiminuir}
        title="Diminuir quantidade"
        disabled={quantidade === 0}
      >
        <Minus size={iconSize} />
      </button>
      <span className="ctrl-qtd__icone">
        <ShoppingCart size={cartSize} />
        {quantidade > 0 && <span className="ctrl-qtd__valor">{quantidade}</span>}
      </span>
      <button
        className="ctrl-qtd__btn"
        onClick={onAumentar}
        title="Aumentar quantidade"
      >
        <Plus size={iconSize} />
      </button>
    </div>
  );
};
