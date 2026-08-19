import type { SpatialBounds, SpatialPoint } from '../types';

/** Center point of a bounding box. */
export function center(b: SpatialBounds): SpatialPoint {
  return { x: b.x + b.width / 2, y: b.y + b.height / 2 };
}

/** Euclidean distance between two bounding-box centers. */
export function centerDistance(a: SpatialBounds, b: SpatialBounds): number {
  const ca = center(a);
  const cb = center(b);
  return Math.hypot(ca.x - cb.x, ca.y - cb.y);
}

/** True when two axis-aligned boxes overlap. */
export function overlaps(a: SpatialBounds, b: SpatialBounds): boolean {
  return (
    a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y
  );
}

/** Clamp a value to [min, max]. */
export function clamp(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v));
}

/** Translate a position so an object fits within canvas [0..1], respecting size. */
export function keepInBounds(b: SpatialBounds, canvasWidth = 1, canvasHeight = 1): SpatialBounds {
  return {
    ...b,
    x: clamp(b.x, 0, Math.max(0, canvasWidth - b.width)),
    y: clamp(b.y, 0, Math.max(0, canvasHeight - b.height)),
    width: Math.min(b.width, canvasWidth),
    height: Math.min(b.height, canvasHeight),
  };
}

/** Fit an object centered inside a zone. */
export function fitInZone(b: SpatialBounds, zone: SpatialBounds): SpatialBounds {
  const w = Math.min(b.width, zone.width);
  const h = Math.min(b.height, zone.height);
  return {
    x: zone.x + (zone.width - w) / 2,
    y: zone.y + (zone.height - h) / 2,
    width: w,
    height: h,
  };
}

/**
 * Resolve overlaps by softly pushing overlapping boxes apart along the axis
 * with the smallest penetration. Deterministic and pure (returns new boxes).
 */
export function resolveOverlaps(boxes: SpatialBounds[]): SpatialBounds[] {
  const result = boxes.map(b => ({ ...b }));
  const PUSH = 0.01;

  for (let pass = 0; pass < 8; pass++) {
    let moved = false;
    for (let i = 0; i < result.length; i++) {
      for (let j = i + 1; j < result.length; j++) {
        const a = result[i];
        const b = result[j];
        if (!overlaps(a, b)) continue;

        const dx = Math.min(a.x + a.width - b.x, b.x + b.width - a.x);
        const dy = Math.min(a.y + a.height - b.y, b.y + b.height - a.y);

        if (dx < dy) {
          if (center(a).x < center(b).x) {
            a.x = clamp(a.x - PUSH, 0, 1 - a.width);
            b.x = clamp(b.x + PUSH, 0, 1 - b.width);
          } else {
            a.x = clamp(a.x + PUSH, 0, 1 - a.width);
            b.x = clamp(b.x - PUSH, 0, 1 - b.width);
          }
        } else {
          if (center(a).y < center(b).y) {
            a.y = clamp(a.y - PUSH, 0, 1 - a.height);
            b.y = clamp(b.y + PUSH, 0, 1 - b.height);
          } else {
            a.y = clamp(a.y + PUSH, 0, 1 - a.height);
            b.y = clamp(b.y - PUSH, 0, 1 - b.height);
          }
        }
        moved = true;
      }
    }
    if (!moved) break;
  }

  return result;
}

/** Pair key helper: canonical "a|b" for two ids. */
export function pairKey(a: string, b: string): string {
  return a < b ? `${a}|${b}` : `${b}|${a}`;
}