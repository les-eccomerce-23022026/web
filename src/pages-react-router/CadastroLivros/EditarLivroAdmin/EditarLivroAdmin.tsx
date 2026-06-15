'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ApiClient } from '@/services/apiClient';
import { API_ENDPOINTS } from '@/config/apiConfig';
import type {
  ILivroAdminDetalhe,
  IPayloadAtualizacaoLivro,
  IResultadoAtualizacaoLivro,
} from '@/interfaces/livroAdmin';
import { validarFormEdicaoLivro } from './editarLivroValidacao';
import './EditarLivroAdmin.css';

interface IEditarLivroAdminProps {
  uuid: string;
}

export function EditarLivroAdmin({ uuid }: IEditarLivroAdminProps) {
  const router = useRouter();

  const [livro, setLivro] = useState<ILivroAdminDetalhe | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [aprovacaoPendente, setAprovacaoPendente] = useState<string | null>(null);
  const [form, setForm] = useState<IPayloadAtualizacaoLivro>({});

  useEffect(() => {
    async function carregarLivro() {
      try {
        setCarregando(true);
        setErro(null);
        const dados = await ApiClient.get<ILivroAdminDetalhe>(
          API_ENDPOINTS.obterDetalhesLivro(uuid),
        );
        setLivro(dados);
        setForm({
          titulo: dados.titulo,
          sinopse: dados.sinopse,
          imagemUrl: dados.imagemUrl,
          ano: dados.ano,
          edicao: dados.edicao,
          numeroPaginas: dados.numeroPaginas,
          altura: dados.altura,
          largura: dados.largura,
          peso: dados.peso,
          profundidade: dados.profundidade,
          codigoBarras: dados.codigoBarras,
          quantidadeEstoque: dados.quantidadeEstoque,
          precoVenda: dados.precoVenda,
          valorCusto: dados.valorCusto,
        });
      } catch (e: unknown) {
        const mensagem = e instanceof Error ? e.message : 'Erro ao carregar livro.';
        setErro(mensagem);
      } finally {
        setCarregando(false);
      }
    }

    carregarLivro();
  }, [uuid]);

  function handleTextField(campo: keyof IPayloadAtualizacaoLivro, valor: string) {
    setForm(prev => ({ ...prev, [campo]: valor }));
  }

  function handleNumberField(campo: keyof IPayloadAtualizacaoLivro, valor: string) {
    const numero = valor === '' ? undefined : Number(valor);
    setForm(prev => ({ ...prev, [campo]: numero }));
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const erroValidacao = validarFormEdicaoLivro(form);
    if (erroValidacao) {
      alert(erroValidacao);
      return;
    }

    const payload: IPayloadAtualizacaoLivro = Object.fromEntries(
      Object.entries(form).filter(([, v]) => v !== undefined),
    ) as IPayloadAtualizacaoLivro;

    try {
      setSalvando(true);
      setErro(null);
      setAprovacaoPendente(null);

      const resultado = await ApiClient.patch<IResultadoAtualizacaoLivro>(
        API_ENDPOINTS.atualizarLivro(uuid),
        payload,
      );

      if (resultado.aprovacaoNecessaria === true) {
        setAprovacaoPendente(
          resultado.mensagem ??
            'Alteração enviada para aprovação. O livro será atualizado após revisão.',
        );
        return;
      }

      if (resultado.sucesso) {
        router.push('/admin/livros');
      }
    } catch (e: unknown) {
      const mensagem = e instanceof Error ? e.message : 'Erro ao salvar livro.';
      setErro(mensagem);
    } finally {
      setSalvando(false);
    }
  }

  if (carregando) {
    return (
      <div className="editar-livro-page">
        <p>Carregando livro...</p>
      </div>
    );
  }

  if (erro && !livro) {
    return (
      <div className="editar-livro-page">
        <p>{erro}</p>
      </div>
    );
  }

  return (
    <div className="editar-livro-page">
      <div className="editar-livro-header">
        <h3>Editar Livro</h3>
        <Link href="/admin/livros">
          <button type="button" className="btn-secondary">
            Voltar / Cancelar
          </button>
        </Link>
      </div>

      {aprovacaoPendente && (
        <div data-cy="editar-livro-aprovacao-pendente" className="alerta-aprovacao">{aprovacaoPendente}</div>
      )}

      {erro && <div data-cy="editar-livro-erro" className="alerta-aprovacao" style={{ borderColor: '#c62828', backgroundColor: '#ffebee', color: '#b71c1c' }}>{erro}</div>}

      <form data-cy="editar-livro-form" onSubmit={handleSubmit}>
        <div className="editar-livro-container">
          <div className="card">
            <h4 className="editar-livro-section-title">1. Informações Básicas</h4>

            <div className="form-group">
              <label htmlFor="titulo">Título</label>
              <input
                id="titulo"
                data-cy="editar-livro-titulo"
                type="text"
                className="form-control"
                value={form.titulo ?? ''}
                onChange={e => handleTextField('titulo', e.target.value)}
              />
            </div>

            <div className="editar-livro-grid" style={{ marginTop: 16 }}>
              <div className="form-group">
                <label htmlFor="autor">Autor</label>
                <input
                  id="autor"
                  type="text"
                  className="form-control campo-readonly"
                  value={livro?.autor ?? ''}
                  disabled
                />
              </div>

              <div className="form-group">
                <label htmlFor="isbn">ISBN</label>
                <input
                  id="isbn"
                  data-cy="editar-livro-isbn-readonly"
                  type="text"
                  className="form-control campo-readonly"
                  value={livro?.isbn ?? ''}
                  disabled
                />
              </div>

              <div className="form-group">
                <label htmlFor="categoria">Categoria</label>
                <input
                  id="categoria"
                  type="text"
                  className="form-control campo-readonly"
                  value={livro?.categoria ?? ''}
                  disabled
                />
              </div>

              <div className="form-group">
                <label htmlFor="grupoPrecificacao">Grupo de Precificacao</label>
                <input
                  id="grupoPrecificacao"
                  type="text"
                  className="form-control campo-readonly"
                  value={livro?.grupoPrecificacao ?? ''}
                  disabled
                />
              </div>
            </div>

            <div className="form-group" style={{ marginTop: 16 }}>
              <label htmlFor="sinopse">Sinopse</label>
              <textarea
                id="sinopse"
                className="form-control"
                rows={4}
                value={form.sinopse ?? ''}
                onChange={e => handleTextField('sinopse', e.target.value)}
              />
            </div>

            <div className="editar-livro-grid" style={{ marginTop: 16 }}>
              <div className="form-group">
                <label htmlFor="imagemUrl">URL da Imagem</label>
                <input
                  id="imagemUrl"
                  type="text"
                  className="form-control"
                  value={form.imagemUrl ?? ''}
                  onChange={e => handleTextField('imagemUrl', e.target.value)}
                />
              </div>

              <div className="form-group">
                <label htmlFor="codigoBarras">Codigo de Barras</label>
                <input
                  id="codigoBarras"
                  type="text"
                  className="form-control"
                  value={form.codigoBarras ?? ''}
                  onChange={e => handleTextField('codigoBarras', e.target.value)}
                />
              </div>

              <div className="form-group">
                <label htmlFor="ano">Ano</label>
                <input
                  id="ano"
                  type="number"
                  className="form-control"
                  value={form.ano ?? ''}
                  onChange={e => handleNumberField('ano', e.target.value)}
                />
              </div>

              <div className="form-group">
                <label htmlFor="edicao">Edicao</label>
                <input
                  id="edicao"
                  type="text"
                  className="form-control"
                  value={form.edicao ?? ''}
                  onChange={e => handleTextField('edicao', e.target.value)}
                />
              </div>

              <div className="form-group">
                <label htmlFor="numeroPaginas">N Paginas</label>
                <input
                  id="numeroPaginas"
                  type="number"
                  className="form-control"
                  value={form.numeroPaginas ?? ''}
                  onChange={e => handleNumberField('numeroPaginas', e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="card">
            <h4 className="editar-livro-section-title">2. Dimensoes Fisicas</h4>

            <div className="editar-livro-grid-3">
              <div className="form-group">
                <label htmlFor="altura">Altura (cm)</label>
                <input
                  id="altura"
                  type="number"
                  step="0.1"
                  className="form-control"
                  value={form.altura ?? ''}
                  onChange={e => handleNumberField('altura', e.target.value)}
                />
              </div>

              <div className="form-group">
                <label htmlFor="largura">Largura (cm)</label>
                <input
                  id="largura"
                  type="number"
                  step="0.1"
                  className="form-control"
                  value={form.largura ?? ''}
                  onChange={e => handleNumberField('largura', e.target.value)}
                />
              </div>

              <div className="form-group">
                <label htmlFor="profundidade">Profundidade (cm)</label>
                <input
                  id="profundidade"
                  type="number"
                  step="0.1"
                  className="form-control"
                  value={form.profundidade ?? ''}
                  onChange={e => handleNumberField('profundidade', e.target.value)}
                />
              </div>

              <div className="form-group">
                <label htmlFor="peso">Peso (g)</label>
                <input
                  id="peso"
                  type="number"
                  step="0.1"
                  className="form-control"
                  value={form.peso ?? ''}
                  onChange={e => handleNumberField('peso', e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="card">
            <h4 className="editar-livro-section-title">3. Estoque e Precos</h4>

            <div className="editar-livro-grid-3">
              <div className="form-group">
                <label htmlFor="quantidadeEstoque">Estoque</label>
                <input
                  id="quantidadeEstoque"
                  data-cy="editar-livro-estoque"
                  type="number"
                  className="form-control"
                  value={form.quantidadeEstoque ?? ''}
                  onChange={e => handleNumberField('quantidadeEstoque', e.target.value)}
                />
              </div>

              <div className="form-group">
                <label htmlFor="precoVenda">Preco de Venda (R$)</label>
                <input
                  id="precoVenda"
                  data-cy="editar-livro-preco-venda"
                  type="number"
                  step="0.01"
                  className="form-control"
                  value={form.precoVenda ?? ''}
                  onChange={e => handleNumberField('precoVenda', e.target.value)}
                />
              </div>

              <div className="form-group">
                <label htmlFor="valorCusto">Custo (R$)</label>
                <input
                  id="valorCusto"
                  data-cy="editar-livro-valor-custo"
                  type="number"
                  step="0.01"
                  className="form-control"
                  value={form.valorCusto ?? ''}
                  onChange={e => handleNumberField('valorCusto', e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="editar-livro-actions">
            <Link href="/admin/livros">
              <button type="button" className="btn-secondary editar-livro-action-btn">
                Cancelar
              </button>
            </Link>
            <button
              data-cy="editar-livro-salvar-btn"
              type="submit"
              className="btn-primary editar-livro-action-btn"
              disabled={salvando}
            >
              {salvando ? 'Salvando...' : 'Salvar Alteracoes'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
