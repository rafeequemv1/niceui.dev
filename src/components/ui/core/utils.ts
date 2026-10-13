/**
 * Plays a Web Animation the first time an element mounts. Safe to call from
 * inline ref callbacks (which React re-invokes on every render).
 */
export function animateOnce(el: HTMLElement | null, keyframes: Keyframe[], options: KeyframeAnimationOptions) {
  if (!el || el.dataset.played) return;
  el.dataset.played = '1';
  el.animate(keyframes, options);
}

export const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));
