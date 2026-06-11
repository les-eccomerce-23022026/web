import Link from 'next/link';
import type { IFreteOpcao } from '@/interfaces/entrega';
import { FreteCalculo, type FreteCalculoEntregaApi } from '@/components/FinalizarCompra/Entrega';
import { ROTAS } from '@/config/rotas';

interface CarrinhoResumoProps {
  subtotal: number;
  frete: number;
  total: number;
  entrega: FreteCalculoEntregaApi;
  freteSelecionado?: IFreteOpcao | null;
  onFreteSelecionado: (opcao: IFreteOpcao) => void;
}

export const CarrinhoResumo = ({
  subtotal,
  frete,
  total,
  entrega,
  freteSelecionado,
  onFreteSelecionado,
}: CarrinhoResumoProps) => (
  <div className="resumo carrinho-resumo" data-cy="carrinho-resumo">
    <div className="frete carrinho-frete">
      <FreteCalculo
        entrega={entrega}
        onFreteSelecionado={onFreteSelecionado}
        freteSelecionado={freteSelecionado}
        pesoTotal={1}
        valorTotal={subtotal}
      />
      {freteSelecionado && (
        <p className="carrinho-frete-selecionado">
          ✓ Frete {freteSelecionado.tipo} selecionado: R${' '}
          {freteSelecionado.valor.toFixed(2).replace('.', ',')} — {freteSelecionado.prazo}
        </p>
      )}
    </div>

    <div className="totalizador carrinho-totalizador" data-cy="carrinho-totalizador">
      <p data-cy="carrinho-subtotal">Subtotal: R$ {subtotal.toFixed(2).replace('.', ',')}</p>
      <p data-cy="carrinho-frete">Frete: R$ {frete.toFixed(2).replace('.', ',')}</p>
      <hr className="carrinho-total-separator" />
      <h2 className="carrinho-total-header" data-cy="carrinho-total">Total: R$ {total.toFixed(2).replace('.', ',')}</h2>

      <Link href={ROTAS.CHECKOUT}>
        <button
          className="btn-primary carrinho-btn-finalizar"
          data-cy="carrinho-finalizar-compra"
        >
          Finalizar Compra
        </button>
      </Link>
    </div>
  </div>
);
