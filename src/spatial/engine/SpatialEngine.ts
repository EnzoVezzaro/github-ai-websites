import type { SpatialEvent, SpatialObject, SpatialZone, PairKey } from '../types';
import { centerDistance, pairKey, fitInZone, keepInBounds, resolveOverlaps } from './geometry';

export interface EngineOptions {
  /** Proximity threshold in the same coordinate space as bounds (default 0.25 normalized). */
  proximityThreshold?: number;
  /** Snap-to-zone distance threshold (default 0.15 normalized). */
  snapThreshold?: number;
}

/**
 * SpatialEngine — the heart of the spatial runtime.
 *
 * - Theme-agnostic: never checks "which theme is active".
 * - Operates on objects and zones in a shared coordinate space (normalized 0-1).
 * - Emits typed SpatialEvents for every state change.
 * - Consumers (themes, UI, renderer) subscribe to events and decide what to render.
 */
export class SpatialEngine {
  private objects = new Map<string, SpatialObject>();
  private zones = new Map<string, SpatialZone>();
  private listeners = new Set<(e: SpatialEvent) => void>();
  private nearPairs = new Set<PairKey>();
  private mergedGroups = new Map<string, string[]>(); // groupId -> member ids
  private options: Required<EngineOptions>;

  constructor(objects: SpatialObject[] = [], zones: SpatialZone[] = [], options: EngineOptions = {}) {
    for (const o of objects) this.objects.set(o.id, o);
    for (const z of zones) this.zones.set(z.id, z);
    this.options = {
      proximityThreshold: options.proximityThreshold ?? 0.25,
      snapThreshold: options.snapThreshold ?? 0.15,
    };
  }

  // ── Event subscription ─────────────────────────────────────────────
  on(fn: (e: SpatialEvent) => void): () => void {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }

  off(fn: (e: SpatialEvent) => void): void {
    this.listeners.delete(fn);
  }

  private emit(event: SpatialEvent): void {
    for (const fn of this.listeners) fn(event);
  }

  // ── Accessors ───────────────────────────────────────────────────────
  getObject(id: string): SpatialObject | undefined {
    return this.objects.get(id);
  }

  getObjects(): SpatialObject[] {
    return [...this.objects.values()];
  }

  getZone(id: string): SpatialZone | undefined {
    return this.zones.get(id);
  }

  getZones(): SpatialZone[] {
    return [...this.zones.values()];
  }

  // ── Object lifecycle ──────────────────────────────────────────────
  addObject(obj: SpatialObject): void {
    this.objects.set(obj.id, obj);
    this.emit({ type: 'dragStart', objectId: obj.id, position: { x: obj.bounds.x, y: obj.bounds.y } });
    this.step();
  }

  removeObject(id: string): void {
    this.objects.delete(id);
    this.emit({ type: 'split', objectId: id });
    this.step();
  }

  addZone(zone: SpatialZone): void {
    this.zones.set(zone.id, zone);
  }

  removeZone(id: string): void {
    this.zones.delete(id);
  }
// ── Core operations (theme-agnostic) ────────────────────────────────
  dragStart(objectId: string, point: { x: number; y: number }): void {
    this.emit({ type: 'dragStart', objectId, position: point });
  }

  move(objectId: string, point: { x: number; y: number }): void {
    const obj = this.objects.get(objectId);
    if (!obj) return;

    obj.bounds = keepInBounds({
      ...obj.bounds,
      x: point.x - obj.bounds.width / 2,
      y: point.y - obj.bounds.height / 2,
    });

    this.emit({ type: 'drag', objectId, position: { x: obj.bounds.x, y: obj.bounds.y } });
    this.detectProximity();
  }

  dragEnd(objectId: string, point: { x: number; y: number }): void {
    this.emit({ type: 'dragEnd', objectId, position: point });

    const obj = this.objects.get(objectId);
    if (!obj) return;

    // Snap-to-zone on release
    for (const zone of this.zones.values()) {
      const dist = centerDistance(obj.bounds, zone.bounds);
      if (dist < this.options.snapThreshold) {
        obj.bounds = fitInZone(obj.bounds, zone.bounds);
        this.emit({ type: 'snap', objectId, target: zone.id, position: { x: obj.bounds.x, y: obj.bounds.y } });
        this.emit({ type: 'resize', objectId, data: obj.bounds });
        break;
      }
    }

    this.detectProximity();
  }

  snap(objectId: string, zoneId: string): void {
    const obj = this.objects.get(objectId);
    const zone = this.zones.get(zoneId);
    if (!obj || !zone) return;

    obj.bounds = fitInZone(obj.bounds, zone.bounds);
    this.emit({ type: 'snap', objectId, target: zoneId, position: { x: obj.bounds.x, y: obj.bounds.y } });
    this.emit({ type: 'resize', objectId, data: obj.bounds });
    this.detectProximity();
  }

  combine(sourceId: string, targetId: string): void {
    const source = this.objects.get(sourceId);
    const target = this.objects.get(targetId);
    if (!source || !target) return;

    const groupId = sourceId;
    const members = this.mergedGroups.get(groupId) ?? [sourceId];

    if (!members.includes(targetId)) {
      members.push(targetId);
    }
    this.mergedGroups.set(groupId, members);

    // Remove the absorbed object from the active set and emit merge
    this.objects.delete(targetId);
    this.emit({ type: 'merge', objectId: sourceId, target: targetId, data: { memberIds: [...members] } });
    this.detectProximity();
  }
split(groupId: string): void {
    const members = this.mergedGroups.get(groupId);
    if (!members) return;

    const original = this.getObject(groupId);
    const fallback = { bounds: { x: 0, y: 0, width: 0.2, height: 0.2 } };

    for (const memberId of members) {
      if (!this.objects.has(memberId)) {
        const baseBounds = original?.bounds ?? fallback.bounds;
        this.objects.set(memberId, {
          ...(original ?? { id: memberId, bounds: baseBounds }),
          id: memberId,
          bounds: {
            ...baseBounds,
            x: baseBounds.x + Math.random() * 0.02,
            y: baseBounds.y + Math.random() * 0.02,
          },
        });
      }
    }

    this.mergedGroups.delete(groupId);
    this.emit({ type: 'split', objectId: groupId, data: { memberIds: members } });
    this.detectProximity();
  }

  // ── Proximity / collision detection ─────────────────────────────────
  detectProximity(): void {
    const objs = [...this.objects.values()];
    const current = new Set<PairKey>();

    for (let i = 0; i < objs.length; i++) {
      for (let j = i + 1; j < objs.length; j++) {
        const a = objs[i];
        const b = objs[j];
        const dist = centerDistance(a.bounds, b.bounds);
        const key = pairKey(a.id, b.id);

        if (dist < this.options.proximityThreshold) {
          current.add(key);
          if (!this.nearPairs.has(key)) {
            this.nearPairs.add(key);
            this.emit({ type: 'near', objectId: a.id, target: b.id, position: { x: dist, y: 0 } });
          }
        }
      }
    }

    // Emit 'separate' for pairs that were near but are no longer
    for (const key of this.nearPairs) {
      if (!current.has(key)) {
        this.nearPairs.delete(key);
        const [aId, bId] = key.split('|');
        this.emit({ type: 'separate', objectId: aId, target: bId });
      }
    }

    // Resolve overlap collisions deterministically
    const all = objs.map(o => ({ ...o.bounds }));
    const resolved = resolveOverlaps(all);
    for (let i = 0; i < objs.length; i++) {
      const o = objs[i];
      const r = resolved[i];
      if (o.bounds.x !== r.x || o.bounds.y !== r.y) {
        o.bounds = r;
        this.emit({ type: 'collision', objectId: o.id, position: { x: r.x, y: r.y } });
      }
    }
  }

  /** Convenience: run all detection after a batch of changes. */
  step(): void {
    this.detectProximity();
  }

  // ── Snapshot ────────────────────────────────────────────────────────
  getSnapshot() {
    return {
      objects: this.getObjects(),
      zones: this.getZones(),
      nearPairs: [...this.nearPairs].map(k => {
        const [a, b] = k.split('|');
        return { source: a, target: b };
      }),
      mergedGroups: [...this.mergedGroups.entries()].map(([group, members]) => ({ group, members })),
    };
  }
}