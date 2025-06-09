import '../support/commands.js';
import "cypress-mailosaur";
import data from '../fixtures/data.json';
const { faker } = require('@faker-js/faker');

const viewports = ['macbook-15', 'iphone-5'];

viewports.forEach(viewport => {
  describe(`Testes em viewport: ${viewport}`, () => {
    beforeEach(() => {
      cy.viewport(viewport);
      cy.visit('/');
    });

    it("SignUp", () => {
      const email = `test-${Date.now()}@${data.mailosaurServerDomain}`;
      const password = faker.helpers.shuffle([
        faker.string.fromCharacters('ABCDEFGHIJKLMNOPQRSTUVWXYZ'),
        faker.string.fromCharacters('abcdefghijklmnopqrstuvwxyz'),
        faker.string.fromCharacters('0123456789'),
        faker.string.fromCharacters('!@#$'),
        ...faker.string.fromCharacters('ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$', 4).split('')
      ]).join('');

      cy.contains("Sign Up").click();
      cy.get("input[id='first_name']").type(faker.person.firstName());
      cy.get("input[id='last_name']").type(faker.person.lastName());
      cy.get("input[id='company_name']").type(faker.company.name());
      cy.get("input[id='email']").type(email);
      cy.get("input[id='password']").type(password);
      cy.contains("Sign Up").click();
      cy.contains("Check your email", { timeout: 10000 }).should("be.visible");

      // Get email and Click on the link to validate email.
      cy.intercept('POST', '/users/confirmations?confirmation_token=*').as('confirmationRequest');
      cy.mailosaurGetMessage(data.mailosaurServerId, {
        sentTo: email
      }, {
        timeout: 30000
      }).then(email => {
        const html = email.html.body;
        const match = html.match(/https:\/\/staging-fuse-aws\.flatirons\.com\/users\/email_confirmed\/[a-zA-Z0-9]+/);
        expect(match).to.not.be.null;
        const magicLink = match[0];
        cy.visit(magicLink);

        cy.wait('@confirmationRequest').its('response.statusCode').should('eq', 200);
      });
      cy.get('body').then($body => {
        if ($body.find('div.sc-bcXHqe.sc-Rbkqr.NcSfB.kBJuRp').length) {
          cy.get('div.sc-bcXHqe.sc-Rbkqr.NcSfB.kBJuRp').click();
        }
      });
      cy.get('[data-cy="email-confirmed-title"]').should("be.visible");
      cy.writeFile(`cypress/fixtures/login_${viewport}.json`, { email, password });

    });

    it('SignIn', () => {
      cy.get("input[id='email']").type(data.email);
      cy.get("input[id='password']").type(data.password);
      cy.get('[data-cy="SignIn"]').click();
      cy.contains("Create an Importer", { timeout: 10000 }).should("be.visible");
    });

    it('Github Login', () => {
      cy.contains('div', 'Sign in with Github').click();

      cy.origin('https://github.com', { args: { username: data.gh_username, password: data.gh_password } }, ({ username, password }) => {
        Cypress.on('uncaught:exception', () => false);
        cy.get('#login_field').type(username);
        cy.get('#password').type(password);
        cy.get('.btn.btn-primary.btn-block.js-sign-in-button').click();

        cy.get('body').then($body => {
          if ($body.find('.js-oauth-authorize-btn').length) {
            cy.get('.js-oauth-authorize-btn').click();
          }
        });

        Cypress.on('uncaught:exception', () => false);
      });

      cy.contains("Create an Importer", { timeout: 10000 }).should("be.visible");
    });
  });
});
