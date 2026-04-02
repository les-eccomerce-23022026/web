import type { IAdminFormState } from '@/interfaces/IAdmin';

type Ctx = {
  isAuthenticated: boolean;
  userRole: string | undefined;
  editingAdmin: unknown;
  form: IAdminFormState;
};

function mensagemSeAuthInvalida(isAuthenticated: boolean, userRole: string | undefined): string | null {
  if (!isAuthenticated || userRole !== 'admin') {
    return 'Você precisa estar autenticado para gerenciar administradores.';
  }
  return null;
}

function mensagemSeNovoAdminInvalido(form: IAdminFormState): string | null {
  if (!form.nome || !form.cpf || !form.email) {
    return 'Por favor, preencha todos os campos obrigatórios.';
  }
  if (form.usarMesmaSenha) {
    return null;
  }
  if (!form.senha) {
    return 'Por favor, defina uma senha para o administrador.';
  }
  if (form.senha !== form.confirmacaoSenha) {
    return 'As senhas não conferem.';
  }
  return null;
}

export function mensagemSeSalvarInvalido(ctx: Ctx): string | null {
  const auth = mensagemSeAuthInvalida(ctx.isAuthenticated, ctx.userRole);
  if (auth) return auth;
  if (ctx.editingAdmin) return null;
  return mensagemSeNovoAdminInvalido(ctx.form);
}
