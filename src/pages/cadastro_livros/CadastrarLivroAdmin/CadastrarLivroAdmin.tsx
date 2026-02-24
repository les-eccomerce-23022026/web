import { Link } from 'react-router-dom';
import './CadastrarLivroAdmin.css';

export function CadastrarLivroAdmin() {
  return (
    <div className="admin-page cadastrar-livro-admin">
      <div className="header-admin cadastrar-livro-header">
        <h2>Cadastrar Novo Livro</h2>
        <Link to="/admin/livros"><button className="btn-secondary">Voltar / Cancelar</button></Link>
      </div>

      <div className="cadastrar-livro-container">
        <div className="card">
          <h3 className="cadastrar-livro-section-title">1. Informações Básicas</h3>
          
          <div className="cadastrar-livro-grid-author">
             <div className="form-group">
                <label>Título do Livro *</label>
                <input type="text" placeholder="Ex: Dom Casmurro" />
             </div>
             <div className="form-group">
                <label>Autor *</label>
                <input type="text" placeholder="Ex: Machado de Assis" />
             </div>
          </div>
          <div className="cadastrar-livro-grid-4-cols">
             <div className="form-group">
                <label>Editora *</label>
                <input type="text" placeholder="Nome da editora" />
             </div>
             <div className="form-group">
                <label>Ano de Lançamento *</label>
                <input type="number" placeholder="2023" />
             </div>
             <div className="form-group">
                <label>Edição *</label>
                <input type="text" placeholder="Ex: 3ª Edição" />
             </div>
             <div className="form-group">
                <label>Número de Páginas</label>
                <input type="number" placeholder="0" />
             </div>
          </div>
        </div>

        <div className="card">
          <h3 className="cadastrar-livro-section-title">2. Identificadores e Precificação</h3>
          
          <div className="cadastrar-livro-grid-4-cols">
             <div className="form-group">
                <label>ISBN *</label>
                <input type="text" placeholder="978-..." />
             </div>
             <div className="form-group cadastrar-livro-span-2">
                <label>Código de Barras *</label>
                <input type="text" placeholder="13 dígitos" />
             </div>
             <div className="form-group">
                <label>Grupo de Precificação *</label>
                <select defaultValue="">
                   <option value="" disabled>Selecione...</option>
                   <option value="a">A (Margem 30%)</option>
                   <option value="b">B (Margem 45%)</option>
                </select>
             </div>
          </div>
          <div className="form-group cadastrar-livro-form-group-spaced">
             <label>Categoria (Pode selecionar várias)</label>
             <input type="text" placeholder="Digite as categorias separadas por vírgula. Ex: Fantasia,Aventura" />
          </div>
        </div>

        <div className="card">
          <h3 className="cadastrar-livro-section-title">3. Descrição Física e Sinopse</h3>
          <div className="cadastrar-livro-grid-4-cols">
             <div className="form-group"><label>Altura (cm) *</label><input type="number" placeholder="0.0" /></div>
             <div className="form-group"><label>Largura (cm) *</label><input type="number" placeholder="0.0" /></div>
             <div className="form-group"><label>Profundidade (cm)*</label><input type="number" placeholder="0.0" /></div>
             <div className="form-group"><label>Peso (kg) *</label><input type="number" placeholder="0.0" /></div>
          </div>
          <div className="form-group cadastrar-livro-form-group-spaced">
             <label>Sinopse *</label>
             <textarea rows={5} placeholder="Resumo do livro..."></textarea>
          </div>
        </div>

        <div className="cadastrar-livro-actions">
           <Link to="/admin/livros"><button className="btn-secondary cadastrar-livro-action-btn">Cancelar</button></Link>
           <button className="btn-primary cadastrar-livro-action-btn">✅ Salvar Novo Livro</button>
        </div>
      </div>
    </div>
  );
}
