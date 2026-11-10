import { DAY, HOUR, MINUTE } from '../../constants/time';

/** Time left until a moment, split for a "2d 13h" / "4h 05m" / "12m" pit-board countdown. */
export interface Countdown {
  days: number;
  hours: number;
  minutes: number;
  /** True once the moment has passed. */
  isOver: boolean;
}

/** Whole days, hours and minutes left (rounded up to the minute, never negative). */
export function countdownTo(endsAt: string, now: Date): Countdown {
  const end = Date.parse(endsAt);
  const left = Number.isFinite(end) ? end - now.getTime() : 0;
  if (left <= 0) return { days: 0, hours: 0, minutes: 0, isOver: true };
  const totalMinutes = Math.ceil(left / MINUTE);
  const ms = totalMinutes * MINUTE;
  return {
    days: Math.floor(ms / DAY),
    hours: Math.floor((ms % DAY) / HOUR),
    minutes: Math.floor((ms % HOUR) / MINUTE),
    isOver: false,
  };
}
