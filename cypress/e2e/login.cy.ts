import { TEST_USER } from '../support/commands';

describe('Login screen', () => {
  beforeEach(() => {
    cy.stubSupabase();
  });

  it('renders the login form', () => {
    cy.visit('/login');
    cy.get('[data-testid="email-input"]').should('exist');
    cy.get('[data-testid="password-input"]').should('exist');
    cy.get('[data-testid="login-button"]').should('exist');
  });

  it('shows the REDLINE brand and no lecturer hint', () => {
    cy.visit('/login');
    cy.get('[data-testid="brand-wordmark"]').should('contain.text', 'Redline');
    cy.get('[data-testid="brand-mark"]').should('exist');
    cy.get('[data-testid="login-screen"]').should('not.contain.text', 'Lecturer');
    cy.get('[data-testid="demo-hint"]').should('not.exist');
  });

  it('hydrates a hard load in Dutch without React errors and stays usable', () => {
    // React reports hydration mismatches (#418/#422/#425) as uncaught errors, which fail this test.
    const errors: string[] = [];
    cy.on('window:before:load', (win) => {
      win.addEventListener('error', (event) => errors.push(event.message));
      const original = win.console.error.bind(win.console);
      cy.stub(win.console, 'error').callsFake((...args: unknown[]) => {
        errors.push(args.map(String).join(' '));
        original(...args);
      });
    });
    cy.visit('/login', {
      onBeforeLoad(win) {
        win.localStorage.setItem('redline-language', 'nl');
      },
    });
    cy.get('[data-testid="login-screen"]').should('contain.text', 'Welkom terug');
    cy.get('[data-testid="email-input"]').should('not.be.disabled').type('lars@redline.test');
    cy.get('[data-testid="email-input"]').should('have.value', 'lars@redline.test');
    cy.wrap(errors).should((list) => {
      expect(list.filter((message) => /Minified React error|hydrat/i.test(message))).to.deep.equal([]);
    });
  });

  it('links to the privacy page', () => {
    cy.visit('/login');
    cy.get('[data-testid="go-to-privacy"]').click();
    cy.location('pathname').should('eq', '/privacy');
  });

  it('loads the LIVERY fonts', () => {
    cy.visit('/login');
    cy.get('[data-testid="login-screen"]').should('be.visible');
    cy.document().then((doc) =>
      doc.fonts.load('16px BarlowCondensed_800ExtraBold_Italic').then(() => {
        expect(doc.fonts.check('16px BarlowCondensed_800ExtraBold_Italic')).to.equal(true);
      }),
    );
  });

  it('sends visitors who are not signed in to the login screen', () => {
    cy.visit('/');
    cy.location('pathname').should('eq', '/login');
  });

  it('shows validation messages before calling the server', () => {
    cy.visit('/login');
    cy.get('[data-testid="login-button"]').click();
    cy.get('[data-testid="email-input-error"]').should('be.visible');
  });

  it('explains when the credentials are wrong', () => {
    cy.intercept('POST', '**/auth/v1/token?grant_type=password', {
      statusCode: 400,
      body: { code: 400, error_code: 'invalid_credentials', msg: 'Invalid login credentials' },
    }).as('failedLogin');
    cy.visit('/login');
    cy.get('[data-testid="email-input"]').type(TEST_USER.email);
    cy.get('[data-testid="password-input"]').type('wrong-password');
    cy.get('[data-testid="login-button"]').click();
    cy.wait('@failedLogin');
    cy.get('[data-testid="login-error"]').should('be.visible');
  });

  it('logs in with valid credentials and navigates to the sticker book', () => {
    cy.loginThroughUi();
    cy.location('pathname').should('eq', '/');
  });

  it('keeps the user signed in after a reload (persisted session)', () => {
    cy.loginThroughUi();
    cy.reload();
    cy.get('[data-testid="sticker-book-screen"]').should('be.visible');
  });
});

describe('Register screen', () => {
  beforeEach(() => {
    cy.stubSupabase();
  });

  it('validates every field', () => {
    cy.visit('/register');
    cy.get('[data-testid="register-button"]').click();
    cy.get('[data-testid="username-input-error"]').should('be.visible');
  });

  it('asks to confirm the email address after signing up', () => {
    cy.intercept('POST', '**/auth/v1/signup*', {
      statusCode: 200,
      body: {
        id: TEST_USER.id,
        aud: 'authenticated',
        role: 'authenticated',
        email: 'new@redline.test',
        user_metadata: {},
      },
    }).as('signup');
    cy.visit('/register');
    cy.get('[data-testid="username-input"]').type('new_spotter');
    cy.get('[data-testid="register-email-input"]').type('new@redline.test');
    cy.get('[data-testid="register-password-input"]').type('a-long-password');
    cy.get('[data-testid="register-confirm-input"]').type('a-long-password');
    cy.get('[data-testid="register-button"]').click();
    cy.wait('@signup');
    cy.get('[data-testid="confirm-email-message"]').should('be.visible');
  });
});
