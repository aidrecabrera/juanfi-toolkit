import { describe, expect, it, vi } from 'vitest';
import { createTimer, formatTime } from './timer';

describe('timer helpers', () => {
  it('formatTime matches legacy secondsToDhms output', () => {
    expect(formatTime(0)).toBe(' 0h : 0m : 0s');
    expect(formatTime(3661)).toBe(' 1h : 1m : 1s');
    expect(formatTime(90061)).toBe('1 Day  1h : 1m : 1s');
  });

  it('countdown calls onDone at zero', () => {
    vi.useFakeTimers();
    const onDone = vi.fn();
    const timer = createTimer({ seconds: 1, onTick: vi.fn(), onDone });

    timer.start();
    vi.advanceTimersByTime(1000);

    expect(onDone).toHaveBeenCalledOnce();
    vi.useRealTimers();
  });
});
