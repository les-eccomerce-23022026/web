import type {
  IUsuario,
  ILoginPayload,
  ILoginResponse,
  IRegistroClientePayload,
  IRegistroAdminPayload,
} from '@/interfaces/IAuth';
import type { IAdmin } from '@/interfaces/IAdmin';
import { API_ENDPOINTS } from '@/config/apiConfig';
import { SESSION_STORAGE_KEY } from '@/store/slices/authSlice';
import { ApiClient } from '@/services/apiClient';
import type { IAuthService } from '@/services/contracts/IAuthService';

interface IStoredSession {
  user: IUsuario;
  token?: string | null;
}

const getStoredSession = (): IStoredSession | null => {
  const raw = sessionStorage.getItem(SESSION_STORAGE_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as IStoredSession;
  } catch {
    sessionStorage.removeItem(SESSION_STORAGE_KEY);
    return null;
  }
};

export class AuthServiceApi implements IAuthService {
  async login(payload: ILoginPayload): Promise<ILoginResponse> {
    const responseData = await ApiClient.post<ILoginResponse>(API_ENDPOINTS.login, payload);
    return {
      token: responseData.token,
      user: responseData.user,
    };
  }

  async getAdmins(): Promise<IAdmin[]> {
    return ApiClient.get<IAdmin[]>(API_ENDPOINTS.listarAdmins);
  }

  async registrarCliente(payload: IRegistroClientePayload): Promise<void> {
    await ApiClient.post(API_ENDPOINTS.registrarCliente, payload);
  }

  async registrarAdmin(payload: IRegistroAdminPayload): Promise<void> {
    await ApiClient.post(API_ENDPOINTS.registrarAdmin, payload);
  }

  async ativarAdmin(uuid: string): Promise<void> {
    await ApiClient.patch(API_ENDPOINTS.ativarAdmin(uuid), {});
  }

  async inativarAdmin(uuid: string): Promise<void> {
    await ApiClient.patch(API_ENDPOINTS.inativarAdmin(uuid), {});
  }

  /**
   * Restaura a sessão via GET /auth/me (cookie HttpOnly enviado automaticamente).
   * Fallback para sessionStorage caso o endpoint falhe.
   */
  async me(): Promise<ILoginResponse | null> {
    try {
      const data = await ApiClient.get<ILoginResponse>(API_ENDPOINTS.me);
      return data;
    } catch {
      const session = getStoredSession();
      if (!session?.user) return null;
      return { user: session.user, token: session.token ?? undefined };
    }
  }
}
