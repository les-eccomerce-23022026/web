import type { ILivro } from '@/interfaces/ILivro';

type FormCadastro = {
  titulo: string;
  autor: string;
  isbn: string;
  estoque: string;
  sinopse: string;
  categoria: string;
  fornecedor: string;
  custo: string;
  grupoPrecificacao: string;
  dataEntrada: string;
};

export function getMargemByGrupo(grupo: string): number {
  switch (grupo) {
    case 'Lançamento':
      return 0.5;
    case 'Padrão':
      return 0.35;
    case 'Promoção':
      return 0.15;
    default:
      return 0;
  }
}

export function calcularPrecoVenda(custoBase: string, grupo: string): string {
  const c = parseFloat(custoBase);
  if (isNaN(c) || !grupo) return '';
  const margem = getMargemByGrupo(grupo);
  return (c + c * margem).toFixed(2);
}

function erroCamposBasicos(form: FormCadastro, precoVendaCalculado: string): string | null {
  if (!form.titulo || !form.autor || !form.isbn || !precoVendaCalculado) {
    return 'Por favor, preencha todos os campos obrigatórios (*)';
  }
  return null;
}

function erroCamposEstoqueRN(form: FormCadastro): string | null {
  if (!form.fornecedor || !form.custo || !form.dataEntrada || !form.grupoPrecificacao) {
    return 'Grupo de precificação, fornecedor, custo e data de entrada são obrigatórios.';
  }
  return null;
}

function erroQuantidadeEstoque(form: FormCadastro): string | null {
  const qtdEstoque = parseInt(form.estoque, 10);
  if (isNaN(qtdEstoque) || qtdEstoque <= 0) {
    return 'A quantidade em estoque deve ser maior que zero (0).';
  }
  return null;
}

export function mensagemErroSalvarLivro(
  form: FormCadastro,
  precoVendaCalculado: string,
): string | null {
  return (
    erroCamposBasicos(form, precoVendaCalculado) ??
    erroCamposEstoqueRN(form) ??
    erroQuantidadeEstoque(form) ??
    compararCustoPreco(form.custo, precoVendaCalculado)
  );
}

function compararCustoPreco(custo: string, precoVendaCalculado: string): string | null {
  const valorCusto = parseFloat(custo);
  const valorPreco = parseFloat(precoVendaCalculado);
  if (valorCusto >= valorPreco) {
    return 'O valor de venda deve ser maior que o valor de custo para gerar margem de lucro.';
  }
  return null;
}

export function buildNovoLivroFromForm(form: FormCadastro, precoVendaCalculado: string): ILivro {
  const qtdEstoque = parseInt(form.estoque, 10);
  const valorPreco = parseFloat(precoVendaCalculado);
  return {
    uuid: `book-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    titulo: form.titulo,
    autor: form.autor,
    isbn: form.isbn,
    preco: valorPreco,
    estoque: qtdEstoque,
    sinopse: form.sinopse,
    status: 'Ativo',
    categoria: form.categoria || 'Geral',
    imagem: 'https://via.placeholder.com/400x600?text=Capa+Indisponivel',
  };
}
