export interface RectCache {
  readonly current: DOMRect;
  destroy: () => void;
}

/**
 * Keeps pointer-relative canvas effects aligned while transformed ancestors move.
 * Multiple reads in the same animation frame reuse the same layout measurement.
 */
export function createRectCache(element: Element): RectCache {
  let rect = element.getBoundingClientRect();
  let frame = -1;
  let destroyed = false;

  return {
    get current() {
      if (destroyed) return rect;

      const nextFrame = Math.floor(performance.now() / (1000 / 60));
      if (nextFrame !== frame) {
        frame = nextFrame;
        rect = element.getBoundingClientRect();
      }

      return rect;
    },
    destroy() {
      destroyed = true;
    },
  };
}
