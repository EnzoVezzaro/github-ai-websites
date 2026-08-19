import type { ReactNode } from 'react';
import type { SpatialObject } from '../spatial/types';

/**
 * Theme contract — "how it feels".
 *
 * A theme is NOT a list of colors. It is a behavioral + visual policy that
 * the Theme Manager applies on top of the theme-agnostic Spatial Engine.
 *
 * The engine never asks "which theme is active". It only emits spatial
 * events (near / snap / merge / split). Each theme decides — via its
 * motion/effects/connection config and optional render hooks — what to
 * visualize for those events.
 */

export type DragMotion = 'smooth' | 'fluid' | 'magnetic' | 'inertial' | 'spring' | 'none';
export type SnapMotion = 'magnetic' | 'liquid' | 'grid' | 'none';

export interface SpringConfig {
  type: 'spring' | 'tween';
  /** spring: stiffness */
  stiffness?: number;
  /** spring: damping */
  damping?: number;
  /** spring: mass */
  mass?: number;
  /** tween/spring fallback duration (seconds) */
  duration?: number;
}

export interface MotionConfig {
  drag: SpringConfig;
  snap: SpringConfig;
  release: SpringConfig;
}

export interface EffectsConfig {
  gooey: boolean;
  metaballs: boolean;
  /** Distance (0-1) under which nearby objects merge visually. */
  mergeThreshold: number;
  glass: { blur: number };
  shadow: number;
  /** Visual scale applied while dragging (liquid/organic feel). */
  dragScale: number;
  connectionPulse: boolean;
}

export interface ThemeVisuals {
  accent: string;
  cardBackground: string;
  cardBorder: string;
  radius: number;
  glow?: string;
}

export interface ConnectionConfig {
  enabled: boolean;
  /** 0-1 proximity factor under which a connection should be drawn. */
  threshold: number;
  /** Optional render of the connection between two near objects. */
  render?: (source: SpatialObject, target: SpatialObject) => ReactNode;
}

export interface TransitionsConfig {
  enter: SpringConfig;
  exit: SpringConfig;
  merge: SpringConfig;
  split: SpringConfig;
}

export interface SpatialThemeBehavior {
  /** Stable id, e.g. "minimal", "gooey". */
  id: string;
  name: string;
  description: string;
  visuals: ThemeVisuals;
  motion: MotionConfig;
  effects: EffectsConfig;
  connection: ConnectionConfig;
  transitions: TransitionsConfig;
  /** Optional overlay rendered around each object (gooey filters, glass, etc.). */
  objectEffects?: (size: { width: number; height: number }) => ReactNode;
}

/** Map a SpringConfig to a framer-motion transition object. */
export function toTransition(cfg: SpringConfig): Record<string, unknown> {
  return {
    type: cfg.type,
    ...(cfg.stiffness !== undefined ? { stiffness: cfg.stiffness } : {}),
    ...(cfg.damping !== undefined ? { damping: cfg.damping } : {}),
    ...(cfg.mass !== undefined ? { mass: cfg.mass } : {}),
    ...(cfg.duration !== undefined ? { duration: cfg.duration } : {}),
  };
}