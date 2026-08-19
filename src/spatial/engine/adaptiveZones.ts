import type { SpatialBounds, SpatialPoint } from '../types';

export type ZoneLayoutKind = 'grid' | 'stack' | 'cluster' | 'row' | 'column' | 'free';

export interface ZoneObject {
  id: string;
  size: { width: number; height: number };
}

export interface AdaptiveZoneInput {
  id: string;
  layout: ZoneLayoutKind;
  priority: number;
  preferred: SpatialBounds;
  minSize?: { width: number; height: number };
  maxSize?: { width: number; height: number };
}

export interface PlacedZone extends AdaptiveZoneInput {
  bounds: SpatialBounds;
}

export interface ReflowResult {
  zones: PlacedZone[];
  objects: Record<string, SpatialBounds>;
}

export interface SnapPull {
  dx: number;
  dy: number;
  strength: number;
  inside: boolean;
}

const GAP = 0.012;

function clamp(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v));
}

function centerOf(b: SpatialBounds): SpatialPoint {
  return { x: b.x + b.width / 2, y: b.y + b.height / 2 };
}

function overlaps(a: SpatialBounds, b: SpatialBounds): boolean {
  return (
    a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y
  );
}

function penetration(a: SpatialBounds, b: SpatialBounds): { dx: number; dy: number } {
  const left = a.x + a.width - b.x;
  const right = b.x + b.width - a.x;
  const top = a.y + a.height - b.y;
  const bottom = b.y + b.height - a.y;
  const dx = Math.min(left, right);
  const dy = Math.min(top, bottom);
  return { dx, dy };
}

export function packObjects(layout: ZoneLayoutKind, count: number, bounds: SpatialBounds): SpatialBounds[] {
  const n = Math.max(count, 0);
  if (n === 0) return [];
  const gap = GAP;

  switch (layout) {
    case 'row': {
      const w = (bounds.width - gap * (n - 1)) / n;
      return Array.from({ length: n }, (_, i) => ({
        x: bounds.x + i * (w + gap),
        y: bounds.y,
        width: w,
        height: bounds.height,
      }));
    }
    case 'column': {
      const h = (bounds.height - gap * (n - 1)) / n;
      return Array.from({ length: n }, (_, i) => ({
        x: bounds.x,
        y: bounds.y + i * (h + gap),
        width: bounds.width,
        height: h,
      }));
    }
    case 'stack': {
      const off = Math.min(bounds.width * 0.09, bounds.height * 0.09);
      return Array.from({ length: n }, (_, i) => ({
        x: bounds.x + i * off,
        y: bounds.y + i * off,
        width: Math.max(bounds.width - i * off * 2, bounds.width * 0.45),
        height: Math.max(bounds.height - i * off * 2, bounds.height * 0.45),
      }));
    }
    case 'cluster': {
      const cols = Math.max(1, Math.ceil(Math.sqrt(n)));
      const rows = Math.ceil(n / cols);
      const cw = bounds.width / cols;
      const ch = bounds.height / rows;
      return Array.from({ length: n }, (_, i) => {
        const c = i % cols;
        const r = Math.floor(i / cols);
        const jitter = (((i * 7919) % 997) / 997) * 0.2;
        const w = cw * (0.62 + jitter * 0.5);
        const h = ch * (0.62 + jitter * 0.5);
        return {
          x: bounds.x + c * cw + (cw - w) / 2,
          y: bounds.y + r * ch + (ch - h) / 2,
          width: w,
          height: h,
        };
      });
    }
    case 'free':
    case 'grid':
    default: {
      const aspect = bounds.width / Math.max(bounds.height, 0.001);
      const cols = Math.max(1, Math.ceil(Math.sqrt(n * aspect)));
      const rows = Math.ceil(n / cols);
      const cw = (bounds.width - gap * (cols - 1)) / cols;
      const ch = (bounds.height - gap * (rows - 1)) / rows;
      return Array.from({ length: n }, (_, i) => {
        const c = i % cols;
        const r = Math.floor(i / cols);
        return { x: bounds.x + c * (cw + gap), y: bounds.y + r * (ch + gap), width: cw, height: ch };
      });
    }
  }
}

export function contentFootprint(
  layout: ZoneLayoutKind,
  count: number,
  itemSize: { width: number; height: number },
): { width: number; height: number } {
  const n = Math.max(count, 0);
  if (n === 0) return { width: 0.05, height: 0.05 };
  const gap = GAP;
  switch (layout) {
    case 'row':
      return { width: n * itemSize.width + (n - 1) * gap, height: itemSize.height };
    case 'column':
      return { width: itemSize.width, height: n * itemSize.height + (n - 1) * gap };
    case 'stack':
      return { width: itemSize.width, height: itemSize.height };
    case 'cluster': {
      const side = Math.ceil(Math.sqrt(n));
      return { width: side * itemSize.width * 0.82, height: side * itemSize.height * 0.82 };
    }
    case 'free':
      return itemSize;
    case 'grid':
    default: {
      const cols = Math.max(1, Math.ceil(Math.sqrt(n * (itemSize.width / Math.max(itemSize.height, 0.001)))));
      const rows = Math.ceil(n / cols);
      return {
        width: cols * itemSize.width + (cols - 1) * gap,
        height: rows * itemSize.height + (rows - 1) * gap,
      };
    }
  }
}

function desiredBounds(zone: AdaptiveZoneInput, count: number, viewport: SpatialBounds): SpatialBounds {
  const item = zone.layout === 'free'
    ? { width: zone.preferred.width, height: zone.preferred.height }
    : { width: viewport.width * 0.26, height: viewport.height * 0.16 };
  const foot = contentFootprint(zone.layout, count, item);
  const minW = zone.minSize?.width ?? foot.width;
  const minH = zone.minSize?.height ?? foot.height;
  const maxW = zone.maxSize?.width ?? Math.max(foot.width, viewport.width);
  const maxH = zone.maxSize?.height ?? Math.max(foot.height, viewport.height);

  const width = clamp(foot.width, minW, Math.min(maxW, viewport.width));
  const height = clamp(foot.height, minH, Math.min(maxH, viewport.height));

  let x = zone.preferred.x + (zone.preferred.width - width) / 2;
  let y = zone.preferred.y + (zone.preferred.height - height) / 2;
  x = clamp(x, 0, Math.max(0, viewport.width - width));
  y = clamp(y, 0, Math.max(0, viewport.height - height));
  return { x, y, width, height };
}

function resolveOverlap(self: SpatialBounds, others: SpatialBounds[]): SpatialBounds {
  let bounds = { ...self };
  for (let iter = 0; iter < 12; iter++) {
    let pushed = false;
    for (const other of others) {
      if (!overlaps(bounds, other)) continue;
      const { dx, dy } = penetration(bounds, other);
      const ca = centerOf(bounds);
      const cb = centerOf(other);
      if (dx <= dy) {
        if (ca.x < cb.x) bounds.x = clamp(bounds.x - dx - 0.002, 0, 1 - bounds.width);
        else bounds.x = clamp(bounds.x + dx + 0.002, 0, 1 - bounds.width);
      } else {
        if (ca.y < cb.y) bounds.y = clamp(bounds.y - dy - 0.002, 0, 1 - bounds.height);
        else bounds.y = clamp(bounds.y + dy + 0.002, 0, 1 - bounds.height);
      }
      pushed = true;
    }
    if (!pushed) break;
  }
  return bounds;
}

/**
 * Compute a full adaptive composition:
 * 1. size each zone from its object count + layout (responsive to viewport)
 * 2. resolve conflicts by priority (higher priority keeps space)
 * 3. pack objects into their zone bounds
 */
export function reflow(
  zones: AdaptiveZoneInput[],
  objectsByZone: Record<string, ZoneObject[]>,
  viewport: SpatialBounds,
): ReflowResult {
  const view = { x: 0, y: 0, width: viewport.width, height: viewport.height };
  const ordered = [...zones].sort((a, b) => b.priority - a.priority || a.id.localeCompare(b.id));

  const placed: PlacedZone[] = [];
  const committed: SpatialBounds[] = [];

  for (const zone of ordered) {
    const count = (objectsByZone[zone.id] ?? []).length;
    let bounds = desiredBounds(zone, count, view);
    bounds = resolveOverlap(bounds, committed);
    bounds = {
      ...bounds,
      x: clamp(bounds.x, 0, Math.max(0, view.width - bounds.width)),
      y: clamp(bounds.y, 0, Math.max(0, view.height - bounds.height)),
    };
    placed.push({ ...zone, bounds });
    committed.push(bounds);
  }

  const objects: Record<string, SpatialBounds> = {};
  for (const zone of placed) {
    const members = objectsByZone[zone.id] ?? [];
    const rects = packObjects(zone.layout, members.length, zone.bounds);
    members.forEach((m, i) => {
      objects[m.id] = rects[i];
    });
  }

  return { zones: placed, objects };
}

export function isInside(point: SpatialPoint, bounds: SpatialBounds): boolean {
  return (
    point.x >= bounds.x &&
    point.x <= bounds.x + bounds.width &&
    point.y >= bounds.y &&
    point.y <= bounds.y + bounds.height
  );
}

/**
 * Progressive snap: the closer a free object is to a zone, the stronger the
 * attraction. Returns the pull vector toward the zone's center, eased in.
 */
export function snapPull(point: SpatialPoint, bounds: SpatialBounds, threshold: number): SnapPull {
  const c = centerOf(bounds);
  const dx = c.x - point.x;
  const dy = c.y - point.y;
  const dist = Math.hypot(dx, dy);
  if (dist > threshold) return { dx: 0, dy: 0, strength: 0, inside: false };
  const strength = 1 - dist / Math.max(threshold, 1e-6);
  const k = strength * strength;
  return { dx: dx * k, dy: dy * k, strength, inside: isInside(point, bounds) };
}

/**
 * Magnetic snapping for manually moved zones: aligns the zone's left/right/
 * center-x to other zones' edges/centers and the viewport, and the same for
 * the y axis, whichever candidate is within `threshold`.
 */
export function snapZoneBounds(
  bounds: SpatialBounds,
  guides: SpatialBounds[],
  viewport: SpatialBounds,
  threshold = 0.045,
): SpatialBounds {
  const edgeX = [0, viewport.width];
  const edgeY = [0, viewport.height];
  for (const g of guides) {
    edgeX.push(g.x, g.x + g.width / 2, g.x + g.width);
    edgeY.push(g.y, g.y + g.height / 2, g.y + g.height);
  }

  const candidatesX = [bounds.x, bounds.x + bounds.width / 2, bounds.x + bounds.width];
  const candidatesY = [bounds.y, bounds.y + bounds.height / 2, bounds.y + bounds.height];

  let x = bounds.x;
  let dx = threshold;
  for (const c of candidatesX) {
    for (const e of edgeX) {
      const d = Math.abs(c - e);
      if (d < dx) {
        dx = d;
        x = bounds.x + (e - c);
      }
    }
  }

  let y = bounds.y;
  let dy = threshold;
  for (const c of candidatesY) {
    for (const e of edgeY) {
      const d = Math.abs(c - e);
      if (d < dy) {
        dy = d;
        y = bounds.y + (e - c);
      }
    }
  }

  return {
    ...bounds,
    x: clamp(x, 0, Math.max(0, viewport.width - bounds.width)),
    y: clamp(y, 0, Math.max(0, viewport.height - bounds.height)),
  };
}
