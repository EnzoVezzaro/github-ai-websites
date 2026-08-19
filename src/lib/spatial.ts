/**
 * Spatial zone system.
 * Each layout defines predefined zones where content slots can live.
 * Users drag content between zones; the layout visually interprets zones however it wants.
 */

export interface SpatialZone {
  id: string;
  /** Normalized position (0-1) relative to viewport */
  x: number;
  y: number;
  /** Normalized size (0-1) */
  width: number;
  height: number;
  /** Which content slot types are compatible */
  compatibleSlots: ContentSlotType[];
  /** Visual label */
  label: string;
}

export type ContentSlotType = 'intro' | 'story' | 'ideas' | 'media' | 'closing';

export interface ContentSlot {
  id: string;
  type: ContentSlotType;
  /** Current zone assignment — null means the block floats freely. */
  zoneId: string | null;
  /** Position within zone (normalized 0-1) */
  offsetX: number;
  offsetY: number;
  /** Size within zone (normalized 0-1) */
  width: number;
  height: number;
  /** Z-index for stacking */
  z: number;
}

export interface SpatialState {
  zones: SpatialZone[];
  slots: ContentSlot[];
}

/**
 * Default zone layouts for each universe.
 * Zones are defined in normalized viewport coordinates (0-1).
 */
export const ZONE_LAYOUTS: Record<string, SpatialZone[]> = {
  // Cartoon Network: Comic book panel grid
  'cartoon-network': [
    { id: 'z-intro', x: 0.05, y: 0.05, width: 0.42, height: 0.4, compatibleSlots: ['intro'], label: 'Panel A' },
    { id: 'z-story', x: 0.53, y: 0.05, width: 0.42, height: 0.4, compatibleSlots: ['story'], label: 'Panel B' },
    { id: 'z-ideas', x: 0.05, y: 0.5, width: 0.42, height: 0.45, compatibleSlots: ['ideas'], label: 'Panel C' },
    { id: 'z-media', x: 0.53, y: 0.5, width: 0.42, height: 0.25, compatibleSlots: ['media'], label: 'Panel D' },
    { id: 'z-closing', x: 0.53, y: 0.78, width: 0.42, height: 0.17, compatibleSlots: ['closing'], label: 'Boom' },
  ],
  // 90s: Stacked sections
  'nineties': [
    { id: 'z-intro', x: 0.1, y: 0.05, width: 0.8, height: 0.2, compatibleSlots: ['intro'], label: 'Header' },
    { id: 'z-story', x: 0.1, y: 0.28, width: 0.55, height: 0.3, compatibleSlots: ['story'], label: 'Main' },
    { id: 'z-ideas', x: 0.68, y: 0.28, width: 0.22, height: 0.3, compatibleSlots: ['ideas'], label: 'Sidebar' },
    { id: 'z-media', x: 0.1, y: 0.61, width: 0.8, height: 0.22, compatibleSlots: ['media'], label: 'Media' },
    { id: 'z-closing', x: 0.1, y: 0.86, width: 0.8, height: 0.1, compatibleSlots: ['closing'], label: 'Footer' },
  ],
  // 80s: Centered neon layout
  'eighties': [
    { id: 'z-intro', x: 0.15, y: 0.08, width: 0.7, height: 0.15, compatibleSlots: ['intro'], label: 'Neon Title' },
    { id: 'z-story', x: 0.1, y: 0.26, width: 0.8, height: 0.25, compatibleSlots: ['story'], label: 'Narrative' },
    { id: 'z-ideas', x: 0.1, y: 0.54, width: 0.4, height: 0.2, compatibleSlots: ['ideas'], label: 'Cassette' },
    { id: 'z-media', x: 0.53, y: 0.54, width: 0.37, height: 0.2, compatibleSlots: ['media'], label: 'VHS' },
    { id: 'z-closing', x: 0.15, y: 0.78, width: 0.7, height: 0.15, compatibleSlots: ['closing'], label: 'Outro' },
  ],
  // 2000s: Window-style layout
  'two-thousands': [
    { id: 'z-intro', x: 0.12, y: 0.08, width: 0.76, height: 0.18, compatibleSlots: ['intro'], label: 'Title Bar' },
    { id: 'z-story', x: 0.12, y: 0.28, width: 0.76, height: 0.22, compatibleSlots: ['story'], label: 'Content' },
    { id: 'z-ideas', x: 0.12, y: 0.52, width: 0.38, height: 0.2, compatibleSlots: ['ideas'], label: 'Notes' },
    { id: 'z-media', x: 0.52, y: 0.52, width: 0.36, height: 0.2, compatibleSlots: ['media'], label: 'Preview' },
    { id: 'z-closing', x: 0.12, y: 0.75, width: 0.76, height: 0.18, compatibleSlots: ['closing'], label: 'Action' },
  ],
  // B&W: Film strip layout
  'b-w-twenty': [
    { id: 'z-intro', x: 0.15, y: 0.05, width: 0.7, height: 0.18, compatibleSlots: ['intro'], label: 'Intertitle I' },
    { id: 'z-story', x: 0.15, y: 0.26, width: 0.7, height: 0.2, compatibleSlots: ['story'], label: 'Intertitle II' },
    { id: 'z-ideas', x: 0.15, y: 0.49, width: 0.7, height: 0.15, compatibleSlots: ['ideas'], label: 'Intertitle III' },
    { id: 'z-media', x: 0.1, y: 0.67, width: 0.8, height: 0.18, compatibleSlots: ['media'], label: 'Scene' },
    { id: 'z-closing', x: 0.15, y: 0.88, width: 0.7, height: 0.08, compatibleSlots: ['closing'], label: 'Fin' },
  ],
};

/** Default spatial state for a given layout */
export function getDefaultSpatialState(layoutId: string): SpatialState {
  const zones = ZONE_LAYOUTS[layoutId] || ZONE_LAYOUTS['cartoon-network'];
  const slotTypes: ContentSlotType[] = ['intro', 'story', 'ideas', 'media', 'closing'];

  const slots: ContentSlot[] = zones.map((zone, i) => ({
    id: `slot-${slotTypes[i]}`,
    type: slotTypes[i],
    zoneId: zone.id,
    offsetX: 0,
    offsetY: 0,
    width: 1,
    height: 1,
    z: i,
  }));

  return { zones, slots };
}

/** Check if a slot is compatible with a zone */
export function isSlotCompatible(slot: ContentSlot, zone: SpatialZone): boolean {
  return zone.compatibleSlots.includes(slot.type);
}

/** Find the nearest zone for a given viewport position */
export function findNearestZone(
  x: number,
  y: number,
  zones: SpatialZone[],
  slot: ContentSlot
): SpatialZone | null {
  let best: SpatialZone | null = null;
  let bestDist = Infinity;

  for (const zone of zones) {
    if (!isSlotCompatible(slot, zone)) continue;
    const cx = zone.x + zone.width / 2;
    const cy = zone.y + zone.height / 2;
    const dist = Math.hypot(x - cx, y - cy);
    if (dist < bestDist) {
      bestDist = dist;
      best = zone;
    }
  }
  return best;
}

/** Snap position to nearest valid zone, with priority for origin */
export function snapToZone(
  x: number,
  y: number,
  zones: SpatialZone[],
  slot: ContentSlot,
  originZoneId?: string,
  threshold: number = 0.15
): { zone: SpatialZone; snapped: boolean } | null {
  // 1. Check if we are snapping back to origin
  if (originZoneId) {
    const originZone = zones.find(z => z.id === originZoneId);
    if (originZone) {
      const cx = originZone.x + originZone.width / 2;
      const cy = originZone.y + originZone.height / 2;
      const dist = Math.hypot(x - cx, y - cy);
      if (dist < threshold) {
        return { zone: originZone, snapped: true };
      }
    }
  }

  // 2. Otherwise find nearest
  const zone = findNearestZone(x, y, zones, slot);
  if (!zone) return null;

  const cx = zone.x + zone.width / 2;
  const cy = zone.y + zone.height / 2;
  const dist = Math.hypot(x - cx, y - cy);

  return {
    zone,
    snapped: dist < threshold,
  };
}

/** Detect collisions between slots */
export function detectCollisions(slots: ContentSlot[]): [string, string][] {
  const collisions: [string, string][] = [];
  for (let i = 0; i < slots.length; i++) {
    for (let j = i + 1; j < slots.length; j++) {
      const a = slots[i];
      const b = slots[j];
      if (a.zoneId === b.zoneId) {
        // Same zone — check overlap
        const ax = a.offsetX, ay = a.offsetY, aw = a.width, ah = a.height;
        const bx = b.offsetX, by = b.offsetY, bw = b.width, bh = b.height;
        if (ax < bx + bw && ax + aw > bx && ay < by + bh && ay + ah > by) {
          collisions.push([a.id, b.id]);
        }
      }
    }
  }
  return collisions;
}

/** Resolve collisions by pushing overlapping slots apart */
export function resolveCollisions(slots: ContentSlot[]): ContentSlot[] {
  const resolved = slots.map(s => ({ ...s }));
  const collisions = detectCollisions(resolved);

  for (const [aId, bId] of collisions) {
    const a = resolved.find(s => s.id === aId);
    const b = resolved.find(s => s.id === bId);
    if (!a || !b) continue;

    // Push b away from a
    const dx = (b.offsetX + b.width / 2) - (a.offsetX + a.width / 2);
    const dy = (b.offsetY + b.height / 2) - (a.offsetY + a.height / 2);
    const push = 0.05;

    if (Math.abs(dx) > Math.abs(dy)) {
      b.offsetX += dx > 0 ? push : -push;
    } else {
      b.offsetY += dy > 0 ? push : -push;
    }

    // Clamp to [0, 1]
    b.offsetX = Math.max(0, Math.min(1 - b.width, b.offsetX));
    b.offsetY = Math.max(0, Math.min(1 - b.height, b.offsetY));
  }

  return resolved;
}
