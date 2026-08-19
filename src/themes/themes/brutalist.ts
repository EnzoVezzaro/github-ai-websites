import type { SpatialThemeBehavior } from '../types';

/**
 * Brutalist — near-instant drag, hard mechanical movement, no fluid effects.
 * The opposite extreme: nothing is smooth, nothing is liquid.
 */
export const brutalistTheme: SpatialThemeBehavior = {
  id: 'brutalist',
  name: 'Brutalist',
  description: 'Near-instant drag, hard mechanical snapping, no fluid effects.',
  visuals: {
    accent: '#fbbf24',
    cardBackground: '#17181c',
    cardBorder: 'rgba(251,191,36,0.5)',
    radius: 0,
    glow: 'rgba(251,191,36,0.15)',
  },
  motion: {
    drag: { type: 'tween', duration: 0 },
    snap: { type: 'tween', duration: 0 },
    release: { type: 'tween', duration: 0 },
  },
  effects: {
    gooey: false,
    metaballs: false,
    mergeThreshold: 0,
    glass: { blur: 0 },
    shadow: 0,
    dragScale: 1,
    connectionPulse: false,
  },
  connection: { enabled: false, threshold: 0 },
  transitions: {
    enter: { type: 'tween', duration: 0 },
    exit: { type: 'tween', duration: 0 },
    merge: { type: 'tween', duration: 0 },
    split: { type: 'tween', duration: 0 },
  },
};