import { DeleteAccountButton } from '../../../src/components/trust/DeleteAccountButton';
import { DriverCard } from '../../../src/components/trust/DriverCard';
import { OwnerVisibilityTable } from '../../../src/components/trust/OwnerVisibilityTable';
import { PrivacyDocument, PRIVACY_SECTIONS } from '../../../src/components/trust/PrivacyDocument';
import { SettingRow } from '../../../src/components/trust/SettingRow';
import { TrustLedger } from '../../../src/components/trust/TrustLedger';

describe('TrustLedger', () => {
  const ledger = {
    photos: 27,
    plates: 0 as const,
    gpsPoints: 0 as const,
    cities: 6,
    aiCallsLeft: 12,
    aiDailyLimit: 15,
  };

  it('shows 0 plates and 0 GPS points as "Never stored", with photos, cities and scans left', () => {
    cy.mount(<TrustLedger {...ledger} aiEnabled testID="trust-ledger" />);
    cy.get('[data-testid="ledger-plates-value"]').should('have.text', '0');
    cy.get('[data-testid="ledger-gps-value"]').should('have.text', '0');
    cy.get('[data-testid="ledger-plates"]').should('contain.text', 'Never stored');
    cy.get('[data-testid="ledger-gps"]').should('contain.text', 'Never stored');
    cy.get('[data-testid="ledger-photos-value"]').should('have.text', '27');
    cy.get('[data-testid="ledger-cities-value"]').should('have.text', '6');
    cy.get('[data-testid="ledger-ai-value"]').should('have.text', '12 of 15');
  });

  it('gives each counter one spoken label', () => {
    cy.mount(<TrustLedger {...ledger} aiEnabled />);
    cy.get('[data-testid="ledger-plates"]').should('have.attr', 'aria-label', 'Licence plates: 0, Never stored');
    cy.get('[data-testid="ledger-ai"]').should('have.attr', 'aria-label', 'Co-Driver scans left today: 12 of 15');
  });

  it('says Co-Driver is off instead of counting scans', () => {
    cy.mount(<TrustLedger {...ledger} aiEnabled={false} />);
    cy.get('[data-testid="ledger-ai-value"]').should('have.text', 'Co-Driver is off');
  });

  it('explains a missing quota instead of showing a wrong number', () => {
    cy.mount(<TrustLedger {...ledger} aiCallsLeft={undefined} aiDailyLimit={undefined} aiEnabled />);
    cy.get('[data-testid="ledger-ai-value"]').should('have.text', 'Shown when you are online');
  });

  it('keeps the guaranteed zeros visible while the spots load', () => {
    cy.mount(<TrustLedger {...ledger} aiEnabled isLoading />);
    cy.get('[data-testid="ledger-photos-value"]').should('not.exist');
    cy.get('[data-testid="ledger-plates-value"]').should('have.text', '0');
  });
});

describe('DriverCard', () => {
  const level = { level: 5, title: 'Kerbside Scout', xp: 1240, nextLevelXp: 1500, ratio: 0.48 };

  it('shows the username, level title and the XP to the next level', () => {
    cy.mount(<DriverCard name="tester" email="tester@redline.test" level={level} testID="driver-card" />);
    cy.get('[data-testid="driver-name"]').should('have.text', 'tester');
    cy.get('[data-testid="driver-title"]').should('have.text', 'Kerbside Scout');
    cy.get('[data-testid="driver-xp"]').should('have.text', '1,240 XP · 260 XP to level 6');
    cy.get('[data-testid="driver-card"]').should('contain.text', 'Level 5');
    cy.get('[data-testid="driver-card"]').should('contain.text', 'tester@redline.test');
  });

  it('announces the driver as one heading', () => {
    cy.mount(<DriverCard name="tester" level={level} />);
    cy.get('[aria-label="tester, level 5, Kerbside Scout"]').should('exist');
  });

  it('labels the shift lights with the progress in words', () => {
    cy.mount(<DriverCard name="tester" level={level} />);
    cy.get('[data-testid="driver-shift-lights"]').should('have.attr', 'aria-label', 'Progress to level 6: 48%');
  });

  it('shows a counting state before the progress is derived', () => {
    cy.mount(<DriverCard name="tester" />);
    cy.contains('Counting your XP…').should('be.visible');
    cy.get('[data-testid="driver-title"]').should('not.exist');
  });

  it('tags an offline session as read-only', () => {
    cy.mount(<DriverCard name="tester" level={level} isOffline />);
    cy.get('[data-testid="offline-session-tag"]').should('contain.text', 'Offline · read-only');
  });
});

describe('SettingRow', () => {
  it('is a 48 dp link with a chevron that calls onPress', () => {
    const onPress = cy.stub().as('onPress');
    cy.mount(
      <SettingRow
        icon="shield-checkmark-outline"
        label="Trust Center"
        description="Co-Driver, auto-city and what Redline stores"
        onPress={onPress}
        testID="trust-link"
      />,
    );
    cy.get('[data-testid="trust-link"]').should('have.attr', 'role', 'link').and('contain.text', 'Trust Center');
    cy.get('[data-testid="trust-link"]').invoke('outerHeight').should('be.at.least', 48);
    cy.get('[data-testid="trust-link"]').click();
    cy.get('@onPress').should('have.been.calledOnce');
  });

  it('shows a value without being pressable when it has no onPress', () => {
    cy.mount(<SettingRow icon="information-circle-outline" label="Version" value="2.0.0" testID="version" />);
    cy.get('[data-testid="version"]').should('contain.text', '2.0.0').and('not.have.attr', 'role', 'link');
    cy.get('[data-testid="version"]').should('have.attr', 'aria-label', 'Version, 2.0.0');
  });
});

describe('OwnerVisibilityTable', () => {
  it('never shows notes, exact time, place, plates or other spots', () => {
    cy.mount(<OwnerVisibilityTable shareName={false} testID="owner-visibility" />);
    ['exact_time', 'place', 'notes', 'plate', 'other_spots', 'account'].forEach((key) => {
      cy.get(`[data-testid="owner-visibility-${key}-status"]`).should('have.text', 'Never');
    });
    ['car', 'city', 'hour', 'photo'].forEach((key) => {
      cy.get(`[data-testid="owner-visibility-${key}-status"]`).should('have.text', 'Shown');
    });
  });

  it('follows the "share my name" setting for the username row', () => {
    cy.mount(<OwnerVisibilityTable shareName={false} />);
    cy.get('[data-testid="owner-visibility-name-status"]').should('have.text', 'Hidden (opt-in)');
    cy.mount(<OwnerVisibilityTable shareName />);
    cy.get('[data-testid="owner-visibility-name-status"]').should('have.text', 'Shown (you opted in)');
    cy.get('[data-testid="owner-visibility-name"]').should(
      'have.attr',
      'aria-label',
      'Your username: Shown (you opted in)',
    );
  });
});

describe('PrivacyDocument', () => {
  it('renders every section with a heading, in order', () => {
    cy.mount(<PrivacyDocument testID="privacy-document" />);
    cy.get('[data-testid="privacy-title"]').should('have.text', 'Privacy policy');
    PRIVACY_SECTIONS.forEach((section) => {
      cy.get(`[data-testid="privacy-section-${section.id}"]`).should('exist');
    });
    cy.get('[data-testid="privacy-section-processors"]')
      .should('contain.text', 'Supabase')
      .and('contain.text', 'Vercel')
      .and('contain.text', 'Cloudflare Workers AI')
      .and('contain.text', 'Mistral AI');
    cy.get('[role="heading"]').should('have.length.at.least', PRIVACY_SECTIONS.length);
  });
});

describe('DeleteAccountButton', () => {
  it('asks for confirmation before it deletes, and closes afterwards', () => {
    const onConfirm = cy.stub().as('onConfirm').resolves();
    cy.mount(<DeleteAccountButton onConfirm={onConfirm} isDeleting={false} testID="delete-account-button" />);
    cy.get('[data-testid="delete-account-button"]').click();
    cy.get('[data-testid="confirm-dialog"]').should('contain.text', 'Delete your account?');
    cy.get('@onConfirm').should('not.have.been.called');
    cy.get('[data-testid="confirm-dialog-confirm"]').click();
    cy.get('@onConfirm').should('have.been.calledOnce');
    cy.get('[data-testid="confirm-dialog"]').should('not.exist');
  });

  it('closes on cancel without deleting', () => {
    const onConfirm = cy.stub().as('onConfirm').resolves();
    cy.mount(<DeleteAccountButton onConfirm={onConfirm} isDeleting={false} testID="delete-account-button" />);
    cy.get('[data-testid="delete-account-button"]').click();
    cy.get('[data-testid="confirm-dialog-cancel"]').click();
    cy.get('[data-testid="confirm-dialog"]').should('not.exist');
    cy.get('@onConfirm').should('not.have.been.called');
  });

  it('closes the dialog when deletion fails, so the error toast is visible', () => {
    const onConfirm = cy.stub().as('onConfirm').rejects(new Error('demo_protected'));
    cy.mount(<DeleteAccountButton onConfirm={onConfirm} isDeleting={false} testID="delete-account-button" />);
    cy.get('[data-testid="delete-account-button"]').click();
    cy.get('[data-testid="confirm-dialog-confirm"]').click();
    cy.get('[data-testid="confirm-dialog"]').should('not.exist');
  });
});
