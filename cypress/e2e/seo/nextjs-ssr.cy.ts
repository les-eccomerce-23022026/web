/**
 * SEO/SSR validation for Next.js routes
 * Uses cy.request to validate HTML and metadata without full page load
 */

describe('Next.js SSR - SEO Validation', () => {
  const baseUrl = 'http://localhost:3002';

  context('Home page (/)', () => {
    it('should return HTML with books (SSR)', () => {
      cy.request(`${baseUrl}/`).then((response) => {
        expect(response.status).to.equal(200);
        expect(response.headers['content-type']).to.include('text/html');
        const html = response.body;
        expect(html).to.include('1984');
        expect(html).to.include('Duna');
      });
    });
  });

  context('Book detail page (/livro/[uuid])', () => {
    const bookUuid = '1a2b3c4d-5e6f-7890-abcd-ef0123456789';

    it('should return HTML with book details (SSR)', () => {
      cy.request(`${baseUrl}/livro/${bookUuid}`).then((response) => {
        expect(response.status).to.equal(200);
        expect(response.headers['content-type']).to.include('text/html');
        const html = response.body;
        expect(html).to.include('1984');
        expect(html).to.include('George Orwell');
      });
    });
  });

  context('Not found page', () => {
    it('should return 404 for invalid UUID', () => {
      cy.request({
        url: `${baseUrl}/livro/invalid-uuid-12345`,
        failOnStatusCode: false,
      }).then((response) => {
        expect(response.status).to.equal(404);
      });
    });
  });
});
