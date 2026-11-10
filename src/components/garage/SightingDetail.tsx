import { useTranslation } from 'react-i18next';
import { aspect } from '../../theme';
import type { Sighting } from '../../types/OwnerCar';
import { formatDate } from '../../utils/formatDate';
import { hourWindowLabel } from '../../utils/sightings';
import { Divider } from '../primitives/Divider';
import { Icon, type IconName } from '../primitives/Icon';
import { PhotoFrame } from '../primitives/PhotoFrame';
import { Row } from '../primitives/Row';
import { Stack } from '../primitives/Stack';
import { Surface } from '../primitives/Surface';
import { Text } from '../primitives/Text';
import { PrivacyNotice } from '../PrivacyNotice';

export interface SightingDetailProps {
  sighting: Sighting;
}

interface FactRowProps {
  icon: IconName;
  label: string;
  value: string;
  testID: string;
}

function FactRow({ icon, label, value, testID }: FactRowProps) {
  return (
    <Row gap="smd" align="center">
      <Icon name={icon} size={20} tone="accent" />
      <Stack gap="xxs" flex={1}>
        <Text variant="label" tone="muted">
          {label}
        </Text>
        <Text variant="bodyStrong" testID={testID}>
          {value}
        </Text>
      </Stack>
    </Row>
  );
}

/**
 * A sighting snapshot in full: the blurred photo, the car, the city, the day and the hour window, and
 * the spotter only if they opted in. Nothing else about the spotter or the spot exists here (D-8).
 */
export function SightingDetail({ sighting }: SightingDetailProps) {
  const { t, i18n } = useTranslation();
  const when = t('sightings.when_value', {
    date: formatDate(sighting.spottedHour, i18n.language),
    window: hourWindowLabel(sighting.spottedHour, i18n.language),
  });
  return (
    <Stack gap="lg" testID="sighting-detail">
      <PhotoFrame
        uri={sighting.photoUrl}
        cacheKey={sighting.photoPath}
        aspectRatio={aspect.hero}
        radius="lg"
        accessibilityLabel={t('sightings.photo_a11y', { car: sighting.carLabel })}
        testID="sighting-photo"
      />
      <Text variant="title" heading testID="sighting-title">
        {t('sightings.detail_title', { car: sighting.carLabel })}
      </Text>
      <Surface variant="raised" radius="lg" padding="md">
        <Stack gap="smd">
          <FactRow
            icon="location-outline"
            label={t('sightings.where_label')}
            value={sighting.city ?? t('sightings.no_city')}
            testID="sighting-city"
          />
          <Divider />
          <FactRow icon="time-outline" label={t('sightings.when_label')} value={when} testID="sighting-hour" />
          <Divider />
          <FactRow
            icon="person-outline"
            label={t('sightings.who_label')}
            value={
              sighting.spotterName !== undefined
                ? t('sightings.by_spotter', { name: sighting.spotterName })
                : t('sightings.anonymous')
            }
            testID="sighting-spotter"
          />
        </Stack>
      </Surface>
      <PrivacyNotice title={t('sightings.privacy_title')}>{t('sightings.privacy_body')}</PrivacyNotice>
    </Stack>
  );
}
