import data from '../fixtures/data.json';
import 'cypress-iframe';

const getTodayDateFormatted = () => {
  const today = new Date();
  const month = today.getMonth() + 1; // Months are 0-indexed
  const day = today.getDate();
  const year = today.getFullYear();
  return `${month}/${day}/${year}`;
};

const todayDate = getTodayDateFormatted();
let foundMatchingRow = false

const viewports = ['macbook-15', 'iphone-5'];

viewports.forEach(viewport => {
  describe(`Testes em viewport: ${viewport}`, () => {
    let userCredentials;

    before(() => {
      cy.fixture(`login_${viewport}.json`).then((credentials) => {
        userCredentials = credentials;
      });
    });

    beforeEach(() => {
      cy.viewport(viewport);
      cy.visit('/');
      cy.get("input[id='email']").type(userCredentials.email);
      cy.get("input[id='password']").type(userCredentials.password);
      cy.get('[data-cy="SignIn"]').click();
      cy.contains("Create an Importer", { timeout: 10000 }).should("be.visible");
      cy.visit('/account/billing');
    });

    describe("Register Professional Plan", () => {
      it("Register Payment Method", () => {
        cy.get(':nth-child(2) > .kLSfRE > [data-cy="planButton"]').click({ force: true, timeout: 10000 });
        cy.get('input[data-cy="html-input"][placeholder="Enter the card holder"]').type(data.name);
        cy.get('input[data-cy="html-input"][placeholder="Enter your email"]').type(data.email);
        cy.get('input[data-cy="html-input"][placeholder="Enter your phone number"]').type(data.phone);

        cy.frameLoaded('iframe[title="Secure card payment input frame"]');
        cy.iframe('iframe[title="Secure card payment input frame"]').find('input[name="cardnumber"]').type(data.cardNumber);
        cy.iframe('iframe[title="Secure card payment input frame"]').find('input[name="exp-date"]').type(data.cardExpiration);
        cy.iframe('iframe[title="Secure card payment input frame"]').find('input[name="cvc"]').type(data.cardCvv);

        cy.contains('Upgrade Plan').click();
        cy.contains('Payment Method successfully changed', { timeout: 10000 }).should('be.visible');

        cy.get('[data-test-id="table-view-wrapper"]', { timeout: 10000 })
          .within(() => {
            cy.get('[data-test-id^="row-"]').each(($row) => {
              cy.wrap($row).contains(todayDate).then(($dateElement) => {
                if ($dateElement) {
                  cy.wrap($row).contains('p', 'paid').then(($paidElement) => {
                    if ($paidElement) {
                      foundMatchingRow = true;
                    }
                  });
                }
              });
            }).then(() => {
              expect(foundMatchingRow).to.be.true;
            });
          });
      });
    });
  });
});