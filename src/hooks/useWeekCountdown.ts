import { useTranslation } from 'react-i18next';
import { MINUTE } from '../constants/time';
import { useNow } from './useNow';
import { countdownTo } from '../utils/progression';

/**
 * "Ends in 4d 13h", "Ends in 5h 04m", "Ends in 12m" or "Week over" for the end of the challenge
 * week (Monday 00:00), refreshed every minute.
 */
export function useWeekCountdown(endsAt: string): string {
  const { t } = useTranslation();
  const now = useNow(MINUTE);
  const countdown = countdownTo(endsAt, now);
  if (countdown.isOver) return t('progress.ended');
  const minutes = String(countdown.minutes).padStart(2, '0');
  const time =
    countdown.days > 0
      ? t('progress.time_days', { days: countdown.days, hours: countdown.hours })
      : countdown.hours > 0
        ? t('progress.time_hours', { hours: countdown.hours, minutes })
        : t('progress.time_minutes', { minutes: countdown.minutes });
  return t('progress.ends_in', { time });
}
