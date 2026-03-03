import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppDispatch } from '@/store/hooks';
import { adicionarLivro } from '@/store/slices/livroSlice';
import type { ILivro } from '@/interfaces/ILivro';
import './CadastrarLivroAdmin.css';

export function CadastrarLivroAdmin() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    titulo: '',
    autor: '',
    isbn: '',
    preco: '',
    estoque: '',
    sinopse: '',
    categoria: '',
    fornecedor: '', // RN0051
    custo: '', // RN0062
    dataEntrada: new Date().toISOString().split('T')[0], // RN0064
  });

  const handleFieldChange = (field: string, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    // Validação básica de livro
    if (!form.titulo || !form.autor || !form.isbn || !form.preco) {
      alert('Por favor, preencha todos os campos obrigatórios (*)');
      return;
    }

    // RN0051, RN0062, RN0064 — Validar dados de estoque
    if (!form.fornecedor || !form.custo || !form.dataEntrada) {
      alert('Para dar entrada inicial no estoque, fornecedor, custo e data de entrada são obrigatórios.');
      return;
    }

    // RN0061 — Quantidade mínima > 0 ao entrar em estoque
    const qtdEstoque = parseInt(form.estoque, 10);
    if (isNaN(qtdEstoque) || qtdEstoque <= 0) {
      alert('A quantidade em estoque deve ser maior que zero (0).');
      return;
    }

    // Validação do Custo x Preço (RN0013 baseline)
    const valorCusto = parseFloat(form.custo);
    const valorPreco = parseFloat(form.preco);
    if (valorCusto >= valorPreco) {
      alert('O valor de venda deve ser maior que o valor de custo para gerar margem de lucro.');
      return;
    }

    const novoLivro: ILivro = {
      uuid: `book-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      titulo: form.titulo,
      autor: form.autor,
      isbn: form.isbn,
      preco: valorPreco,
      estoque: qtdEstoque,
      sinopse: form.sinopse,
      status: 'Ativo',
      categoria: form.categoria || 'Geral',
      imagem: 'https://via.placeholder.com/400x600?text=Capa+Indisponivel'
    };

    dispatch(adicionarLivro(novoLivro));
    navigate('/admin/livros');
  };

  return (
    <div className="cadastrar-livro-page">
      <div className="cadastrar-livro-page-header">
        <h3>Cadastrar Novo Livro</h3>
        <Link to="/admin/livros"><button className="btn-secondary">Voltar / Cancelar</button></Link>
      </div>

      <div className="cadastrar-livro-container">
        <div className="card">
          <h3 className="cadastrar-livro-section-title">1. Informações Básicas</h3>

          <div className="cadastrar-livro-grid-author">
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
          
          <div className="cadastrar-livro-grid-3-cols">
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
              <label>Preço de Venda (R$) *</label>
              <input 
                type="number" 
                step="0.01" 
                placeholder="0.00" 
                value={form.preco}
                onChange={(e) => handleFieldChange('preco', e.target.value)}
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
        </div>

        <div className="card">
          <h3 className="cadastrar-livro-section-title">2. Classificação e Conteúdo</h3>
          <div className="form-group">
            <label>Categoria Principal</label>
            <input 
              type="text" 
              placeholder="Ex: Ficção" 
              value={form.categoria}
              onChange={(e) => handleFieldChange('categoria', e.target.value)}
            />
          </div>
          <div className="form-group cadastrar-livro-form-group-spaced">
            <label>Sinopse *</label>
            <textarea 
              rows={5} 
              placeholder="Resumo do livro..."
              value={form.sinopse}
              onChange={(e) => handleFieldChange('sinopse', e.target.value)}
            ></textarea>
          </div>
        </div>

        <div className="cadastrar-livro-actions">
          <button onClick={() => navigate('/admin/livros')} className="btn-secondary cadastrar-livro-action-btn">Cancelar</button>
          <button onClick={handleSave} className="btn-primary cadastrar-livro-action-btn">✅ Salvar Novo Livro</button>
        </div>
      </div>
    </div>
  );
}
