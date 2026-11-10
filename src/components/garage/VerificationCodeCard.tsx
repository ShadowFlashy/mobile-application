import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { SECOND } from '../../constants/time';
import { formatCountdown, remainingMs } from '../../utils/verificationCode';
import { Icon } from '../primitives/Icon';
import { Row } from '../primitives/Row';
import { Stack } from '../primitives/Stack';
import { Surface } from '../primitives/Surface';
import { Text } from '../primitives/Text';

export interface VerificationCodeCardProps {
  /** "RL-7K3QX9" */
  code: string;
  /** ISO moment the code expires (30 minutes after it was requested). */
  expiresAt: string;
  testID?: string;
}

/**
 * P1-14: the one-time verification code on a pit board, with a live countdown. The owner places it
 * behind the windscreen and photographs the car so the plate and the code are both readable.
 */
export function VerificationCodeCard({
  code,
  expiresAt,
  testID = 'verification-code-card',
}: VerificationCodeCardProps) {
  const { t } = useTranslation();
  const [now, setNow] = useState(() => new Date());
  const left = remainingMs(expiresAt, now);

  useEffect(() => {
    setNow(new Date());
    const timer = setInterval(() => setNow(new Date()), SECOND);
    return () => clearInterval(timer);
  }, [expiresAt]);

  const expired = left === 0;
  return (
    <Surface variant="inverse" radius="lg" padding="lg" testID={testID}>
      <Stack gap="sm" align="center">
        <Text variant="label" tone="inverse">
          {t('verify.code_label')}
        </Text>
        <Text
          variant="hero"
          tone="inverse"
          accessibilityLabel={t('verify.code_a11y', { code: code.split('').join(' ') })}
        >
          {code}
        </Text>
        <Row gap="xs" align="center">
          <Icon name={expired ? 'alert-circle-outline' : 'timer-outline'} size={18} tone="inverse" />
          <Text variant="numberSm" tone="inverse" testID={`${testID}-countdown`}>
            {expired ? t('verify.expired') : t('verify.expires_in', { time: formatCountdown(left) })}
          </Text>
        </Row>
        <Text variant="bodySm" tone="inverse" align="center">
          {t('verify.code_instructions')}
        </Text>
      </Stack>
    </Surface>
  );
}
