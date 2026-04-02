import { Eye, EyeOff } from 'lucide-react';
import styles from './GerenciarAdmins.module.css';
import type { IAdminFormState } from '@/interfaces/IAdmin';

type Props = {
  form: IAdminFormState;
  showPassword: boolean;
  setShowPassword: (v: boolean) => void;
  onFieldChange: (field: keyof IAdminFormState, value: string | boolean) => void;
};

export const GerenciarAdminsFormNovoAdminCampos = ({
  form,
  showPassword,
  setShowPassword,
  onFieldChange,
}: Props) => (
  <>
    <div className="form-group">
      <label>CPF</label>
      <input
        name="cpf"
        type="text"
        placeholder="000.000.000-00"
        value={form.cpf}
        onChange={(e) => onFieldChange('cpf', e.target.value)}
      />
    </div>

    <div
      className="form-group"
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: '8px',
        marginBottom: '15px',
      }}
    >
      <input
        id="usarMesmaSenha"
        name="usarMesmaSenha"
        type="checkbox"
        checked={form.usarMesmaSenha}
        onChange={(e) => onFieldChange('usarMesmaSenha', e.target.checked)}
      />
      <label htmlFor="usarMesmaSenha" style={{ marginBottom: 0, cursor: 'pointer' }}>
        Usar mesma senha se já for cliente
      </label>
    </div>

    {!form.usarMesmaSenha && (
      <>
        <div className="form-group">
          <label>Senha Provisória</label>
          <div className={styles.passwordWrapper}>
            <input
              name="senha"
              type={showPassword ? 'text' : 'password'}
              className={styles.passwordInput}
              value={form.senha}
              onChange={(e) => onFieldChange('senha', e.target.value)}
            />
            <button
              type="button"
              className={styles.passwordToggle}
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        <div className="form-group">
          <label>Confirmar Senha</label>
          <div className={styles.passwordWrapper}>
            <input
              name="confirmacaoSenha"
              type={showPassword ? 'text' : 'password'}
              className={styles.passwordInput}
              value={form.confirmacaoSenha}
              onChange={(e) => onFieldChange('confirmacaoSenha', e.target.value)}
            />
          </div>
        </div>
      </>
    )}
  </>
);
