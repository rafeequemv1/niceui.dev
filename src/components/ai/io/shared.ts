import { useEffect, useRef, useState } from 'react';

export const prefersReducedMotion = () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/** Seconds elapsed while `active`, ticking at `fps`. */
export function useTicker(active: boolean, fps = 20) {
  const [t, setT] = useState(0);
  const base = useRef(0);
  useEffect(() => {
    if (!active) return;
    const start = performance.now() - base.current * 1000;
    const id = window.setInterval(() => {
      base.current = (performance.now() - start) / 1000;
      setT(base.current);
    }, 1000 / fps);
    return () => clearInterval(id);
  }, [active, fps]);
  const reset = () => {
    base.current = 0;
    setT(0);
  };
  return [t, reset] as const;
}

/** Deterministic pseudo-random 0..1. */
export const rnd = (n: number) => {
  const x = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};

export const mmss = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
