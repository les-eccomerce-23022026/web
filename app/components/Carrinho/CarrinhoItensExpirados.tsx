/**
 * Componente para exibir itens expirados do carrinho
 * Implementa RN0044 + RNF0042 - Restrições de tempo no carrinho
 */

import type { IItemCarrinhoExpirado } from '@/interfaces/carrinho';

interface CarrinhoItensExpiradosProps {
  itensExpirados: IItemCarrinhoExpirado[];
}

export const CarrinhoItensExpirados = ({ itensExpirados }: CarrinhoItensExpiradosProps) => {
  if (itensExpirados.length === 0) {
    return null;
  }

  return (
    <div className="carrinho-itens-expirados" data-cy="carrinho-itens-expirados">
      <div className="carrinho-expirados-header">
        <h3 className="carrinho-expirados-titulo">Itens Removidos por Tempo Esgotado</h3>
        <p className="carrinho-expirados-mensagem">
          Os itens abaixo foram removidos do seu carrinho porque o tempo de reserva do estoque expirou.
          Adicione-os novamente para continuar com a compra.
        </p>
      </div>

      <div className="carrinho-expirados-lista">
        {itensExpirados.map((item) => (
          <div
            key={item.uuid}
            className="carrinho-expirado-item"
            data-cy="carrinho-item-expirado"
          >
            <div className="carrinho-expirado-imagem">
              <img src={item.imagem} alt={item.titulo} />
            </div>
            
            <div className="carrinho-expirado-info">
              <h4 className="carrinho-expirado-titulo">{item.titulo}</h4>
              <p className="carrinho-expirado-isbn">ISBN: {item.isbn}</p>
              <p className="carrinho-expirado-preco">
                Preço: R$ {item.precoUnitario.toFixed(2).replace('.', ',')}
              </p>
              <p className="carrinho-expirado-quantidade">
                Quantidade: {item.quantidade}
              </p>
              <p className="carrinho-expirado-motivo">
                Motivo: {item.motivoExpiracao}
              </p>
            </div>

            <div className="carrinho-expirado-acao">
              <button
                className="btn-secondary carrinho-expirado-botao"
                disabled
                data-cy="carrinho-expirado-botao-adicionar"
              >
                Adicionar Novamente
              </button>
              <p className="carrinho-expirado-aviso">
                Botão desabilitado - estoque liberado
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
