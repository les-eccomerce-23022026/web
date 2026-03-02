import authUsersMock from '@/mocks/authUsersMock.json';
import type {
  ILoginPayload,
  ILoginResponse,
  IRegistroClientePayload,
  IRegistroAdminPayload,
} from '@/interfaces/IAuth';
import type { IAdmin } from '@/interfaces/IAdmin';
import { API_ENDPOINTS, USE_MOCK, MOCK_TOKEN_PREFIX } from '@/config/apiConfig';

export class AuthService {
  static async login(payload: ILoginPayload): Promise<ILoginResponse> {
    if (USE_MOCK) {
      console.log('[Mock] Tentando login para:', payload.email);

      const usuario = authUsersMock.usuarios.find(
        (u) => u.email === payload.email && u.senha === payload.senha
      );

      if (!usuario) {
        return Promise.reject(new Error('Credenciais inválidas.'));
      }

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { senha: _, ...userSemSenha } = usuario;
      const loginResponse: ILoginResponse = {
        token: `${MOCK_TOKEN_PREFIX}-${usuario.uuid}`,
        user: {
          ...userSemSenha,
          role: userSemSenha.role as 'cliente' | 'admin',
        },
      };

      console.log('[Mock] Login bem-sucedido:', loginResponse.user.nome);
      return new Promise((resolve) => setTimeout(() => resolve(loginResponse), 300));
    }

    const response = await fetch(API_ENDPOINTS.login, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) throw new Error('Erro ao realizar login');
    return response.json();
  }

  static async getAdmins(): Promise<IAdmin[]> {
    if (USE_MOCK) {
      console.log('[Mock] Buscando lista de administradores.');
      const admins = authUsersMock.usuarios
        .filter((u) => u.role === 'admin')
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        .map(({ senha: _, ...user }) => user as IAdmin);
      
      return new Promise((resolve) => setTimeout(() => resolve(admins), 300));
    }

    const response = await fetch(API_ENDPOINTS.registrarAdmin); // Assumindo endpoint de listagem se existir
    if (!response.ok) throw new Error('Erro ao buscar administradores');
    return response.json();
  }

  static async registrarCliente(payload: IRegistroClientePayload): Promise<void> {
    if (USE_MOCK) {
      console.log('[Mock] Registrando novo cliente:', payload.email);

      const jaExiste = authUsersMock.usuarios.some((u) => u.email === payload.email);
      if (jaExiste) {
        return Promise.reject(new Error('E-mail já cadastrado.'));
      }

      return new Promise((resolve) => setTimeout(() => resolve(), 300));
    }

    const response = await fetch(API_ENDPOINTS.registrarCliente, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) throw new Error('Erro ao registrar cliente');
  }

  static async registrarAdmin(payload: IRegistroAdminPayload): Promise<void> {
    if (USE_MOCK) {
      console.log('[Mock] Registrando novo administrador:', payload.email);
      return new Promise((resolve) => setTimeout(() => resolve(), 300));
    }

    const response = await fetch(API_ENDPOINTS.registrarAdmin, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) throw new Error('Erro ao registrar administrador');
  }
}
