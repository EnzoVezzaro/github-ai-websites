import { lsGet, lsSet } from '../lib/storage';
import type { SpatialThemeBehavior } from './types';

const ACTIVE_KEY = 'spatial.activeTheme';
const DEFAULT_THEME = 'minimal';

/**
 * ThemeManager — the plugin-facing Theme Manager.
 *
 * Themes are registered as behaviors (they are plugins in the plugin layer).
 * The manager tracks the active theme, persists it, and notifies subscribers
 * so the renderer can re-apply motion/effects when the theme changes.
 *
 * The manager never computes layout geometry — that belongs to the
 * theme-agnostic SpatialEngine.
 */
export class ThemeManager {
  private themes = new Map<string, SpatialThemeBehavior>();
  private active: string;
  private listeners = new Set<(id: string) => void>();

  constructor() {
    this.active = lsGet<string>(ACTIVE_KEY) || DEFAULT_THEME;
  }

  register(theme: SpatialThemeBehavior): void {
    this.themes.set(theme.id, theme);
  }

  registerAll(themes: SpatialThemeBehavior[]): void {
    for (const theme of themes) this.register(theme);
  }

  isRegistered(id: string): boolean {
    return this.themes.has(id);
  }

  get(id: string): SpatialThemeBehavior | undefined {
    return this.themes.get(id);
  }

  getAll(): SpatialThemeBehavior[] {
    return [...this.themes.values()];
  }

  getActive(): SpatialThemeBehavior | undefined {
    const active = this.themes.get(this.active);
    if (active) return active;
    return this.themes.values().next().value as SpatialThemeBehavior | undefined;
  }

  getActiveId(): string {
    return this.getActive()?.id ?? DEFAULT_THEME;
  }

  setActive(id: string): boolean {
    if (!this.themes.has(id) || this.active === id) return false;
    this.active = id;
    lsSet(ACTIVE_KEY, id);
    for (const fn of this.listeners) fn(id);
    return true;
  }

  onActiveChange(fn: (id: string) => void): () => void {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }

  offActiveChange(fn: (id: string) => void): void {
    this.listeners.delete(fn);
  }
}

/** Singleton Theme Manager. Built-in themes are registered on import (see index). */
export const themeManager = new ThemeManager();