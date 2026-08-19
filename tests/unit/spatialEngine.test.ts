import { describe, it, expect } from 'vitest';
import { SpatialEngine } from '../../src/spatial/engine/SpatialEngine';
import type { SpatialObject, SpatialZone } from '../../src/spatial/types';

function obj(id: string, x: number, y: number, width = 0.1, height = 0.1): SpatialObject {
  return { id, bounds: { x, y, width, height } };
}

function zone(id: string, x: number, y: number, width = 0.3, height = 0.2): SpatialZone {
  return { id, type: 'content', bounds: { x, y, width, height }, capacity: 'infinite', layout: 'free', priority: 1 };
}

describe('SpatialEngine', () => {
  it('emits `near` when two objects are within proximity', () => {
    const engine = new SpatialEngine([obj('a', 0, 0), obj('b', 0, 0)], [], { proximityThreshold: 0.5 });
    const events: string[] = [];
    engine.on((e) => events.push(e.type));

    engine.detectProximity();

    expect(events).toContain('near');
    expect(engine.getSnapshot().nearPairs.some((p) => [p.source, p.target].sort().join('') === 'ab')).toBe(true);
  });

  it('emits `separate` when a near pair drifts apart', () => {
    const engine = new SpatialEngine([obj('a', 0, 0), obj('b', 0, 0)], [], { proximityThreshold: 0.5 });
    const events: string[] = [];
    engine.on((e) => events.push(e.type));
    engine.detectProximity(); // near
    events.length = 0;

    engine.move('b', { x: 0.9, y: 0.9 });

    expect(events).toContain('drag');
    expect(events).toContain('separate');
    expect(engine.getSnapshot().nearPairs).toHaveLength(0);
  });

  it('snaps an object into a zone and emits the snap event', () => {
    const engine = new SpatialEngine([obj('a', 0, 0)], [zone('hero', 0, 0, 0.3, 0.2)], { proximityThreshold: 0.1 });
    const snaps: string[] = [];
    engine.on((e) => { if (e.type === 'snap') snaps.push(e.target ?? ''); });

    engine.snap('a', 'hero');

    expect(snaps).toEqual(['hero']);
    const o = engine.getObject('a');
    // Centered inside the zone
    expect(o?.bounds.x).toBeCloseTo(0.1);
    expect(o?.bounds.y).toBeCloseTo(0.05);
  });

  it('combine merges a target into a source and emits merge', () => {
    const engine = new SpatialEngine([obj('a', 0, 0), obj('b', 0.2, 0.2)]);
    const events: string[] = [];
    engine.on((e) => events.push(e.type));

    engine.combine('a', 'b');

    expect(events).toContain('merge');
    expect(engine.getObject('b')).toBeUndefined(); // absorbed
    expect(engine.getSnapshot().mergedGroups.some((g) => g.group === 'a' && g.members.includes('b'))).toBe(true);
  });

  it('split re-adds merged members and emits split', () => {
    const engine = new SpatialEngine([obj('a', 0, 0), obj('b', 0.2, 0.2)]);
    const events: string[] = [];
    engine.on((e) => events.push(e.type));

    engine.combine('a', 'b');
    events.length = 0;
    engine.split('a');

    expect(events).toContain('split');
    expect(engine.getObject('b')).toBeDefined();
    expect(engine.getSnapshot().mergedGroups.some((g) => g.group === 'a')).toBe(false);
  });

  it('respects listener unsubscribe', () => {
    const engine = new SpatialEngine([obj('a', 0, 0), obj('b', 0, 0)], [], { proximityThreshold: 0.5 });
    const events: string[] = [];
    const unsub = engine.on((e) => events.push(e.type));
    engine.detectProximity();
    expect(events).toContain('near');
    unsub();
    events.length = 0;
    engine.move('a', { x: 0.8, y: 0.8 });
    expect(events).toHaveLength(0);
  });

  it('clamps moved objects within the canvas', () => {
    const engine = new SpatialEngine([obj('a', 0, 0, 0.2, 0.2)]);
    engine.move('a', { x: 0.95, y: 0.95 });
    const o = engine.getObject('a')!;
    expect(o.bounds.x + o.bounds.width).toBeLessThanOrEqual(1);
    expect(o.bounds.y + o.bounds.height).toBeLessThanOrEqual(1);
  });
});