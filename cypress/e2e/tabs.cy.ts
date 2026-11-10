// The 5-tab LIVERY shell (P0-09): Album, Pit Wall, the raised SPOT Ignition button, Garage and Me.
const TABS = [
  { id: 'tab-index', en: 'Album', nl: 'Album', screen: 'sticker-book-screen' },
  { id: 'tab-progress', en: 'Pit Wall', nl: 'Pitmuur', screen: 'progress-screen' },
  { id: 'tab-spot', en: 'SPOT', nl: 'SPOT', screen: 'spot-screen' },
  { id: 'tab-owners', en: 'Garage', nl: 'Garage', screen: 'owners-screen' },
  { id: 'tab-profile', en: 'Me', nl: 'Ik', screen: 'profile-screen' },
] as const;

describe('Main tabs', () => {
  beforeEach(() => {
    cy.stubSupabase();
    cy.loginThroughUi({ reduceMotion: true });
  });

  it('shows the five tabs in order, with English labels', () => {
    cy.get('[data-testid="bottom-tab-bar"] [role="tab"]').should('have.length', TABS.length);
    cy.get('[data-testid="bottom-tab-bar"] [role="tab"]').each(($tab, index) => {
      const tab = TABS[index];
      expect($tab.attr('data-testid')).to.equal(tab?.id);
      expect($tab.text()).to.contain(tab?.en);
    });
    cy.get('[data-testid="tab-index"]').should('have.attr', 'aria-selected', 'true');
  });

  it('opens every tab on its own screen', () => {
    TABS.forEach((tab) => {
      cy.get(`[data-testid="${tab.id}"]`).click();
      cy.get(`[data-testid="${tab.screen}"]`).should('be.visible');
      cy.get(`[data-testid="${tab.id}"]`).should('have.attr', 'aria-selected', 'true');
    });
  });

  it('raises the SPOT Ignition button above the other tabs', () => {
    cy.get('[data-testid="tab-index"]').then(($album) => {
      const albumTop = $album[0]?.getBoundingClientRect().top ?? 0;
      cy.get('[data-testid="tab-spot"]').should(($spot) => {
        const rect = $spot[0]?.getBoundingClientRect();
        expect(rect?.top ?? 0).to.be.lessThan(albumTop);
        expect(rect?.height ?? 0).to.be.at.least(64);
      });
    });
  });

  it('labels the tabs in Dutch and sets the page language', () => {
    // The language setting the app stores on the device (AsyncStorage → localStorage on the web).
    cy.visit('/', {
      onBeforeLoad(win) {
        win.localStorage.setItem('redline-language', 'nl');
      },
    });
    cy.get('html').should('have.attr', 'lang', 'nl');
    TABS.forEach((tab) => cy.get(`[data-testid="${tab.id}"]`).should('contain.text', tab.nl));
    cy.get('[data-testid="tab-progress"]').should('not.contain.text', 'Pit Wall');
    cy.get('[data-testid="tab-profile"]').should('not.contain.text', 'Me');
  });
});
