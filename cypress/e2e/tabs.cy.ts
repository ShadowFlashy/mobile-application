// The 5-tab shell in direction A: Album, Stats, the red Spot key, Garage and Profile.
const TABS = [
  { id: 'tab-index', en: 'Album', nl: 'Album', screen: 'sticker-book-screen' },
  { id: 'tab-progress', en: 'Stats', nl: 'Statistieken', screen: 'progress-screen' },
  { id: 'tab-spot', en: 'Spot', nl: 'Spot', screen: 'spot-screen' },
  { id: 'tab-owners', en: 'Garage', nl: 'Garage', screen: 'owners-screen' },
  { id: 'tab-profile', en: 'Profile', nl: 'Profiel', screen: 'profile-screen' },
] as const;

/** Redline red as getComputedStyle reports it. */
const RED = 'rgb(225, 6, 0)';

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

  it('shows Spot as the one red key, level with the other tabs; active tabs are never red', () => {
    cy.get('[data-testid="tab-index"]').then(($album) => {
      const albumTop = $album[0]?.getBoundingClientRect().top ?? 0;
      cy.get('[data-testid="tab-spot"]').should(($spot) => {
        const rect = $spot[0]?.getBoundingClientRect();
        expect(Math.abs((rect?.top ?? 0) - albumTop)).to.be.lessThan(2);
        expect(rect?.height ?? 0).to.be.at.least(44);
      });
    });
    cy.get('[data-testid="bottom-tab-bar"] div')
      .filter((_, element) => getComputedStyle(element).backgroundColor === RED)
      .should('have.length', 1)
      .and(($key) => expect($key.closest('[data-testid="tab-spot"]').length).to.equal(1));
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
    cy.get('[data-testid="tab-progress"]').should('not.contain.text', 'Stats');
    cy.get('[data-testid="tab-profile"]').should('not.contain.text', 'Profile');
  });
});
