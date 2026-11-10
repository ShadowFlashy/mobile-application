import { mount } from 'cypress/react18';
// Initialise translations (English) exactly like the app does.
import '../../src/i18n';
// LIVERY fonts under the registered family names (F2, SPEC §7.12).
import './fonts.css';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Cypress {
    interface Chainable {
      mount: typeof mount;
    }
  }
}

Cypress.Commands.add('mount', mount);
