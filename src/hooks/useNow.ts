import { useEffect, useState } from 'react';

/** The current time, re-rendering every `intervalMs` (pit-board countdowns, the week key). */
export function useNow(intervalMs: number): Date {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), Math.max(1000, intervalMs));
    return () => clearInterval(timer);
  }, [intervalMs]);
  return now;
}
