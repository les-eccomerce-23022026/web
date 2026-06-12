'use client';

import { useState, useEffect } from 'react';
import { useAppDispatch } from '../../../store/hooks';
import { criarLivroThunk } from '../../../store/slices/livroSlice';
import { Modal } from '../../Comum/Modal';
import styles from './ModalNovoLivro.module.css';
import {
  calcularPrecoVenda,
  mensagemErroSalvarLivro,
  buildCriarLivroPayload,
} from '../../../pages-react-router/CadastroLivros/CadastrarLivroAdmin/cadastrarLivroValidacao';

const RASCUNHO_KEY = 'novoLivroRascunho';

interface IFormNovoLivro {
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
}

const FORM_INICIAL: IFormNovoLivro = {
  titulo: '',
  autor: '',
  isbn: '',
  estoque: '',
  sinopse: '',
  categoria: '',
  fornecedor: '',
  custo: '',
  grupoPrecificacao: '',
  dataEntrada: new Date().toISOString().split('T')[0],
};

function carregarRascunho(): IFormNovoLivro {
  if (typeof window === 'undefined') return FORM_INICIAL;
  try {
    const salvo = localStorage.getItem(RASCUNHO_KEY);
    if (salvo) return { ...FORM_INICIAL, ...JSON.parse(salvo) };
  } catch {
    /* rascunho inválido, ignora */
  }
  return FORM_INICIAL;
}

interface IModalNovoLivroProps {
  isOpen: boolean;
  onClose: () => void;
  onSalvoComSucesso?: () => void;
}

export function ModalNovoLivro({ isOpen, onClose, onSalvoComSucesso }: IModalNovoLivroProps) {
  const dispatch = useAppDispatch();
  const [form, setForm] = useState<IFormNovoLivro>(FORM_INICIAL);
  const [erro, setErro] = useState<string | null>(null);
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setForm(carregarRascunho());
      setErro(null);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    try {
      localStorage.setItem(RASCUNHO_KEY, JSON.stringify(form));
    } catch {
      /* storage indisponível */
    }
  }, [form, isOpen]);

  const handleFieldChange = (field: keyof IFormNovoLivro, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleLimpar = () => {
    setForm({ ...FORM_INICIAL, dataEntrada: new Date().toISOString().split('T')[0] });
    setErro(null);
    try {
      localStorage.removeItem(RASCUNHO_KEY);
    } catch {
      /* storage indisponível */
    }
  };

  const handleSalvar = async () => {
    const precoVendaCalculado = calcularPrecoVenda(form.custo, form.grupoPrecificacao);
    const erroValidacao = mensagemErroSalvarLivro(form, precoVendaCalculado);
    if (erroValidacao) {
      setErro(erroValidacao);
      return;
    }
    setSalvando(true);
    setErro(null);
    const payload = buildCriarLivroPayload(form, precoVendaCalculado);
    const resultado = await dispatch(criarLivroThunk(payload));
    setSalvando(false);
    if (criarLivroThunk.rejected.match(resultado)) {
      const mensagem = (resultado.error?.message) || 'Erro ao salvar o livro. Tente novamente.';
      setErro(mensagem);
      return;
    }
    try {
      localStorage.removeItem(RASCUNHO_KEY);
    } catch {
      /* storage indisponível */
    }
    onSalvoComSucesso?.();
    onClose();
  };

  const precoVenda = calcularPrecoVenda(form.custo, form.grupoPrecificacao);

  const footer = (
    <div className={styles.footer}>
      <button type="button" onClick={handleLimpar} className={styles.btnLimpar} disabled={salvando}>
        Limpar dados
      </button>
      <div className={styles.footerAcoes}>
        <button type="button" onClick={onClose} className="btn-secondary" disabled={salvando}>
          Cancelar
        </button>
        <button type="button" onClick={handleSalvar} className="btn-primary" disabled={salvando}>
          {salvando ? 'Salvando...' : 'Salvar Novo Livro'}
        </button>
      </div>
    </div>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Cadastrar Novo Livro"
      variant="large"
      footer={footer}
    >
      <div className={styles.corpo}>
        {erro && <div className={styles.erroAlert}>{erro}</div>}

        <section className={styles.secao}>
          <h3 className={styles.secaoTitulo}>1. Informações Básicas</h3>

          <div className={styles.gridDuasColunas}>
            <div className="form-group">
              <label>Título do Livro *</label>
              <input
                type="text"
                placeholder="Ex: Dom Casmurro"
                value={form.titulo}
                onChange={(e) => handleFieldChange('titulo', e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Autor *</label>
              <input
                type="text"
                placeholder="Ex: Machado de Assis"
                value={form.autor}
                onChange={(e) => handleFieldChange('autor', e.target.value)}
              />
            </div>
          </div>

          <div className={styles.gridTresColunas}>
            <div className="form-group">
              <label>ISBN *</label>
              <input
                type="text"
                placeholder="978-..."
                value={form.isbn}
                onChange={(e) => handleFieldChange('isbn', e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Grupo de Precificação *</label>
              <select
                value={form.grupoPrecificacao}
                onChange={(e) => handleFieldChange('grupoPrecificacao', e.target.value)}
                className={styles.select}
              >
                <option value="">Selecione o grupo...</option>
                <option value="Varejo">Varejo (Margem 30%)</option>
                <option value="Atacado">Atacado (Margem 15%)</option>
                <option value="Técnico">Técnico (Margem 40%)</option>
                <option value="Promocional">Promocional (Margem 10%)</option>
              </select>
            </div>
            <div className="form-group">
              <label>Preço de Venda (R$) * [Auto]</label>
              <input
                type="number"
                step="0.01"
                placeholder="Calculado auto."
                value={precoVenda}
                disabled
                className={styles.inputDesabilitado}
              />
            </div>
            <div className="form-group">
              <label>Estoque Inicial *</label>
              <input
                type="number"
                placeholder="0"
                value={form.estoque}
                onChange={(e) => handleFieldChange('estoque', e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Fornecedor (Estoque) *</label>
              <input
                type="text"
                placeholder="Ex: Editora XYZ"
                value={form.fornecedor}
                onChange={(e) => handleFieldChange('fornecedor', e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Custo Unitário (R$) *</label>
              <input
                type="number"
                step="0.01"
                placeholder="0.00"
                value={form.custo}
                onChange={(e) => handleFieldChange('custo', e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Data de Entrada *</label>
              <input
                type="date"
                value={form.dataEntrada}
                onChange={(e) => handleFieldChange('dataEntrada', e.target.value)}
              />
            </div>
          </div>
        </section>

        <section className={styles.secao}>
          <h3 className={styles.secaoTitulo}>2. Classificação e Conteúdo</h3>
          <div className="form-group">
            <label>Categoria Principal</label>
            <input
              type="text"
              placeholder="Ex: Ficção"
              value={form.categoria}
              onChange={(e) => handleFieldChange('categoria', e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>Sinopse *</label>
            <textarea
              rows={4}
              placeholder="Resumo do livro..."
              value={form.sinopse}
              onChange={(e) => handleFieldChange('sinopse', e.target.value)}
            />
          </div>
        </section>
      </div>
    </Modal>
  );
}
