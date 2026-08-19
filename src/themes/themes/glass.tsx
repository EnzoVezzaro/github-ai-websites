import type { SpatialThemeBehavior } from '../types';
import type { SpatialObject } from '../../spatial/types';

/**
 * Glass — drag distortion, blur/refraction between near objects.
 */
export const glassTheme: SpatialThemeBehavior = {
  id: 'glass',
  name: 'Glass',
  description: 'Glass distortion on drag, blur/refraction when objects are near.',
  visuals: {
    accent: '#93c5fd',
    cardBackground: 'rgba(255,255,255,0.12)',
    cardBorder: 'rgba(147,197,253,0.35)',
    radius: 20,
    glow: 'rgba(147,197,253,0.18)',
  },
  motion: {
    drag: { type: 'spring', stiffness: 280, damping: 24 },
    snap: { type: 'spring', stiffness: 420, damping: 30 },
    release: { type: 'spring', stiffness: 200, damping: 24 },
  },
  effects: {
    gooey: false,
    metaballs: false,
    mergeThreshold: 0.16,
    glass: { blur: 10 },
    shadow: 0.22,
    dragScale: 1.02,
    connectionPulse: false,
  },
  connection: {
    enabled: true,
    threshold: 0.2,
    render: (_source: SpatialObject, _target: SpatialObject) => (
      <div
        className="absolute inset-0 pointer-events-none rounded-lg"
        style={{ boxShadow: 'inset 0 0 0 1px rgba(147,197,253,0.3)', backdropFilter: 'blur(6px)' }}
      />
    ),
  },
  objectEffects: () => (
    <div
      className="absolute inset-0 rounded-[inherit] pointer-events-none"
      style={{
        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.25), 0 20px 60px rgba(0,0,0,0.25)',
        backdropFilter: 'blur(8px)',
      }}
    />
  ),
  transitions: {
    enter: { type: 'spring', stiffness: 320, damping: 26 },
    exit: { type: 'spring', stiffness: 320, damping: 26 },
    merge: { type: 'tween', duration: 0.28 },
    split: { type: 'tween', duration: 0.28 },
  },
};