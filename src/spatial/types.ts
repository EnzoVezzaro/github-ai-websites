/**
 * Spatial model — the "views" core of the Spatial Web Runtime.
 *
 * The content defines WHAT exists (immutable content objects).
 * The spatial model + engine define WHERE objects can live (deterministic geometry).
 * The theme defines HOW it feels (physics, transitions, visual effects).
 *
 * Neither the model nor the engine ever asks "which theme is active".
 * The engine ONLY emits spatial events; subjects/themes consume them.
 */

export interface SpatialPoint {
  x: number;
  y: number;
}

/** Axis-aligned bounding box in the global coordinate space (usually normalized 0-1). */
export interface SpatialBounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

export type RelationshipType = 'near' | 'avoid' | 'group' | 'contain';

export interface SpatialRelationship {
  type: RelationshipType;
  target: string;
}

export interface SpatialObject {
  id: string;
  bounds: SpatialBounds;
  /** Preferred semantic zone (matched by id). */
  preferredZone?: string;
  /** Size constraints. */
  constraints?: {
    minWidth?: number;
    maxWidth?: number;
    minHeight?: number;
    maxHeight?: number;
  };
  /** Semantic relationships to other objects. */
  relationships?: SpatialRelationship[];
  /** Arbitrary content payload (the immutable content this object wraps). */
  data?: unknown;
}

export type ZoneType = 'hero' | 'content' | 'feature' | 'detail' | 'footer' | 'free';
export type ZoneLayout = 'single' | 'grid' | 'stack' | 'cluster' | 'free';

/** A semantic (invisible) region that objects can snap into. */
export interface SpatialZone {
  id: string;
  type: ZoneType;
  bounds: SpatialBounds;
  capacity: number | 'infinite';
  layout: ZoneLayout;
  priority: number;
}

export type SpatialEventType =
  | 'dragStart'
  | 'drag'
  | 'dragEnd'
  | 'near'
  | 'separate'
  | 'snap'
  | 'merge'
  | 'split'
  | 'resize'
  | 'collision';

export interface SpatialEvent {
  type: SpatialEventType;
  /** Primary object involved. */
  objectId: string;
  /** Secondary object or zone id. */
  target?: string;
  /** Position data (for drag/snap). */
  position?: SpatialPoint;
  /** Extra payload specific to the event type. */
  data?: unknown;
}

/** A proximity pair key (sorted, canonical: "a|b"). */
export type PairKey = string;
