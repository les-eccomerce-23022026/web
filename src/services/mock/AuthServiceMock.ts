import authUsersMock from '@/mocks/authUsersMock.json';
import type {
  IUsuario,
  ILoginPayload,
  ILoginResponse,
  IRegistroClientePayload,
  IRegistroAdminPayload,
} from '@/interfaces/IAuth';
import type { IAdmin } from '@/interfaces/IAdmin';
import { MOCK_TOKEN_PREFIX } from '@/config/apiConfig';
import { SESSION_STORAGE_KEY } from '@/store/slices/authSlice';
import type { IAuthService } from '@/services/contracts/IAuthService';

interface IStoredSession {
  user: IUsuario;
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

function delay<T>(data: T, ms = 300): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(data), ms));
}

export class AuthServiceMock implements IAuthService {
  async login(payload: ILoginPayload): Promise<ILoginResponse> {
    console.log('[Mock] Tentando login para:', payload.email);

    const usuario = authUsersMock.usuarios.find(
      (u) => u.email === payload.email && u.senha === payload.senha,
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

    return delay(loginResponse);
  }

  async getAdmins(): Promise<IAdmin[]> {
    const admins = authUsersMock.usuarios
      .filter((u) => u.role === 'admin')
      .map(({ senha: _, ...user }) => user as IAdmin);

    return delay(admins);
  }

  async registrarCliente(payload: IRegistroClientePayload): Promise<void> {
    const jaExiste = authUsersMock.usuarios.some((u) => u.email === payload.email);
    if (jaExiste) throw new Error('E-mail já cadastrado.');
    return delay(undefined as unknown as void);
  }

  async registrarAdmin(_payload: IRegistroAdminPayload): Promise<void> {
    return delay(undefined as unknown as void);
  }

  async ativarAdmin(_uuid: string): Promise<void> {
    return delay(undefined as unknown as void, 200);
  }

  async inativarAdmin(_uuid: string): Promise<void> {
    return delay(undefined as unknown as void, 200);
  }

  async me(): Promise<ILoginResponse | null> {
    const session = getStoredSession();
    if (!session?.user) return null;
    return { user: session.user };
  }
}
