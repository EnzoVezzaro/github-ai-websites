import type { SpatialThemeBehavior } from '../types';
import type { SpatialObject } from '../../spatial/types';

/**
 * Gooey — liquid/metaball behavior. Objects deform, merge and separate
 * like blobs of liquid. Renders a "connection" between near objects and
 * a gooey SVG filter around each object.
 */
export const gooeyTheme: SpatialThemeBehavior = {
  id: 'gooey',
  name: 'Gooey',
  description: 'Liquid deformation, metaball connections, liquid merging, fluid separation.',
  visuals: {
    accent: '#ff7ab8',
    cardBackground: 'rgba(35,10,26,0.9)',
    cardBorder: 'rgba(255,122,184,0.35)',
    radius: 22,
    glow: 'rgba(255,122,184,0.25)',
  },
  motion: {
    drag: { type: 'spring', stiffness: 120, damping: 16, mass: 1.4 },
    snap: { type: 'spring', stiffness: 90, damping: 14, mass: 1.6 },
    release: { type: 'spring', stiffness: 70, damping: 12, mass: 1.8 },
  },
  effects: {
    gooey: true,
    metaballs: true,
    mergeThreshold: 0.18,
    glass: { blur: 0 },
    shadow: 0.18,
    dragScale: 1.08,
    connectionPulse: true,
  },
  connection: {
    enabled: true,
    threshold: 0.28,
    render: (source: SpatialObject, target: SpatialObject) => {
      const sx = source.bounds.x + source.bounds.width / 2;
      const sy = source.bounds.y + source.bounds.height / 2;
      const tx = target.bounds.x + target.bounds.width / 2;
      const ty = target.bounds.y + target.bounds.height / 2;
      const mx = (sx + tx) / 2;
      const my = (sy + ty) / 2;
      return (
        <svg
          className="spatial-connection"
          width="100%"
          height="100%"
          viewBox="0 0 1 1"
          preserveAspectRatio="none"
          style={{ position: 'absolute', inset: 0, overflow: 'visible', pointerEvents: 'none' }}
        >
          <path
            d={`M ${sx} ${sy} Q ${mx} ${my} ${tx} ${ty}`}
            fill="none"
            stroke="#ff7ab8"
            strokeWidth={0.012}
            strokeLinecap="round"
            opacity={0.5}
          />
        </svg>
      );
    },
  },
  objectEffects: () => (
    <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ width: '100%', height: '100%' }}>
      <defs>
        <filter id="gooey-filter">
          <feGaussianBlur in="SourceGraphic" stdDeviation={6} result="blur" />
          <feColorMatrix
            in="blur"
            mode="matrix"
            values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 24 -12"
            result="goo"
          />
        </filter>
      </defs>
    </svg>
  ),
  transitions: {
    enter: { type: 'spring', stiffness: 180, damping: 20, mass: 1.2 },
    exit: { type: 'spring', stiffness: 180, damping: 20, mass: 1.2 },
    merge: { type: 'spring', stiffness: 160, damping: 18, mass: 1.4 },
    split: { type: 'spring', stiffness: 160, damping: 18, mass: 1.4 },
  },
};