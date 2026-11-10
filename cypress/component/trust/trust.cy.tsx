import { useState } from 'react';
import { Text } from '../../../src/components/primitives/Text';
import { AutofillQuota } from '../../../src/components/trust/AutofillQuota';
import { DeleteAccountRow } from '../../../src/components/trust/DeleteAccountRow';
import { OptionRow } from '../../../src/components/trust/OptionRow';
import { OwnerVisibilityTable } from '../../../src/components/trust/OwnerVisibilityTable';
import { PrivacyDocument, PRIVACY_SECTIONS } from '../../../src/components/trust/PrivacyDocument';
import { ProfileIdentity } from '../../../src/components/trust/ProfileIdentity';
import { TableHeader, TableRow } from '../../../src/components/trust/TableRow';
import { TrustLedger } from '../../../src/components/trust/TrustLedger';

describe('TrustLedger', () => {
  const ledger = { photos: 27, plates: 0 as const, gpsPoints: 0 as const, cities: 6 };

  it('shows 0 plates and 0 GPS points as "Never stored", with photos and cities', () => {
    cy.mount(<TrustLedger {...ledger} testID="trust-ledger" />);
    cy.get('[data-testid="ledger-plates-value"]').should('have.text', '0');
    cy.get('[data-testid="ledger-gps-value"]').should('have.text', '0');
    cy.get('[data-testid="ledger-plates"]').should('contain.text', 'Never stored');
    cy.get('[data-testid="ledger-gps"]').should('contain.text', 'Never stored');
    cy.get('[data-testid="ledger-photos-value"]').should('have.text', '27');
    cy.get('[data-testid="ledger-cities-value"]').should('have.text', '6');
  });

  it('gives each row one spoken label', () => {
    cy.mount(<TrustLedger {...ledger} />);
    cy.get('[data-testid="ledger-plates"]').should('have.attr', 'aria-label', 'Licence plates: 0, Never stored');
    cy.get('[data-testid="ledger-photos"]').should(
      'have.attr',
      'aria-label',
      'Blurred photos: 27, Plates blurred on your phone',
    );
  });

  it('is a hairline table, not a grid of boxes', () => {
    cy.mount(<TrustLedger {...ledger} />);
    cy.get('[data-testid="ledger-plates"]').should(($row) => {
      const style = getComputedStyle($row[0]);
      expect(style.borderBottomWidth).to.equal('1px');
      expect(style.borderTopWidth).to.equal('0px');
      expect(style.backgroundColor).to.be.oneOf(['rgba(0, 0, 0, 0)', 'transparent']);
    });
  });

  it('keeps the guaranteed zeros visible while the spots load', () => {
    cy.mount(<TrustLedger {...ledger} isLoading />);
    cy.get('[data-testid="ledger-photos-value"]').should('not.exist');
    cy.get('[data-testid="ledger-plates-value"]').should('have.text', '0');
    cy.get('[data-testid="ledger-gps-value"]').should('have.text', '0');
  });
});

describe('AutofillQuota', () => {
  it('shows the Auto-fills left today as a readout with a 2 px line', () => {
    cy.mount(<AutofillQuota aiEnabled left={12} limit={15} testID="ledger-ai" />);
    cy.get('[data-testid="ledger-ai-value"]').should('have.text', '12/15');
    cy.get('[data-testid="ledger-ai-value"]').should('have.attr', 'aria-label', 'Auto-fills left today: 12 of 15');
    cy.get('[data-testid="ledger-ai"]').should('contain.text', 'Auto-fills left today');
    cy.get('[data-testid="ledger-ai"] [role="progressbar"]').should('have.attr', 'aria-valuenow');
  });

  it('says Auto-fill is off instead of counting', () => {
    cy.mount(<AutofillQuota aiEnabled={false} left={12} limit={15} testID="ledger-ai" />);
    cy.get('[data-testid="ledger-ai-value"]').should('have.text', 'Auto-fill is off');
    cy.get('[data-testid="ledger-ai"]').should('not.contain.text', '12');
  });

  it('explains a missing quota instead of showing a wrong number', () => {
    cy.mount(<AutofillQuota aiEnabled testID="ledger-ai" />);
    cy.get('[data-testid="ledger-ai-value"]').should('have.text', 'Shown when you are online');
  });
});

describe('ProfileIdentity', () => {
  it('shows the initials avatar, the name and the email', () => {
    cy.mount(<ProfileIdentity name="Jasper Degreef" email="tester@redline.test" testID="driver-card" />);
    cy.get('[data-testid="driver-name"]').should('have.text', 'Jasper Degreef').and('have.attr', 'role', 'heading');
    cy.get('[data-testid="driver-email"]').should('have.text', 'tester@redline.test');
    cy.get('[data-testid="driver-card"]').should('contain.text', 'JD');
    cy.get('[aria-label="Avatar of Jasper Degreef"]').should('exist');
  });

  it('is a plain row: no card fill, one hairline', () => {
    cy.mount(<ProfileIdentity name="tester" testID="driver-card" />);
    cy.get('[data-testid="driver-card"]').should(($row) => {
      const style = getComputedStyle($row[0]);
      expect(style.backgroundColor).to.be.oneOf(['rgba(0, 0, 0, 0)', 'transparent']);
      expect(style.borderBottomWidth).to.equal('1px');
      expect(style.borderRadius).to.equal('0px');
    });
    cy.get('[data-testid="driver-email"]').should('not.exist');
  });

  it('says an offline session is read-only', () => {
    cy.mount(<ProfileIdentity name="tester" isOffline />);
    cy.get('[data-testid="offline-session-tag"]').should('have.text', 'Offline · read-only');
  });
});

describe('OptionRow', () => {
  const OPTIONS = [
    { value: 'en', label: 'EN', accessibilityLabel: 'English' },
    { value: 'nl', label: 'NL', accessibilityLabel: 'Nederlands' },
  ] as const;

  function Harness({ onChange }: { onChange: (value: string) => void }) {
    const [value, setValue] = useState<'en' | 'nl'>('en');
    return (
      <OptionRow<'en' | 'nl'>
        label="Language"
        options={OPTIONS}
        value={value}
        onChange={(next) => {
          setValue(next);
          onChange(next);
        }}
        testID="language"
      />
    );
  }

  it('is a radio group with 44 px options named in full', () => {
    cy.mount(<Harness onChange={cy.stub().as('onChange')} />);
    cy.get('[data-testid="language"]')
      .should('have.attr', 'role', 'radiogroup')
      .and('have.attr', 'aria-label', 'Language');
    cy.get('[data-testid="language-en"]').should('have.attr', 'role', 'radio').and('have.attr', 'aria-checked', 'true');
    cy.get('[data-testid="language-nl"]').should('have.attr', 'aria-label', 'Nederlands').and('contain.text', 'NL');
    cy.get('[data-testid="language-nl"]').invoke('outerHeight').should('be.at.least', 44);
    cy.get('[data-testid="language-nl"]').invoke('outerWidth').should('be.at.least', 44);
  });

  it('selects an option on press', () => {
    cy.mount(<Harness onChange={cy.stub().as('onChange')} />);
    cy.get('[data-testid="language-nl"]').click();
    cy.get('@onChange').should('have.been.calledOnceWith', 'nl');
    cy.get('[data-testid="language-nl"]').should('have.attr', 'aria-checked', 'true');
    cy.get('[data-testid="language-en"]').should('have.attr', 'aria-checked', 'false');
  });
});

describe('TableRow', () => {
  it('reads as one sentence when it has a spoken label, and hides the column header', () => {
    cy.mount(
      <>
        <TableHeader left="Data" right="Owner sees" testID="table-header" />
        <TableRow
          label="City"
          hint="Only the city name"
          value={<Text>Shown</Text>}
          accessibilityLabel="City: Shown"
          testID="row"
        />
      </>,
    );
    cy.get('[data-testid="row"]').should('have.attr', 'aria-label', 'City: Shown');
    cy.get('[data-testid="row"]').invoke('outerHeight').should('be.at.least', 56);
    cy.get('[data-testid="table-header"]').should('have.attr', 'aria-hidden', 'true');
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

  it('calls the AI feature Auto-fill, never Co-Driver', () => {
    cy.mount(<PrivacyDocument testID="privacy-document" />);
    cy.get('[data-testid="privacy-section-ai"]').should('contain.text', 'Auto-fill');
    cy.get('[data-testid="privacy-document"]').should('not.contain.text', 'Co-Driver');
  });

  it('shows a toolbar under the title', () => {
    cy.mount(<PrivacyDocument toolbar={<Text testID="toolbar">Language</Text>} />);
    cy.get('[data-testid="toolbar"]').should('be.visible');
  });
});

describe('DeleteAccountRow', () => {
  it('is a plain row that asks for confirmation before it deletes, and closes afterwards', () => {
    const onConfirm = cy.stub().as('onConfirm').resolves();
    cy.mount(<DeleteAccountRow onConfirm={onConfirm} isDeleting={false} testID="delete-account-button" />);
    cy.get('[data-testid="delete-account-button"]')
      .should('have.attr', 'role', 'button')
      .and('contain.text', 'Delete account')
      .and(($row) => {
        expect(getComputedStyle($row[0]).backgroundColor).to.be.oneOf(['rgba(0, 0, 0, 0)', 'transparent']);
      });
    cy.get('[data-testid="delete-account-button"]').invoke('outerHeight').should('be.at.least', 44);
    cy.get('[data-testid="delete-account-button"]').click();
    cy.get('[data-testid="confirm-dialog"]').should('contain.text', 'Delete your account?');
    cy.get('@onConfirm').should('not.have.been.called');
    cy.get('[data-testid="confirm-dialog-confirm"]').click();
    cy.get('@onConfirm').should('have.been.calledOnce');
    cy.get('[data-testid="confirm-dialog"]').should('not.exist');
  });

  it('closes on cancel without deleting', () => {
    const onConfirm = cy.stub().as('onConfirm').resolves();
    cy.mount(<DeleteAccountRow onConfirm={onConfirm} isDeleting={false} testID="delete-account-button" />);
    cy.get('[data-testid="delete-account-button"]').click();
    cy.get('[data-testid="confirm-dialog-cancel"]').click();
    cy.get('[data-testid="confirm-dialog"]').should('not.exist');
    cy.get('@onConfirm').should('not.have.been.called');
  });

  it('closes the dialog when deletion fails, so the error toast is visible', () => {
    const onConfirm = cy.stub().as('onConfirm').rejects(new Error('demo_protected'));
    cy.mount(<DeleteAccountRow onConfirm={onConfirm} isDeleting={false} testID="delete-account-button" />);
    cy.get('[data-testid="delete-account-button"]').click();
    cy.get('[data-testid="confirm-dialog-confirm"]').click();
    cy.get('[data-testid="confirm-dialog"]').should('not.exist');
  });
});
