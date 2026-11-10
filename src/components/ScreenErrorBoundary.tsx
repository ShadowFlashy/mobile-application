import type { ErrorBoundaryProps } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { EmptyState } from './primitives/EmptyState';
import { Screen } from './primitives/Screen';
import { StyledButton } from './StyledButton';

/**
 * Friendly fallback when a screen crashes, instead of a white screen. Exported as `ErrorBoundary`
 * by both root layouts (_layout.tsx and _layout.web.tsx). Technical details are never shown.
 *
 * It replaces the whole root layout, so it must not depend on the app providers (no queries).
 */
export function ScreenErrorBoundary({ retry }: ErrorBoundaryProps) {
  const { t } = useTranslation();
  return (
    <Screen testID="error-screen">
      <EmptyState
        icon="warning-outline"
        title={t('shell.error_title')}
        description={t('shell.error_description')}
        action={<StyledButton label={t('common.try_again')} onPress={() => void retry()} testID="error-retry" />}
      />
    </Screen>
  );
}
