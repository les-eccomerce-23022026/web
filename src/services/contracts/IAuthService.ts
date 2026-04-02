import type {
  ILoginPayload,
  ILoginResponse,
  IRegistroClientePayload,
  IRegistroAdminPayload,
} from '@/interfaces/IAuth';
import type { IAdmin } from '@/interfaces/IAdmin';

export interface IAuthService {
  login(payload: ILoginPayload): Promise<ILoginResponse>;
  /** Encerra sessão no servidor (cookie HttpOnly). No-op no mock. */
  logout(): Promise<void>;
  getAdmins(): Promise<IAdmin[]>;
  registrarCliente(payload: IRegistroClientePayload): Promise<void>;
  registrarAdmin(payload: IRegistroAdminPayload): Promise<void>;
  ativarAdmin(uuid: string): Promise<void>;
  inativarAdmin(uuid: string): Promise<void>;
  me(): Promise<ILoginResponse | null>;
}
