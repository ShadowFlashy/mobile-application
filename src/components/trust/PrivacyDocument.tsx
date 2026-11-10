import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import { createThemedStyles, lines, spacing } from '../../theme';
import { Text } from '../primitives/Text';

/** The sections of the policy, in reading order (SPEC P0-18: controller, purposes, legal basis,
 * retention, sub-processors, rights and contact, plus what is and is never stored). */
export const PRIVACY_SECTIONS = [
  { id: 'summary', title: 'privacy.summary_title', body: 'privacy.summary_body' },
  { id: 'controller', title: 'privacy.controller_title', body: 'privacy.controller_body' },
  { id: 'data', title: 'privacy.data_title', body: 'privacy.data_body' },
  { id: 'never', title: 'privacy.never_title', body: 'privacy.never_body' },
  { id: 'purposes', title: 'privacy.purposes_title', body: 'privacy.purposes_body' },
  { id: 'legal_basis', title: 'privacy.legal_basis_title', body: 'privacy.legal_basis_body' },
  { id: 'retention', title: 'privacy.retention_title', body: 'privacy.retention_body' },
  { id: 'processors', title: 'privacy.processors_title', body: 'privacy.processors_body' },
  { id: 'ai', title: 'privacy.ai_title', body: 'privacy.ai_body' },
  { id: 'owners', title: 'privacy.owners_title', body: 'privacy.owners_body' },
  { id: 'rights', title: 'privacy.rights_title', body: 'privacy.rights_body' },
  { id: 'children', title: 'privacy.children_title', body: 'privacy.children_body' },
  { id: 'security', title: 'privacy.security_title', body: 'privacy.security_body' },
  { id: 'contact', title: 'privacy.contact_title', body: 'privacy.contact_body' },
] as const;

export interface PrivacyDocumentProps {
  /** Shown under the title and date, e.g. the language tabs. */
  toolbar?: ReactNode;
  testID?: string;
}

/**
 * The privacy policy (SPEC P0-18, §12) in the current language, set as a plain document: the
 * condensed title, the date and intro, then numbered sections, each a hairline, a text-2 number and
 * a real heading over a body paragraph. The text lives in the `privacy` namespace (en and nl).
 */
export function PrivacyDocument({ toolbar, testID }: PrivacyDocumentProps) {
  const { t } = useTranslation();
  const styles = useStyles();
  return (
    <View style={styles.document} testID={testID}>
      <View style={styles.masthead}>
        <Text variant="title" heading testID="privacy-title">
          {t('privacy.title')}
        </Text>
        <Text variant="meta" tone="text2">
          {t('privacy.updated')}
        </Text>
      </View>
      {toolbar}
      <Text variant="bodyL">{t('privacy.intro')}</Text>
      <View>
        {PRIVACY_SECTIONS.map((section, index) => (
          <View key={section.id} style={styles.section} testID={`privacy-section-${section.id}`}>
            <View style={styles.heading}>
              <Text variant="numS" tone="text2" decorative>
                {String(index + 1).padStart(2, '0')}
              </Text>
              <View style={styles.headingText}>
                <Text variant="heading" heading>
                  {t(section.title)}
                </Text>
              </View>
            </View>
            <Text variant="value">{t(section.body)}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const useStyles = createThemedStyles(({ colors }) => ({
  document: { gap: spacing.lg },
  masthead: { gap: spacing.xs },
  section: {
    gap: spacing.sm,
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
    borderTopWidth: lines.hairline,
    borderTopColor: colors.line,
  },
  heading: { flexDirection: 'row', alignItems: 'baseline', gap: spacing.smd },
  headingText: { flex: 1, minWidth: 0 },
}));
