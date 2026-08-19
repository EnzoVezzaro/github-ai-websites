import { describe, it, expect } from 'vitest';
import {
  ZONE_LAYOUTS,
  getDefaultSpatialState,
  isSlotCompatible,
  findNearestZone,
  snapToZone,
  detectCollisions,
  resolveCollisions,
  type ContentSlot,
  type SpatialZone,
} from '../../src/lib/spatial';

describe('spatial', () => {
  describe('ZONE_LAYOUTS', () => {
    it('has 5 layout definitions', () => {
      expect(Object.keys(ZONE_LAYOUTS)).toHaveLength(5);
    });

    it('each layout has exactly 5 zones', () => {
      Object.values(ZONE_LAYOUTS).forEach(zones => {
        expect(zones).toHaveLength(5);
      });
    });

    it('each zone has required fields', () => {
      Object.values(ZONE_LAYOUTS).forEach(zones => {
        zones.forEach(zone => {
          expect(zone.id).toBeTruthy();
          expect(typeof zone.x).toBe('number');
          expect(typeof zone.y).toBe('number');
          expect(typeof zone.width).toBe('number');
          expect(typeof zone.height).toBe('number');
          expect(zone.compatibleSlots.length).toBeGreaterThan(0);
          expect(zone.label).toBeTruthy();
        });
      });
    });
  });

  describe('getDefaultSpatialState', () => {
    it('returns zones and slots for known layout', () => {
      const state = getDefaultSpatialState('cartoon-network');
      expect(state.zones).toHaveLength(5);
      expect(state.slots).toHaveLength(5);
    });

    it('falls back to cartoon-network for unknown layout', () => {
      const state = getDefaultSpatialState('nonexistent');
      expect(state.zones).toEqual(ZONE_LAYOUTS['cartoon-network']);
    });

    it('each slot has a matching zone', () => {
      const state = getDefaultSpatialState('eighties');
      state.slots.forEach(slot => {
        const zone = state.zones.find(z => z.id === slot.zoneId);
        expect(zone).toBeDefined();
      });
    });

    it('slot types are in order: intro, story, ideas, media, closing', () => {
      const state = getDefaultSpatialState('nineties');
      expect(state.slots[0].type).toBe('intro');
      expect(state.slots[1].type).toBe('story');
      expect(state.slots[2].type).toBe('ideas');
      expect(state.slots[3].type).toBe('media');
      expect(state.slots[4].type).toBe('closing');
    });
  });

  describe('isSlotCompatible', () => {
    it('returns true when slot type matches zone', () => {
      const slot: ContentSlot = { id: 's', type: 'intro', zoneId: 'z', offsetX: 0, offsetY: 0, width: 1, height: 1, z: 0 };
      const zone: SpatialZone = { id: 'z', x: 0, y: 0, width: 1, height: 1, compatibleSlots: ['intro', 'story'], label: 'Z' };
      expect(isSlotCompatible(slot, zone)).toBe(true);
    });

    it('returns false when slot type not in zone', () => {
      const slot: ContentSlot = { id: 's', type: 'media', zoneId: 'z', offsetX: 0, offsetY: 0, width: 1, height: 1, z: 0 };
      const zone: SpatialZone = { id: 'z', x: 0, y: 0, width: 1, height: 1, compatibleSlots: ['intro'], label: 'Z' };
      expect(isSlotCompatible(slot, zone)).toBe(false);
    });
  });

  describe('findNearestZone', () => {
    const zones: SpatialZone[] = [
      { id: 'z-intro', x: 0, y: 0, width: 0.5, height: 0.5, compatibleSlots: ['intro'], label: 'A' },
      { id: 'z-story', x: 0.5, y: 0.5, width: 0.5, height: 0.5, compatibleSlots: ['story'], label: 'B' },
    ];

    it('finds nearest compatible zone', () => {
      const slot: ContentSlot = { id: 's', type: 'intro', zoneId: 'z-intro', offsetX: 0, offsetY: 0, width: 1, height: 1, z: 0 };
      const nearest = findNearestZone(0.1, 0.1, zones, slot);
      expect(nearest?.id).toBe('z-intro');
    });

    it('skips incompatible zones', () => {
      const slot: ContentSlot = { id: 's', type: 'story', zoneId: 'z-story', offsetX: 0, offsetY: 0, width: 1, height: 1, z: 0 };
      const nearest = findNearestZone(0.1, 0.1, zones, slot);
      expect(nearest?.id).toBe('z-story');
    });

    it('returns null when no compatible zones', () => {
      const slot: ContentSlot = { id: 's', type: 'media', zoneId: 'z', offsetX: 0, offsetY: 0, width: 1, height: 1, z: 0 };
      const nearest = findNearestZone(0.5, 0.5, zones, slot);
      expect(nearest).toBeNull();
    });
  });

  describe('snapToZone', () => {
    const zones: SpatialZone[] = [
      { id: 'z-intro', x: 0, y: 0, width: 0.5, height: 0.5, compatibleSlots: ['intro'], label: 'A' },
      { id: 'z-story', x: 0.5, y: 0.5, width: 0.5, height: 0.5, compatibleSlots: ['story'], label: 'B' },
    ];

    it('snaps to origin zone when close', () => {
      const slot: ContentSlot = { id: 's', type: 'intro', zoneId: 'z-intro', offsetX: 0, offsetY: 0, width: 1, height: 1, z: 0 };
      const result = snapToZone(0.25, 0.25, zones, slot, 'z-intro', 0.15);
      expect(result?.zone.id).toBe('z-intro');
      expect(result?.snapped).toBe(true);
    });

    it('snaps to nearest when not at origin', () => {
      const slot: ContentSlot = { id: 's', type: 'story', zoneId: 'z-story', offsetX: 0, offsetY: 0, width: 1, height: 1, z: 0 };
      const result = snapToZone(0.7, 0.7, zones, slot);
      expect(result?.zone.id).toBe('z-story');
    });

    it('returns null when no compatible zone found', () => {
      const slot: ContentSlot = { id: 's', type: 'ideas', zoneId: 'z', offsetX: 0, offsetY: 0, width: 1, height: 1, z: 0 };
      const result = snapToZone(0.5, 0.5, zones, slot);
      expect(result).toBeNull();
    });
  });

  describe('detectCollisions', () => {
    it('detects overlapping slots in same zone', () => {
      const slots: ContentSlot[] = [
        { id: 'a', type: 'intro', zoneId: 'z1', offsetX: 0, offsetY: 0, width: 0.6, height: 0.6, z: 0 },
        { id: 'b', type: 'story', zoneId: 'z1', offsetX: 0.3, offsetY: 0.3, width: 0.6, height: 0.6, z: 1 },
      ];
      const collisions = detectCollisions(slots);
      expect(collisions).toHaveLength(1);
      expect(collisions[0]).toContain('a');
      expect(collisions[0]).toContain('b');
    });

    it('no collision for slots in different zones', () => {
      const slots: ContentSlot[] = [
        { id: 'a', type: 'intro', zoneId: 'z1', offsetX: 0, offsetY: 0, width: 0.5, height: 0.5, z: 0 },
        { id: 'b', type: 'story', zoneId: 'z2', offsetX: 0, offsetY: 0, width: 0.5, height: 0.5, z: 1 },
      ];
      expect(detectCollisions(slots)).toHaveLength(0);
    });

    it('no collision for non-overlapping slots in same zone', () => {
      const slots: ContentSlot[] = [
        { id: 'a', type: 'intro', zoneId: 'z1', offsetX: 0, offsetY: 0, width: 0.3, height: 0.3, z: 0 },
        { id: 'b', type: 'story', zoneId: 'z1', offsetX: 0.5, offsetY: 0.5, width: 0.3, height: 0.3, z: 1 },
      ];
      expect(detectCollisions(slots)).toHaveLength(0);
    });
  });

  describe('resolveCollisions', () => {
    it('pushes overlapping slots apart', () => {
      const slots: ContentSlot[] = [
        { id: 'a', type: 'intro', zoneId: 'z1', offsetX: 0.1, offsetY: 0.1, width: 0.5, height: 0.5, z: 0 },
        { id: 'b', type: 'story', zoneId: 'z1', offsetX: 0.3, offsetY: 0.3, width: 0.5, height: 0.5, z: 1 },
      ];
      const resolved = resolveCollisions(slots);
      // At least one slot should have moved
      const moved = resolved.some((s, i) => s.offsetX !== slots[i].offsetX || s.offsetY !== slots[i].offsetY);
      expect(moved).toBe(true);
    });

    it('does not mutate original slots', () => {
      const slots: ContentSlot[] = [
        { id: 'a', type: 'intro', zoneId: 'z1', offsetX: 0.3, offsetY: 0.3, width: 0.5, height: 0.5, z: 0 },
        { id: 'b', type: 'story', zoneId: 'z1', offsetX: 0.3, offsetY: 0.3, width: 0.5, height: 0.5, z: 1 },
      ];
      const original = slots.map(s => ({ ...s }));
      resolveCollisions(slots);
      expect(slots).toEqual(original);
    });

    it('clamps positions to [0, 1]', () => {
      const slots: ContentSlot[] = [
        { id: 'a', type: 'intro', zoneId: 'z1', offsetX: 0.9, offsetY: 0.9, width: 0.2, height: 0.2, z: 0 },
        { id: 'b', type: 'story', zoneId: 'z1', offsetX: 0.05, offsetY: 0.05, width: 0.2, height: 0.2, z: 1 },
      ];
      const resolved = resolveCollisions(slots);
      resolved.forEach(slot => {
        expect(slot.offsetX).toBeGreaterThanOrEqual(0);
        expect(slot.offsetX).toBeLessThanOrEqual(1);
        expect(slot.offsetY).toBeGreaterThanOrEqual(0);
        expect(slot.offsetY).toBeLessThanOrEqual(1);
      });
    });
  });
});
