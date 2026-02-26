import { useState } from 'react';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { logout } from '@/store/slices/authSlice';
import { useNavigate } from 'react-router-dom';
import './MeuPerfil.css';

export function MeuPerfil() {
  const { user } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const [nome, setNome] = useState(user?.nome || '');
  const [senhaAtual, setSenhaAtual] = useState('');
  const [novaSenha, setNovaSenha] = useState('');
  const [message, setMessage] = useState('');

  const handleUpdateProfile = async () => {
    // Simulando PUT /api/clientes/perfil
    try {
      const response = await fetch('/api/clientes/perfil', { method: 'PUT' });
      if (response.ok) {
        setMessage('Dados atualizados com sucesso');
      }
    } catch {
      setMessage('Erro ao atualizar dados');
    }
  };

  const handleChangePassword = async () => {
    // Simulando PUT /api/clientes/senha
    try {
      const response = await fetch('/api/clientes/senha', { method: 'PUT' });
      if (response.ok) {
        setMessage('Senha atualizada com sucesso');
      }
    } catch {
      setMessage('Erro ao atualizar senha');
    }
  };

  const handleDeleteAccount = async () => {
    if (window.confirm('Confirmar Inativação?')) {
      // Simulando DELETE /api/clientes/perfil
      try {
        const response = await fetch('/api/clientes/perfil', { method: 'DELETE' });
        if (response.ok) {
          dispatch(logout());
          navigate('/');
        }
      } catch {
        setMessage('Erro ao inativar conta');
      }
    }
  };

  if (!user) return null;

  return (
    <div className="perfil-page">
      <h1>Meu Perfil</h1>
      {message && <p className="perfil-message">{message}</p>}
      
      <div className="card perfil-section">
        <h2>Atualizar Dados Cadastrais</h2>
        <div className="form-group">
          <label>Nome Completo</label>
          <input type="text" name="nome" value={nome} onChange={(e) => setNome(e.target.value)} />
        </div>
        <div className="form-group">
          <label>CPF</label>
          <input type="text" name="cpf" value={user.cpf} disabled />
        </div>
        <div className="form-group">
          <label>E-mail</label>
          <input type="text" name="email" value={user.email} disabled />
        </div>
        <button className="btn-primary" onClick={handleUpdateProfile}>Atualizar Dados</button>
      </div>

      <div className="card perfil-section">
        <h2>Alterar Senha</h2>
        <div className="form-group">
          <label>Senha Atual</label>
          <input type="password" name="senha_atual" value={senhaAtual} onChange={(e) => setSenhaAtual(e.target.value)} />
        </div>
        <div className="form-group">
          <label>Nova Senha</label>
          <input type="password" name="nova_senha" value={novaSenha} onChange={(e) => setNovaSenha(e.target.value)} />
        </div>
        <button className="btn-secondary" onClick={handleChangePassword}>Alterar Senha</button>
      </div>

      <div className="card perfil-section danger-zone">
        <h2>Zona de Perigo</h2>
        <p>Ao solicitar exclusão, sua conta será inativada e você não poderá mais acessá-la.</p>
        <button className="btn-danger" onClick={handleDeleteAccount}>Solicitar Exclusão da Conta</button>
      </div>
    </div>
  );
}
