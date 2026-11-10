import { useTranslation } from 'react-i18next';
import { Stack } from '../primitives/Stack';
import { StyledButton } from '../StyledButton';

export type RevealCtaPhase = 'stick' | 'sticking' | 'final';

export interface RevealCtasProps {
  /** `stick`: the STICK IT button; `sticking`: the same, busy; `final`: View page and Spot another. */
  phase: RevealCtaPhase;
  onStick: () => void;
  onViewPage: () => void;
  onSpotAnother: () => void;
  testID?: string;
}

/**
 * The reveal's calls to action (SPEC P0-15): first the ignition-red STICK IT, which sticks the
 * sticker into the mini album page (a user tap, so its haptic is allowed), then View page and
 * Spot another.
 */
export function RevealCtas({ phase, onStick, onViewPage, onSpotAnother, testID }: RevealCtasProps) {
  const { t } = useTranslation();
  if (phase !== 'final') {
    return (
      <Stack testID={testID}>
        <StyledButton
          label={t('reveal.stick_it')}
          variant="ignition"
          icon="albums-outline"
          accessibilityHint={t('reveal.stick_hint')}
          isLoading={phase === 'sticking'}
          onPress={onStick}
          testID="reveal-stick"
        />
      </Stack>
    );
  }
  return (
    <Stack gap="sm" testID={testID}>
      <StyledButton label={t('reveal.view_page')} icon="book-outline" onPress={onViewPage} testID="reveal-view-page" />
      <StyledButton
        label={t('reveal.spot_another')}
        variant="secondary"
        icon="camera-outline"
        onPress={onSpotAnother}
        testID="reveal-spot-another"
      />
    </Stack>
  );
}
