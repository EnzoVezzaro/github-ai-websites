// Theme system
export { ThemeManager, themeManager } from './ThemeManager';
export type { SpatialThemeBehavior, MotionConfig, EffectsConfig, ThemeVisuals, ConnectionConfig, TransitionsConfig, SpringConfig } from './types';
export { toTransition } from './types';
export type { DragMotion, SnapMotion } from './types';
export { buildCustomTheme, loadCustomThemes, addCustomTheme, removeCustomTheme } from './customThemes';

// Built-in themes
export { minimalTheme } from './themes/minimal';
export { gooeyTheme } from './themes/gooey';
export { organicTheme } from './themes/organic.tsx';
export { glassTheme } from './themes/glass';
export { brutalistTheme } from './themes/brutalist';

import { themeManager } from './ThemeManager';
import { minimalTheme } from './themes/minimal';
import { gooeyTheme } from './themes/gooey';
import { organicTheme } from './themes/organic.tsx';
import { glassTheme } from './themes/glass';
import { brutalistTheme } from './themes/brutalist';
import { registerCustomThemes } from './customThemes';

/** All built-in themes in display order. */
export const builtInThemes = [minimalTheme, gooeyTheme, organicTheme, glassTheme, brutalistTheme];

/** Register the built-in theme suite into the Theme Manager. */
export function registerDefaultThemes(): void {
  themeManager.registerAll(builtInThemes);
  registerCustomThemes();
}

// Register on import so the manager is always ready.
registerDefaultThemes();