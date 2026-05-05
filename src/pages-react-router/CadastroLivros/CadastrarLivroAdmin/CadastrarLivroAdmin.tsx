import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppDispatch } from '@/store/hooks';
import { adicionarLivro } from '@/store/slices/livroSlice';
import './CadastrarLivroAdmin.css';
import {
  calcularPrecoVenda,
  mensagemErroSalvarLivro,
  buildNovoLivroFromForm,
} from './cadastrarLivroValidacao';

export const CadastrarLivroAdmin = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    titulo: '',
    autor: '',
    isbn: '',
    estoque: '',
    preco: '',
    sinopse: '',
    categoria: '',
    fornecedor: '', // RN0051
    custo: '', // RN0062
    grupoPrecificacao: '', // RN0013
    dataEntrada: new Date().toISOString().split('T')[0], // RN0064
  });

  const handleFieldChange = (field: string, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    const precoVendaCalculado = calcularPrecoVenda(form.custo, form.grupoPrecificacao);
    const erro = mensagemErroSalvarLivro(form, precoVendaCalculado);
    if (erro) {
      alert(erro);
      return;
    }
    const novoLivro = buildNovoLivroFromForm(form, precoVendaCalculado);
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
              <label>Grupo de Precificação *</label>
              <select 
                value={form.grupoPrecificacao}
                onChange={(e) => handleFieldChange('grupoPrecificacao', e.target.value)}
                style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ddd' }}
              >
                <option value="">Selecione o grupo...</option>
                <option value="Lançamento">Lançamento (Margem 50%)</option>
                <option value="Padrão">Padrão (Margem 35%)</option>
                <option value="Promoção">Promoção (Margem 15%)</option>
              </select>
            </div>
            <div className="form-group">
              <label>Preço de Venda (R$) * [Auto]</label>
              <input 
                type="number" 
                step="0.01" 
                placeholder="Calculado auto." 
                value={calcularPrecoVenda(form.custo, form.grupoPrecificacao)}
                disabled
                style={{ backgroundColor: '#f5f5f5', cursor: 'not-allowed' }}
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
