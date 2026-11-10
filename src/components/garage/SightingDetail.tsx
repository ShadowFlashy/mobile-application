import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import { aspect, createThemedStyles, lines, rowHeights, spacing } from '../../theme';
import type { Sighting } from '../../types/OwnerCar';
import { formatDate } from '../../utils/formatDate';
import { hourWindowLabel } from '../../utils/sightings';
import { PhotoFrame } from '../primitives/PhotoFrame';
import { ScreenTitle } from '../primitives/ScreenTitle';
import { Section } from '../primitives/Section';
import { Stack } from '../primitives/Stack';
import { Text } from '../primitives/Text';
import { PrivacyNotice } from '../PrivacyNotice';

export interface SightingDetailProps {
  sighting: Sighting;
}

interface FactRowProps {
  label: string;
  value: string;
  testID: string;
}

/** A detail row: the label in text-2 on the left, the value on the right, a bottom hairline. */
function FactRow({ label, value, testID }: FactRowProps) {
  const styles = useStyles();
  return (
    <View style={styles.row}>
      <Text variant="value" tone="text2" numberOfLines={1}>
        {label}
      </Text>
      <View style={styles.value}>
        <Text variant="body" align="right" testID={testID}>
          {value}
        </Text>
      </View>
    </View>
  );
}

/**
 * A sighting snapshot in full: the blurred photo (radius 8), then rows for the car, the city and the
 * time (day and hour window). "Seen by" appears only when the spotter chose to share their name.
 * Nothing else about the spotter or the spot exists here (D-8).
 */
export function SightingDetail({ sighting }: SightingDetailProps) {
  const { t, i18n } = useTranslation();
  const when = t('sightings.when_value', {
    date: formatDate(sighting.spottedHour, i18n.language),
    window: hourWindowLabel(sighting.spottedHour, i18n.language),
  });
  return (
    <Stack gap="lg" testID="sighting-detail">
      <ScreenTitle title={t('sightings.detail_title')} meta={sighting.carLabel} testID="sighting-title" />
      <PhotoFrame
        uri={sighting.photoUrl}
        cacheKey={sighting.photoPath}
        aspectRatio={aspect.hero}
        radius="md"
        accessibilityLabel={t('sightings.photo_a11y', { car: sighting.carLabel })}
        testID="sighting-photo"
      />
      <Section divider>
        <FactRow label={t('sightings.car_label')} value={sighting.carLabel} testID="sighting-car" />
        <FactRow
          label={t('sightings.where_label')}
          value={sighting.city ?? t('sightings.no_city')}
          testID="sighting-city"
        />
        <FactRow label={t('sightings.when_label')} value={when} testID="sighting-hour" />
        {sighting.spotterName !== undefined && (
          <FactRow
            label={t('sightings.who_label')}
            value={t('sightings.spotter_value', { name: sighting.spotterName })}
            testID="sighting-spotter"
          />
        )}
      </Section>
      <PrivacyNotice title={t('sightings.privacy_title')}>{t('sightings.privacy_body')}</PrivacyNotice>
    </Stack>
  );
}

const useStyles = createThemedStyles(({ colors }) => ({
  row: {
    minHeight: rowHeights.default,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
    paddingVertical: spacing.smd,
    borderBottomWidth: lines.hairline,
    borderBottomColor: colors.line,
  },
  value: { flexShrink: 1, alignItems: 'flex-end' },
}));
