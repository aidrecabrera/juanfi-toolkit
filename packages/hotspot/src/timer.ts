import type { Timer } from './types';

export function formatTime(seconds: number | string): string {
  const total = Number(seconds);
  const d = Math.floor(total / (3600 * 24));
  const h = Math.floor((total % (3600 * 24)) / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = Math.floor(total % 60);

  const dDisplay = d > 0 ? d + (d === 1 ? ' Day ' : ' Days ') : '';
  const hDisplay = h > 0 ? h + (h === 1 ? '' : '') : '0';
  const mDisplay = m > 0 ? m + (m === 1 ? '' : '') : '0';
  const sDisplay = s > 0 ? s + (s === 1 ? '' : '') : '0';
  return `${dDisplay} ${hDisplay}h : ${mDisplay}m : ${sDisplay}s`;
}

export const secondsToDhms = formatTime;

export function createTimer(input: {
  readonly seconds: number;
  readonly intervalMs?: number;
  readonly onTick: (remaining: number) => void;
  readonly onDone?: () => void;
}): Timer {
  let remaining = input.seconds;
  let timer: ReturnType<typeof setInterval> | null = null;

  const stop = (): void => {
    if (timer !== null) {
      clearInterval(timer);
      timer = null;
    }
  };

  return {
    start() {
      if (timer !== null) return;
      timer = setInterval(() => {
        remaining -= 1;
        input.onTick(remaining);
        if (remaining <= 0) {
          stop();
          input.onDone?.();
        }
      }, input.intervalMs ?? 1000);
    },
    stop,
    getRemaining() {
      return remaining;
    },
  };
}
