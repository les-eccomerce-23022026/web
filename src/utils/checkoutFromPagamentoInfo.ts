import type { IPagamentoInfo, IEnderecoCliente, ICartaoSalvoPagamento } from '@/interfaces/pagamento';
import type { ICheckoutInfo, IEnderecoEntrega, ICartaoSalvo } from '@/interfaces/checkout';
import type { ICarrinho } from '@/interfaces/carrinho';

const ENDERECO_FALLBACK: IEnderecoEntrega = {
  logradouro: 'Rua Bela Vista',
  numero: '1234',
  complemento: 'Apto 55',
  cidade: 'São Paulo',
  estado: 'SP',
  cep: '01000-000',
};

function enderecoEntregaDeCliente(primeiro: IEnderecoCliente): IEnderecoEntrega {
  return {
    logradouro: primeiro.logradouro,
    numero: primeiro.numero,
    complemento: primeiro.complemento,
    cidade: primeiro.cidade,
    estado: primeiro.estado,
    cep: primeiro.cep,
  };
}

function mapCartoesCheckout(list: ICartaoSalvoPagamento[]): ICartaoSalvo[] {
  return list.map((c) => ({
    uuid: c.uuid,
    ultimosDigitosCartao: c.ultimosDigitosCartao,
    nomeCliente: c.nomeCliente,
    nomeImpresso: c.nomeImpresso,
    bandeira: c.bandeira,
    validade: c.validade,
    principal: c.principal,
  }));
}

function resumoPedidoDeCarrinho(carrinho: ICarrinho | null) {
  const subtotal = carrinho?.resumo.subtotal ?? 0;
  const frete = carrinho?.resumo.frete ?? 0;
  const quantidadeItens = carrinho?.itens.reduce((acc, item) => acc + item.quantidade, 0) ?? 0;
  return {
    quantidadeItens,
    subtotal,
    frete,
    descontoCupons: 0,
    total: subtotal + frete,
  };
}

export function buildCheckoutInfoFromPagamento(
  infoPagamento: IPagamentoInfo,
  carrinho: ICarrinho | null,
): ICheckoutInfo {
  const primeiro = infoPagamento.enderecosCliente?.[0];
  const enderecoEntrega = primeiro ? enderecoEntregaDeCliente(primeiro) : ENDERECO_FALLBACK;

  return {
    enderecoEntrega,
    enderecosDisponiveis: infoPagamento.enderecosCliente,
    cartoesSalvos: mapCartoesCheckout(infoPagamento.cartoesCliente),
    cuponsDisponiveis: infoPagamento.cuponsDisponiveis,
    freteOpcoes: infoPagamento.freteOpcoes,
    bandeirasPermitidas: infoPagamento.bandeirasPermitidas,
    resumoPedido: resumoPedidoDeCarrinho(carrinho),
  };
}
