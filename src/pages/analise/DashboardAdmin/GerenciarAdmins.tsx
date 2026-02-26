import { useState } from 'react';
import { LayoutDashboard } from 'lucide-react';
import { Link } from 'react-router-dom';
import styles from './GerenciarAdmins.module.css';

export function GerenciarAdmins() {
  const [showNovoAdmin, setShowNovoAdmin] = useState(false);
  const [adminNome, setAdminNome] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [adminSenha, setAdminSenha] = useState('');
  const [message, setMessage] = useState('');

  const handleCreateAdmin = async () => {
    try {
      const response = await fetch('/api/admin/registro', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome: adminNome, email: adminEmail, senha: adminSenha, role: 'admin' })
      });
      if (response.ok) {
        setMessage('Administrador cadastrado com sucesso.');
        setShowNovoAdmin(false);
      }
    } catch {
      setMessage('Erro ao cadastrar administrador.');
    }
  };

  return (
    <div className={styles['admin-dashboard']}>
      <div className={styles['header-admin']}>
        <div className={styles['header-admin-title']}>
          <h2>Gerenciar Administradores</h2>
        </div>
        <Link to="/"><button className="btn-secondary">Sair do Painel</button></Link>
      </div>
      <div className={styles['dashboard-grid']}>
        <aside className={styles['sidebar-admin']}>
          <ul>
            <li className={styles['sidebar-group-title']}>Menu Principal</li>
            <li>
              <Link to="/admin" className={styles['sidebar-link']}>
                <LayoutDashboard size={18} /> Dashboard Analytics
              </Link>
            </li>
            <li className={styles['active-admin']}>
              <Link to="/admin/administradores" className={`${styles['sidebar-link']} ${styles['active']}`}>
                ⚙️ Gerenciar Administradores
              </Link>
            </li>
          </ul>
        </aside>
        
        <div className={styles['content-admin']}>
          {message && <p className={styles['admin-message-success']}>{message}</p>}
          {!showNovoAdmin ? (
            <div>
              <button className="btn-primary" onClick={() => setShowNovoAdmin(true)}>Novo Administrador</button>
            </div>
          ) : (
            <div className={`card ${styles['admin-novo-card']}`}>
              <h3>Cadastrar Novo Administrador</h3>
              <div className="form-group">
                <label>Nome</label>
                <input name="adminNome" type="text" value={adminNome} onChange={(e) => setAdminNome(e.target.value)} />
              </div>
              <div className="form-group">
                <label>E-mail Corporativo</label>
                <input name="adminEmail" type="email" value={adminEmail} onChange={(e) => setAdminEmail(e.target.value)} />
              </div>
              <div className="form-group">
                <label>Senha de Acesso</label>
                <input name="adminSenha" type="password" value={adminSenha} onChange={(e) => setAdminSenha(e.target.value)} />
              </div>
              <div className={styles['admin-form-actions']}>
                <button className="btn-primary" onClick={handleCreateAdmin}>Salvar Administrador</button>
                <button className="btn-secondary" onClick={() => setShowNovoAdmin(false)}>Cancelar</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
