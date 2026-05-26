/**
 * Extensões globais para o objeto Window
 * Usado principalmente para flags de teste do Cypress
 */
export {};

declare global {
  interface Window {
    /** Flag definida pelo Cypress para usar banco de dados de teste */
    __USE_TEST_DB__?: boolean;
  }
}
