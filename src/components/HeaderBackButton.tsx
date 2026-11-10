import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { IconButton } from './primitives/IconButton';

interface HeaderBackButtonProps {
  /** Default: the router's back. */
  onPress?: () => void;
}

/**
 * The stack header's back button: a 44 × 44 chevron with a translated accessible name. React
 * Navigation's own button falls back to an English "Go back", also in Dutch.
 */
export function HeaderBackButton({ onPress }: HeaderBackButtonProps) {
  const { t } = useTranslation();
  const router = useRouter();
  return (
    <IconButton
      icon="chevron-left"
      label={t('a11y.back')}
      onPress={onPress ?? (() => router.back())}
      testID="header-back"
    />
  );
}
