import type { SpatialThemeBehavior } from '../types';
import type { SpatialObject } from '../../spatial/types';

/**
 * Organic — spring physics, elastic bounce, objects attract each other.
 */
export const organicTheme: SpatialThemeBehavior = {
  id: 'organic',
  name: 'Organic',
  description: 'Spring physics, elastic bounce, natural attraction between near objects.',
  visuals: {
    accent: '#4ade80',
    cardBackground: 'rgba(8,30,20,0.9)',
    cardBorder: 'rgba(74,222,128,0.3)',
    radius: 18,
    glow: 'rgba(74,222,128,0.15)',
  },
  motion: {
    drag: { type: 'spring', stiffness: 200, damping: 14, mass: 1.2 },
    snap: { type: 'spring', stiffness: 90, damping: 10, mass: 1.6 },
    release: { type: 'spring', stiffness: 50, damping: 9, mass: 2 },
  },
  effects: {
    gooey: false,
    metaballs: true,
    mergeThreshold: 0.14,
    glass: { blur: 0 },
    shadow: 0.16,
    dragScale: 1.04,
    connectionPulse: true,
  },
  connection: {
    enabled: true,
    threshold: 0.24,
    render: (_source: SpatialObject, _target: SpatialObject) => (
      <span
        className="absolute inset-0 pointer-events-none rounded-full animate-pulse"
        style={{ background: 'rgba(74,222,128,0.08)', boxShadow: '0 0 0 1px rgba(74,222,128,0.25)' }}
      />
    ),
  },
  transitions: {
    enter: { type: 'spring', stiffness: 220, damping: 16, mass: 1.2 },
    exit: { type: 'spring', stiffness: 220, damping: 16, mass: 1.2 },
    merge: { type: 'spring', stiffness: 120, damping: 12, mass: 1.8 },
    split: { type: 'spring', stiffness: 120, damping: 12, mass: 1.8 },
  },
};