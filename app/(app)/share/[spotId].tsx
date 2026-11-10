import { useTranslation } from 'react-i18next';
import { EmptyState } from '../../../src/components/primitives/EmptyState';
import { Screen } from '../../../src/components/primitives/Screen';

/** Placeholder route (F1, SPEC §5): W9 (P1) replaces it with the real screen. */
export default function ShareScreen() {
  const { t } = useTranslation();
  return (
    <Screen title={t('shell.share_title')} testID="share-screen">
      <EmptyState icon="share" title={t('shell.coming_soon')} />
    </Screen>
  );
}
