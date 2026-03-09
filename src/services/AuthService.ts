import authUsersMock from '@/mocks/authUsersMock.json';
import type {
  ILoginPayload,
  ILoginResponse,
  IRegistroClientePayload,
  IRegistroAdminPayload,
} from '@/interfaces/IAuth';
import type { IAdmin } from '@/interfaces/IAdmin';
import { API_ENDPOINTS, USE_MOCK, MOCK_TOKEN_PREFIX } from '@/config/apiConfig';
import { SESSION_STORAGE_KEY } from '@/store/slices/authSlice';
import { ApiClient } from './apiClient';

export class AuthService {
  static async login(payload: ILoginPayload): Promise<ILoginResponse> {
    if (USE_MOCK) {
      // (Mock logic remains same as before)
      console.log('[Mock] Tentando login para:', payload.email);
      const usuario = authUsersMock.usuarios.find(
        (u) => u.email === payload.email && u.senha === payload.senha
      );

      if (!usuario) {
        return Promise.reject(new Error('Credenciais inválidas.'));
      }

      const { senha: _, ...userSemSenha } = usuario; // eslint-disable-line @typescript-eslint/no-unused-vars
      const loginResponse: ILoginResponse = {
        token: `${MOCK_TOKEN_PREFIX}-${usuario.uuid}`,
        user: {
          ...userSemSenha,
          role: userSemSenha.role as 'cliente' | 'admin',
        },
      };

      return new Promise((resolve) => setTimeout(() => resolve(loginResponse), 300));
    }

    const responseData = await ApiClient.post<{ dados: ILoginResponse }>(API_ENDPOINTS.login, payload);
    
    return {
      token: responseData.dados.token || '', // Se o backend retornar no corpo, guardamos no Redux
      user: responseData.dados.user,
    };
  }

  static async getAdmins(): Promise<IAdmin[]> {
    if (USE_MOCK) {
      const admins = authUsersMock.usuarios
        .filter((u) => u.role === 'admin')
        .map(({ senha: _, ...user }) => user as IAdmin); // eslint-disable-line @typescript-eslint/no-unused-vars
      
      return new Promise((resolve) => setTimeout(() => resolve(admins), 300));
    }

    return ApiClient.get<IAdmin[]>(API_ENDPOINTS.registrarAdmin);
  }

  static async registrarCliente(payload: IRegistroClientePayload): Promise<void> {
    if (USE_MOCK) {
      const jaExiste = authUsersMock.usuarios.some((u) => u.email === payload.email);
      if (jaExiste) throw new Error('E-mail já cadastrado.');
      return new Promise((resolve) => setTimeout(resolve, 300));
    }

    await ApiClient.post(API_ENDPOINTS.registrarCliente, payload);
  }

  static async registrarAdmin(payload: IRegistroAdminPayload): Promise<void> {
    if (USE_MOCK) {
      return new Promise((resolve) => setTimeout(resolve, 300));
    }

    await ApiClient.post(API_ENDPOINTS.registrarAdmin, payload);
  }

  /**
   * Restaura a sessão ao recarregar a página.
   * - Mock: lê de sessionStorage (nunca localStorage — U7).
   * - Real backend: chama GET /auth/me; o cookie HttpOnly é enviado automaticamente
   *   pelo browser via credentials: 'include'.
   */
  static async me(): Promise<ILoginResponse | null> {
    if (USE_MOCK) {
      const raw = sessionStorage.getItem(SESSION_STORAGE_KEY);
      if (!raw) return null;
      const session = JSON.parse(raw) as { token: string; user: ILoginResponse['user'] };
      if (!session?.token) return null;
      return { token: session.token, user: session.user };
    }

    try {
      const data = await ApiClient.get<{ dados: ILoginResponse }>(API_ENDPOINTS.me);
      return data.dados;
    } catch {
      return null;
    }
  }
}
