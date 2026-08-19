import type { SpatialThemeBehavior } from '../types';

/**
 * Minimal — clean magnetic snapping, no fluid effects, no connections.
 * The layout feels calm and precise.
 */
export const minimalTheme: SpatialThemeBehavior = {
  id: 'minimal',
  name: 'Minimal',
  description: 'Smooth movement, clean magnetic snap, no connections or liquid effects.',
  visuals: {
    accent: '#58a6ff',
    cardBackground: 'rgba(13,17,23,0.85)',
    cardBorder: 'rgba(88,166,255,0.25)',
    radius: 12,
    glow: 'rgba(88,166,255,0.12)',
  },
  motion: {
    drag: { type: 'spring', stiffness: 300, damping: 26 },
    snap: { type: 'spring', stiffness: 500, damping: 30 },
    release: { type: 'spring', stiffness: 180, damping: 22 },
  },
  effects: {
    gooey: false,
    metaballs: false,
    mergeThreshold: 0,
    glass: { blur: 0 },
    shadow: 0.12,
    dragScale: 1,
    connectionPulse: false,
  },
  connection: { enabled: false, threshold: 0 },
  transitions: {
    enter: { type: 'spring', stiffness: 300, damping: 26 },
    exit: { type: 'spring', stiffness: 260, damping: 28 },
    merge: { type: 'tween', duration: 0.25 },
    split: { type: 'tween', duration: 0.25 },
  },
};