import type { IPayloadAtualizacaoLivro } from '@/interfaces/livroAdmin';

export function validarFormEdicaoLivro(dados: IPayloadAtualizacaoLivro): string | null {
  if (dados.precoVenda !== undefined && dados.precoVenda <= 0) {
    return 'Preço de venda deve ser maior que zero.';
  }
  if (dados.valorCusto !== undefined && dados.valorCusto <= 0) {
    return 'Valor de custo deve ser maior que zero.';
  }
  if (dados.quantidadeEstoque !== undefined && dados.quantidadeEstoque < 0) {
    return 'Quantidade em estoque não pode ser negativa.';
  }
  if (dados.numeroPaginas !== undefined && dados.numeroPaginas <= 0) {
    return 'Número de páginas deve ser maior que zero.';
  }
  if (dados.ano !== undefined && (dados.ano < 1900 || dados.ano > 2100)) {
    return 'Ano deve estar entre 1900 e 2100.';
  }
  return null;
}
