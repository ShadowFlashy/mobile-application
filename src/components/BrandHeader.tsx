import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import { createThemedStyles, radii, useTheme } from '../theme';
import { Icon } from './primitives/Icon';
import { Row } from './primitives/Row';
import { Stack } from './primitives/Stack';
import { Text } from './primitives/Text';

interface BrandHeaderProps {
  /** Already translated tagline under the app name. */
  subtitle: string;
}

/** App name and logo mark, used on the login and register screens. */
export function BrandHeader({ subtitle }: BrandHeaderProps) {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const styles = useStyles();
  return (
    <Stack gap="sm">
      <Row gap="sm">
        <View style={styles.logo}>
          <Icon name="speedometer" size={26} color={colors.onPrimary} />
        </View>
        <Text size="xxl" weight="bold" heading>
          {t('common.app_name')}
        </Text>
      </Row>
      <Text color={colors.textMuted}>{subtitle}</Text>
    </Stack>
  );
}

const useStyles = createThemedStyles(({ colors }) => ({
  logo: {
    width: 44,
    height: 44,
    borderRadius: radii.md,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
}));
