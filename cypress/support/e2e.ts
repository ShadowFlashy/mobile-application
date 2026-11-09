import './commands';

// Every test starts signed out with an empty device (no persisted session or cache).
beforeEach(() => {
  cy.clearLocalStorage();
  cy.clearAllSessionStorage();
});
