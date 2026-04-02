import type {
  ILoginPayload,
  ILoginResponse,
  IRegistroClientePayload,
  IRegistroAdminPayload,
} from '@/interfaces/auth';
import type { IAdmin } from '@/interfaces/admin';
import { API_ENDPOINTS } from '@/config/apiConfig';
import { ApiClient } from '@/services/apiClient';
import type { IAuthService } from '@/services/contracts/authService';

export class AuthServiceApi implements IAuthService {
  async login(payload: ILoginPayload): Promise<ILoginResponse> {
    const responseData = await ApiClient.post<ILoginResponse>(API_ENDPOINTS.login, payload);
    return {
      token: responseData.token,
      user: responseData.user,
    };
  }

  async logout(): Promise<void> {
    await ApiClient.post(API_ENDPOINTS.logout, {});
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
   * Restaura a sessão via GET /auth/me com cookie HttpOnly (credentials).
   */
  async me(): Promise<ILoginResponse | null> {
    const data = await ApiClient.get<ILoginResponse>(API_ENDPOINTS.me);
    return data;
  }
}
