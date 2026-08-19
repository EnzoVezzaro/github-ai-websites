export type ContentSlot = 'intro' | 'story' | 'ideas' | 'media' | 'closing';

export type BoxType = 'heading' | 'text' | 'markdown' | 'image' | 'video' | 'list' | 'quote' | 'code' | 'embed' | 'divider';

export interface ContentBox {
  id: string;
  zone: ContentSlot;
  type: BoxType;
  data: string;
  /** For images/video: alt text. For lists: newline-separated items. */
  meta?: string;
}

export interface SpatialZone {
  id: string;
  type: 'hero' | 'content' | 'feature' | 'detail' | 'footer' | 'free';
  capacity: number | 'infinite';
  layout: 'single' | 'grid' | 'stack' | 'cluster' | 'free';
  priority: number;
}

export interface ContentObject {
  id: string;
  type: BoxType;
  data: string;
  /** Preferred zone for this object */
  preferredZone?: ContentSlot;
  /** Constraints on size */
  constraints?: {
    minWidth?: number;
    maxWidth?: number;
    minHeight?: number;
    maxHeight?: number;
  };
  /** Relationships to other objects */
  relationships?: {
    type: 'near' | 'avoid' | 'group' | 'contain';
    target?: string;
  }[];
}

export interface CompositionModel {
  objects: Record<string, ContentObject>;
  zones: Record<string, SpatialZone>;
  relationships: Record<string, string[]>;
}

export interface Universe {
  meta: {
    id: string;
    name: string;
    slug: string;
    description?: string;
    author?: string;
    version: string;
    createdAt: string;
    updatedAt: string;
  };
  /** Content organized by zone — boxes per semantic slot. Drives the composition model. */
  content: Record<string, ContentBox[]>;
  layout: {
    html: string;
    css: string;
    js?: string;
  };
  /** Spatial composition model */
  composition?: CompositionModel;
}

export interface SpatialTheme {
  id: string;
  name: string;
  motion: {
    drag: 'smooth' | 'fluid' | 'magnetic' | 'inertial';
    snap: 'magnetic' | 'liquid' | 'grid' | 'none';
  };
  effects: {
    gooey: boolean;
    metaballs: boolean;
    mergeThreshold: number;
    blur: boolean;
  };
  transitions: {
    duration: number;
    easing: string;
  };
}

export interface SpatialEvent {
  type: 'dragStart' | 'drag' | 'dragEnd' | 'near' | 'snap' | 'merge' | 'split' | 'resize';
  objectId: string;
  /** Target zone or object */
  target?: string;
  /** Position data */
  position?: { x: number; y: number };
  /** Additional data depending on event type */
  data?: unknown;
}

export interface EngineState {
  activeTheme: string;
  objects: Record<string, ContentObject>;
  zones: Record<string, SpatialZone>;
  selectedObject?: string;
  pointerId: number | null;
}

export interface GitHubUser {
  login: string;
  avatar_url: string;
  name?: string;
}

export interface ProjectContent {
  id: string;
  title: string;
  slug: string;
  author?: string;
  intro: string;
  story: string;
  ideas: string;
  media: string;
  closing: string;
  updatedAt: string;
}

export interface LayoutMeta {
  id: string;
  name: string;
  author?: string;
  description?: string;
  version: string;
  updatedAt: string;
}

export interface LayoutFiles {
  meta: LayoutMeta;
  html: string;
  css: string;
  js?: string;
}

export interface ExplorerState {
  projectId: string;
  layoutId: string;
  universeId?: string;
}