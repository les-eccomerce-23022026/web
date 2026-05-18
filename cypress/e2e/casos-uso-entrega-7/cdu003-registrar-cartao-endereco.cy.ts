/**
 * CDU003 - Registrar Novo Cartão/Endereço
 * 
 * Caso de Uso: Cliente cadastra novo cartão de crédito ou endereço de entrega
 * Rotas Envolvidas:
 * - POST /api/clientes/perfil/cartoes - Cadastrar Cartão
 * - POST /api/clientes/perfil/enderecos - Cadastrar Endereço
 * 
 * RF0032: Consulta de perfil
 * RN0062: Senha deve ter mínimo 8 caracteres, maiúscula, minúscula, número e caractere especial
 * 
 * Estratégia: API-driven com logs detalhados dos dados retornados
 */

import { apiHeadersTestDb } from '../../support/helpers/checkoutHelpers';

describe('CDU003 - Registrar Novo Cartão/Endereço', () => {
  const apiUrl = (Cypress.env('apiUrl') as string) || 'http://localhost:5173/api';
  const emailCliente = Cypress.env('clienteEmail') || 'clientetest@email.com';
  const senhaCliente = (Cypress.env('clienteSenha') as string) || '@asdfJKLÇ123';

  beforeEach(() => {
    Cypress.env('injectTestDbHeader', true);
  });

  describe('Cadastrar Novo Cartão de Crédito', () => {
    it('deve cadastrar novo cartão de crédito com sucesso', () => {
      cy.log('**Etapa 1: Autenticação do Cliente**');
      cy.loginApi(emailCliente, senhaCliente);

      cy.log('**Etapa 2: Cadastrar novo cartão**');
      const novoCartao = {
        titular: 'Cliente Teste',
        numero: '4111111111111111',
        validade: '12/28',
        cvv: '123'
      };

      cy.request({
        method: 'POST',
        url: `${apiUrl}/clientes/perfil/cartoes`,
        headers: apiHeadersTestDb(),
        body: novoCartao
      }).then((response) => {
        cy.log('**Resposta POST /api/clientes/perfil/cartoes:**');
        cy.log(JSON.stringify(response.body, null, 2));
        expect(response.status).to.equal(201);
        expect(response.body.uuid).to.exist;
        expect(response.body.ultimos4).to.equal('1111');
        expect(response.body.titular).to.equal(novoCartao.titular);
      });
    });

    it('deve listar cartões cadastrados', () => {
      cy.log('**Etapa 1: Autenticação do Cliente**');
      cy.loginApi(emailCliente, senhaCliente);

      cy.log('**Etapa 2: Obter perfil do cliente (inclui cartões)**');
      cy.request({
        method: 'GET',
        url: `${apiUrl}/clientes/perfil`,
        headers: apiHeadersTestDb()
      }).then((response) => {
        cy.log('**Resposta GET /api/clientes/perfil:**');
        cy.log(JSON.stringify(response.body, null, 2));
        expect(response.status).to.equal(200);
        expect(response.body.dados.cartoes).to.be.an('array');
      });
    });
  });

  describe('Cadastrar Novo Endereço', () => {
    it('deve cadastrar novo endereço com sucesso', () => {
      cy.log('**Etapa 1: Autenticação do Cliente**');
      cy.loginApi(emailCliente, senhaCliente);

      cy.log('**Etapa 2: Cadastrar novo endereço**');
      const novoEndereco = {
        rua: 'Rua Nova',
        numero: '456',
        complemento: 'Apto 789',
        bairro: 'Centro',
        cidade: 'São Paulo',
        estado: 'SP',
        cep: '01234567'
      };

      cy.request({
        method: 'POST',
        url: `${apiUrl}/clientes/perfil/enderecos`,
        headers: apiHeadersTestDb(),
        body: novoEndereco
      }).then((response) => {
        cy.log('**Resposta POST /api/clientes/perfil/enderecos:**');
        cy.log(JSON.stringify(response.body, null, 2));
        expect(response.status).to.equal(201);
        expect(response.body.uuid).to.exist;
        expect(response.body.rua).to.equal(novoEndereco.rua);
        expect(response.body.numero).to.equal(novoEndereco.numero);
      });
    });

    it('deve listar endereços cadastrados', () => {
      cy.log('**Etapa 1: Autenticação do Cliente**');
      cy.loginApi(emailCliente, senhaCliente);

      cy.log('**Etapa 2: Obter perfil do cliente (inclui endereços)**');
      cy.request({
        method: 'GET',
        url: `${apiUrl}/clientes/perfil`,
        headers: apiHeadersTestDb()
      }).then((response) => {
        cy.log('**Resposta GET /api/clientes/perfil:**');
        cy.log(JSON.stringify(response.body, null, 2));
        expect(response.status).to.equal(200);
        expect(response.body.dados.enderecos).to.be.an('array');
      });
    });
  });

  describe('Validações de Negócio', () => {
    it('deve rejeitar cadastro de cartão com dados inválidos', () => {
      cy.log('**Etapa 1: Autenticação do Cliente**');
      cy.loginApi(emailCliente, senhaCliente);

      cy.log('**Etapa 2: Tentar cadastrar cartão com número inválido**');
      const cartaoInvalido = {
        titular: 'Cliente Teste',
        numero: '123', // Número muito curto
        validade: '12/28',
        cvv: '123'
      };

      cy.request({
        method: 'POST',
        url: `${apiUrl}/clientes/perfil/cartoes`,
        headers: apiHeadersTestDb(),
        body: cartaoInvalido,
        failOnStatusCode: false
      }).then((response) => {
        cy.log('**Resposta POST /api/clientes/perfil/cartoes (erro esperado):**');
        cy.log(JSON.stringify(response.body, null, 2));
        expect(response.status).to.equal(400);
        expect(response.body.erro).to.exist;
      });
    });

    it('deve rejeitar cadastro de endereço com CEP inválido', () => {
      cy.log('**Etapa 1: Autenticação do Cliente**');
      cy.loginApi(emailCliente, senhaCliente);

      cy.log('**Etapa 2: Tentar cadastrar endereço com CEP inválido**');
      const enderecoInvalido = {
        rua: 'Rua Nova',
        numero: '456',
        complemento: 'Apto 789',
        bairro: 'Centro',
        cidade: 'São Paulo',
        estado: 'SP',
        cep: '123' // CEP muito curto
      };

      cy.request({
        method: 'POST',
        url: `${apiUrl}/clientes/perfil/enderecos`,
        headers: apiHeadersTestDb(),
        body: enderecoInvalido,
        failOnStatusCode: false
      }).then((response) => {
        cy.log('**Resposta POST /api/clientes/perfil/enderecos (erro esperado):**');
        cy.log(JSON.stringify(response.body, null, 2));
        expect(response.status).to.equal(400);
        expect(response.body.erro).to.exist;
      });
    });
  });
});
