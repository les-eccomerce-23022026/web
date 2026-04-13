type AdminCreds = { email: string; senha: string };
type ClienteCreds = { email: string; senha: string };

function readStringEnv(key: string): string {
  const value = Cypress.env(key);
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new Error(`Cypress.env('${key}') é obrigatório e deve ser string não vazia.`);
  }
  return value.trim();
}

export function getApiUrl(): string {
  return readStringEnv("apiUrl");
}

export function getAdminCreds(): AdminCreds {
  const admin = Cypress.env("admin") as { email?: unknown; senha?: unknown } | undefined;
  if (typeof admin?.email !== "string" || admin.email.trim().length === 0) {
    throw new Error("Cypress.env('admin.email') é obrigatório.");
  }
  if (typeof admin?.senha !== "string" || admin.senha.trim().length === 0) {
    throw new Error("Cypress.env('admin.senha') é obrigatório.");
  }
  return { email: admin.email.trim(), senha: admin.senha.trim() };
}

export function getClienteCreds(): ClienteCreds {
  const cliente = Cypress.env("cliente") as { email?: unknown; senha?: unknown } | undefined;
  if (typeof cliente?.email !== "string" || cliente.email.trim().length === 0) {
    throw new Error("Cypress.env('cliente.email') é obrigatório.");
  }
  if (typeof cliente?.senha !== "string" || cliente.senha.trim().length === 0) {
    throw new Error("Cypress.env('cliente.senha') é obrigatório.");
  }
  return { email: cliente.email.trim(), senha: cliente.senha.trim() };
}

export function getTestBootstrapKey(): string {
  return readStringEnv("testBootstrapKey");
}
