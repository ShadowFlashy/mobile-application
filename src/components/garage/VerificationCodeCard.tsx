import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { SECOND } from '../../constants/time';
import { formatCountdown, remainingMs, VERIFICATION_PREFIX } from '../../utils/verificationCode';
import { Icon } from '../primitives/Icon';
import { Row } from '../primitives/Row';
import { Stack } from '../primitives/Stack';
import { Text } from '../primitives/Text';
import { VerificationSteps } from './VerificationSteps';

export interface VerificationCodeCardProps {
  /** "RL-7K3QX9" */
  code: string;
  /** ISO moment the code expires (30 minutes after it was requested). */
  expiresAt: string;
  testID?: string;
}

/**
 * P1-14: the one-time verification code as a readout (the six symbols in large condensed numerals,
 * the "RL-" prefix in text-2), a live countdown and the three numbered steps. The owner places the
 * code behind the windscreen and photographs the car so the plate and the code are both readable.
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
  const hasPrefix = code.startsWith(VERIFICATION_PREFIX);
  const symbols = hasPrefix ? code.slice(VERIFICATION_PREFIX.length) : code;
  return (
    <Stack gap="lg" testID={testID}>
      <Stack gap="sm">
        <Text variant="meta" tone="text2">
          {t('verify.code_label')}
        </Text>
        <Text variant="hero" accessibilityLabel={t('verify.code_a11y', { code: code.split('').join(' ') })}>
          {hasPrefix && (
            <Text variant="heroSub" tone="text2">
              {VERIFICATION_PREFIX}
            </Text>
          )}
          {symbols}
        </Text>
        <Row gap="xs" align="center">
          <Icon name={expired ? 'alert' : 'clock'} size={16} tone={expired ? 'text' : 'text2'} />
          <Text variant="numS" tone={expired ? 'text' : 'text2'} testID={`${testID}-countdown`}>
            {expired ? t('verify.expired') : t('verify.expires_in', { time: formatCountdown(left) })}
          </Text>
        </Row>
      </Stack>
      <VerificationSteps
        title={t('verify.code_steps_title')}
        steps={[
          { key: 'write', title: t('verify.code_step_write') },
          { key: 'place', title: t('verify.code_step_place') },
          { key: 'photo', title: t('verify.code_step_photo') },
        ]}
        testID={`${testID}-steps`}
      />
    </Stack>
  );
}
