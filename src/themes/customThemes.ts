import type { SpatialThemeBehavior } from './types';
import { themeManager } from './ThemeManager';
import { lsGet, lsSet } from '../lib/storage';
import type { GeneratedTheme } from '../lib/ai';

const STORAGE_KEY = 'spatial.customThemes';

function toId(name: string): string {
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  return `ai-${slug || 'theme'}`;
}

/** Turn an AI-generated theme into a full SpatialThemeBehavior. */
export function buildCustomTheme(t: GeneratedTheme): SpatialThemeBehavior {
  return {
    id: toId(t.name),
    name: t.name,
    description: t.description ?? 'AI-generated spatial theme.',
    visuals: {
      accent: t.accent,
      cardBackground: t.cardBackground,
      cardBorder: t.cardBorder,
      radius: t.radius,
      glow: t.glow,
    },
    motion: {
      drag: { type: 'spring', stiffness: 220, damping: 22 },
      snap: { type: 'spring', stiffness: 340, damping: 26 },
      release: { type: 'spring', stiffness: 140, damping: 18 },
    },
    effects: {
      gooey: false,
      metaballs: false,
      mergeThreshold: 0,
      glass: { blur: 0 },
      shadow: 0.15,
      dragScale: 1.02,
      connectionPulse: true,
    },
    connection: { enabled: false, threshold: 0 },
    transitions: {
      enter: { type: 'spring', stiffness: 260, damping: 24 },
      exit: { type: 'spring', stiffness: 260, damping: 24 },
      merge: { type: 'tween', duration: 0.25 },
      split: { type: 'tween', duration: 0.25 },
    },
  };
}

/** Custom themes stored in localStorage (as GeneratedTheme payloads). */
export function loadCustomThemes(): GeneratedTheme[] {
  return lsGet<GeneratedTheme[]>(STORAGE_KEY) ?? [];
}

/** Persist a generated theme and register it into the Theme Manager. */
export function addCustomTheme(theme: GeneratedTheme): SpatialThemeBehavior {
  const themes = loadCustomThemes().filter(t => toId(t.name) !== toId(theme.name));
  themes.push(theme);
  lsSet(STORAGE_KEY, themes);
  const behavior = buildCustomTheme(theme);
  themeManager.register(behavior);
  return behavior;
}

/** Remove a custom theme by its behavior id. */
export function removeCustomTheme(id: string): void {
  const themes = loadCustomThemes().filter(t => buildCustomTheme(t).id !== id);
  lsSet(STORAGE_KEY, themes);
}

/** Register persisted custom themes into the manager (called on startup). */
export function registerCustomThemes(): void {
  themeManager.registerAll(loadCustomThemes().map(buildCustomTheme));
}
