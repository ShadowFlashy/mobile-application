import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import { createThemedStyles, spacing } from '../../theme';
import { KerbStripe } from '../primitives/KerbStripe';
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
  testID?: string;
}

/**
 * The privacy policy (SPEC P0-18, §12) in the current language: a numbered, readable document
 * with real headings for screen readers. The text lives in the `privacy` namespace (en and nl).
 */
export function PrivacyDocument({ testID }: PrivacyDocumentProps) {
  const { t } = useTranslation();
  const styles = useStyles();
  return (
    <View style={styles.document} testID={testID}>
      <View style={styles.masthead}>
        <Text variant="label" tone="accent">
          {t('privacy.eyebrow')}
        </Text>
        <Text variant="display" heading testID="privacy-title">
          {t('privacy.title')}
        </Text>
        <Text variant="caption" tone="muted">
          {t('privacy.updated')}
        </Text>
        <Text tone="muted">{t('privacy.intro')}</Text>
      </View>
      <KerbStripe height={4} />
      {PRIVACY_SECTIONS.map((section, index) => (
        <View key={section.id} style={styles.section} testID={`privacy-section-${section.id}`}>
          <View style={styles.heading}>
            <Text variant="stickerNo" tone="accent">
              {String(index + 1).padStart(2, '0')}
            </Text>
            <View style={styles.headingText}>
              <Text variant="headline" heading>
                {t(section.title)}
              </Text>
            </View>
          </View>
          <Text>{t(section.body)}</Text>
        </View>
      ))}
    </View>
  );
}

const useStyles = createThemedStyles(() => ({
  document: { gap: spacing.lg },
  masthead: { gap: spacing.xs },
  section: { gap: spacing.sm },
  heading: { flexDirection: 'row', alignItems: 'baseline', gap: spacing.sm },
  headingText: { flex: 1 },
}));
