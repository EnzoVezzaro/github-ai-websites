import { describe, it, expect } from 'vitest';
import {
  packObjects,
  contentFootprint,
  reflow,
  snapPull,
  snapZoneBounds,
  isInside,
  type AdaptiveZoneInput,
} from '../../src/spatial/engine/adaptiveZones';
import type { SpatialBounds } from '../../src/spatial/types';

const viewport: SpatialBounds = { x: 0, y: 0, width: 1, height: 1 };

describe('packObjects', () => {
  it('packs row layout horizontally within bounds', () => {
    const rects = packObjects('row', 3, { x: 0.1, y: 0.1, width: 0.6, height: 0.2 });
    expect(rects).toHaveLength(3);
    for (const r of rects) {
      expect(r.x).toBeGreaterThanOrEqual(0.1);
      expect(r.x + r.width).toBeLessThanOrEqual(0.7);
      expect(r.y).toBe(0.1);
      expect(r.height).toBe(0.2);
    }
    expect(rects[0].x).toBeLessThan(rects[1].x);
    expect(rects[1].x).toBeLessThan(rects[2].x);
  });

  it('packs column layout vertically within bounds', () => {
    const rects = packObjects('column', 3, { x: 0.2, y: 0.2, width: 0.3, height: 0.6 });
    expect(rects).toHaveLength(3);
    for (const r of rects) {
      expect(r.y).toBeGreaterThanOrEqual(0.2);
      expect(r.y + r.height).toBeLessThanOrEqual(0.8);
      expect(r.x).toBe(0.2);
      expect(r.width).toBe(0.3);
    }
  });

  it('packs grid layout with no gaps between items', () => {
    const rects = packObjects('grid', 4, { x: 0, y: 0, width: 1, height: 1 });
    expect(rects).toHaveLength(4);
    for (const r of rects) {
      expect(r.width).toBeGreaterThan(0);
      expect(r.height).toBeGreaterThan(0);
    }
    const total = rects.reduce((sum, r) => sum + r.width * r.height, 0);
    expect(total).toBeLessThanOrEqual(1);
  });

  it('returns empty array for zero count', () => {
    expect(packObjects('grid', 0, viewport)).toEqual([]);
  });

  it('stack layout cascades with offsets', () => {
    const rects = packObjects('stack', 2, { x: 0, y: 0, width: 0.5, height: 0.5 });
    expect(rects[1].x).toBeGreaterThan(rects[0].x);
    expect(rects[1].y).toBeGreaterThan(rects[0].y);
  });
});

describe('contentFootprint', () => {
  const item = { width: 0.3, height: 0.2 };

  it('row grows horizontally with count', () => {
    const one = contentFootprint('row', 1, item);
    const three = contentFootprint('row', 3, item);
    expect(three.width).toBeGreaterThan(one.width);
    expect(one.height).toBeCloseTo(item.height, 5);
  });

  it('column grows vertically with count', () => {
    const one = contentFootprint('column', 1, item);
    const three = contentFootprint('column', 3, item);
    expect(three.height).toBeGreaterThan(one.height);
  });

  it('grid grows in both directions', () => {
    const two = contentFootprint('grid', 2, item);
    const nine = contentFootprint('grid', 9, item);
    expect(nine.width).toBeGreaterThan(two.width);
    expect(nine.height).toBeGreaterThanOrEqual(two.height);
  });

  it('returns a tiny footprint for empty zones', () => {
    const f = contentFootprint('grid', 0, item);
    expect(f.width).toBeLessThan(0.1);
    expect(f.height).toBeLessThan(0.1);
  });
});

describe('reflow', () => {
  const makeZones = (): AdaptiveZoneInput[] => [
    { id: 'intro', layout: 'row', priority: 9, preferred: { x: 0.05, y: 0.05, width: 0.9, height: 0.2 } },
    { id: 'story', layout: 'grid', priority: 8, preferred: { x: 0.05, y: 0.28, width: 0.55, height: 0.4 } },
    { id: 'ideas', layout: 'column', priority: 6, preferred: { x: 0.63, y: 0.28, width: 0.32, height: 0.4 } },
    { id: 'media', layout: 'row', priority: 6, preferred: { x: 0.05, y: 0.71, width: 0.9, height: 0.2 } },
  ];

  it('keeps every zone inside the viewport', () => {
    const objects = {
      intro: [{ id: 'a', size: { width: 0.26, height: 0.16 } }],
      story: [{ id: 'b', size: { width: 0.26, height: 0.16 } }, { id: 'c', size: { width: 0.26, height: 0.16 } }],
    };
    const { zones } = reflow(makeZones(), objects, viewport);
    for (const z of zones) {
      expect(z.bounds.x).toBeGreaterThanOrEqual(0);
      expect(z.bounds.y).toBeGreaterThanOrEqual(0);
      expect(z.bounds.x + z.bounds.width).toBeLessThanOrEqual(1.0001);
      expect(z.bounds.y + z.bounds.height).toBeLessThanOrEqual(1.0001);
    }
  });

  it('packs objects inside their zone bounds', () => {
    const objects = {
      story: [{ id: 'b', size: { width: 0.26, height: 0.16 } }, { id: 'c', size: { width: 0.26, height: 0.16 } }],
    };
    const { zones, objects: placed } = reflow(makeZones(), objects, viewport);
    const story = zones.find(z => z.id === 'story')!;
    for (const id of ['b', 'c']) {
      const rect = placed[id];
      expect(rect).toBeDefined();
      expect(rect.x).toBeGreaterThanOrEqual(story.bounds.x - 0.0001);
      expect(rect.y).toBeGreaterThanOrEqual(story.bounds.y - 0.0001);
      expect(rect.x + rect.width).toBeLessThanOrEqual(story.bounds.x + story.bounds.width + 0.0001);
      expect(rect.y + rect.height).toBeLessThanOrEqual(story.bounds.y + story.bounds.height + 0.0001);
    }
  });

  it('zones grow when they contain more objects', () => {
    const zonesA = makeZones();
    const zonesB = makeZones();
    const rA = reflow(zonesA, { story: [{ id: 'x', size: { width: 0.26, height: 0.16 } }] }, viewport);
    const rB = reflow(zonesB, {
      story: [
        { id: 'x', size: { width: 0.26, height: 0.16 } },
        { id: 'y', size: { width: 0.26, height: 0.16 } },
        { id: 'z', size: { width: 0.26, height: 0.16 } },
      ],
    }, viewport);
    const sA = rA.zones.find(z => z.id === 'story')!;
    const sB = rB.zones.find(z => z.id === 'story')!;
    expect(sB.bounds.width * sB.bounds.height).toBeGreaterThan(sA.bounds.width * sA.bounds.height);
  });

  it('is deterministic for identical input', () => {
    const objects = {
      story: [{ id: 'b', size: { width: 0.26, height: 0.16 } }, { id: 'c', size: { width: 0.26, height: 0.16 } }],
    };
    const a = reflow(makeZones(), objects, viewport);
    const b = reflow(makeZones(), objects, viewport);
    expect(a.zones.map(z => z.bounds)).toEqual(b.zones.map(z => z.bounds));
  });

  it('high-priority zones are not displaced by low-priority ones', () => {
    const zones = [
      { id: 'hero', layout: 'grid' as const, priority: 100, preferred: { x: 0, y: 0, width: 0.9, height: 0.9 } },
      { id: 'footer', layout: 'grid' as const, priority: 1, preferred: { x: 0.8, y: 0.8, width: 0.3, height: 0.3 } },
    ];
    const { zones: placed } = reflow(zones, { hero: [{ id: 'h', size: { width: 0.26, height: 0.16 } }] }, viewport);
    const hero = placed.find(z => z.id === 'hero')!;
    const footer = placed.find(z => z.id === 'footer')!;
    expect(hero.bounds.width * hero.bounds.height).toBeGreaterThan(footer.bounds.width * footer.bounds.height);
  });

  it('empty zones shrink to a small footprint', () => {
    const { zones } = reflow(makeZones(), {}, viewport);
    for (const z of zones) {
      expect(z.bounds.width).toBeLessThan(0.2);
      expect(z.bounds.height).toBeLessThan(0.2);
    }
  });
});

describe('snapPull', () => {
  const bounds: SpatialBounds = { x: 0.4, y: 0.4, width: 0.2, height: 0.2 };

  it('returns zero pull outside the threshold', () => {
    const pull = snapPull({ x: 0, y: 0 }, bounds, 0.2);
    expect(pull.dx).toBe(0);
    expect(pull.dy).toBe(0);
    expect(pull.strength).toBe(0);
  });

  it('pull grows stronger the closer the point is', () => {
    const far = snapPull({ x: 0.3, y: 0.5 }, bounds, 0.2);
    const near = snapPull({ x: 0.48, y: 0.5 }, bounds, 0.2);
    expect(near.strength).toBeGreaterThan(far.strength);
  });

  it('pull points toward the center', () => {
    const pull = snapPull({ x: 0.45, y: 0.5 }, bounds, 0.2);
    expect(pull.dx).toBeGreaterThan(0);
    expect(Math.abs(pull.dy)).toBeLessThan(0.001);
  });

  it('reports inside correctly', () => {
    expect(snapPull({ x: 0.5, y: 0.5 }, bounds, 0.2).inside).toBe(true);
    expect(snapPull({ x: 0.95, y: 0.5 }, bounds, 0.2).inside).toBe(false);
  });
});

describe('snapZoneBounds', () => {
  const viewport = { x: 0, y: 0, width: 1, height: 1 };
  const guides: SpatialBounds[] = [
    { x: 0.2, y: 0.3, width: 0.4, height: 0.2 },
  ];

  it('snaps a close left edge to a guide edge', () => {
    const moved = { x: 0.225, y: 0.8, width: 0.3, height: 0.1 };
    const snapped = snapZoneBounds(moved, guides, viewport, 0.045);
    expect(Math.abs(snapped.x - 0.2)).toBeLessThan(0.001);
  });

  it('snaps a close center to a guide center', () => {
    const moved = { x: 0.27, y: 0.8, width: 0.3, height: 0.1 };
    const snapped = snapZoneBounds(moved, guides, viewport, 0.045);
    expect(Math.abs(snapped.x + snapped.width / 2 - 0.4)).toBeLessThan(0.001);
  });

  it('leaves a distant zone unchanged', () => {
    const moved = { x: 0.7, y: 0.7, width: 0.2, height: 0.2 };
    const snapped = snapZoneBounds(moved, guides, viewport, 0.02);
    expect(snapped.x).toBeCloseTo(moved.x, 5);
    expect(snapped.y).toBeCloseTo(moved.y, 5);
  });

  it('clamps to the viewport edges', () => {
    const moved = { x: 0.95, y: -0.05, width: 0.3, height: 0.2 };
    const snapped = snapZoneBounds(moved, [], viewport, 0.2);
    expect(snapped.x).toBeGreaterThanOrEqual(0);
    expect(snapped.x + snapped.width).toBeLessThanOrEqual(1.0001);
    expect(snapped.y).toBeGreaterThanOrEqual(0);
  });
});

describe('isInside', () => {
  const bounds: SpatialBounds = { x: 0.2, y: 0.2, width: 0.4, height: 0.4 };
  it('detects containment', () => {
    expect(isInside({ x: 0.4, y: 0.4 }, bounds)).toBe(true);
    expect(isInside({ x: 0.1, y: 0.4 }, bounds)).toBe(false);
  });
});
