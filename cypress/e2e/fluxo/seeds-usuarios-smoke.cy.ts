describe('Smoke de seeds SQL de usuários', () => {
  const apiUrl = Cypress.env('apiUrl') || 'http://localhost:5173/api';
  const adminSeedSql = { email: 'admin@livraria.com.br', senha: 'Admin@123' };
  const clienteSeedSql = { email: 'clientetest@email.com', senha: '@asdfJKLÇ123' };
  const clienteEnv = Cypress.env('cliente') as { email?: string; senha?: string } | undefined;

  it('valida login do admin seed (DML 002)', () => {
    cy.request({
      method: 'POST',
      url: `${apiUrl}/auth/login`,
      headers: { 'x-use-test-db': 'true' },
      body: { email: adminSeedSql.email, senha: adminSeedSql.senha },
      failOnStatusCode: false,
    }).then((res) => {
      cy.log(`adminSeed status=${res.status} mensagem=${res.body?.mensagem ?? 'n/a'}`);
      expect(res.status, `admin seed SQL ${adminSeedSql.email} deve autenticar`).to.eq(200);
      expect(res.body?.dados?.user?.email).to.eq(adminSeedSql.email);
    });
  });

  it('valida login do cliente seed (DML 005)', () => {
    if (clienteEnv?.email && clienteEnv.email !== clienteSeedSql.email) {
      cy.log(`cliente env difere do SQL: env=${clienteEnv.email} sql=${clienteSeedSql.email}`);
    }

    cy.request({
      method: 'POST',
      url: `${apiUrl}/auth/login`,
      headers: { 'x-use-test-db': 'true' },
      body: { email: clienteSeedSql.email, senha: clienteSeedSql.senha },
      failOnStatusCode: false,
    }).then((res) => {
      cy.log(`clienteSeed status=${res.status} mensagem=${res.body?.mensagem ?? 'n/a'}`);
      expect(res.status, `cliente seed SQL ${clienteSeedSql.email} deve autenticar`).to.eq(200);
      expect(res.body?.dados?.user?.email).to.eq(clienteSeedSql.email);
    });
  });
});
