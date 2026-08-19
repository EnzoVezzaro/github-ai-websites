import { create } from 'zustand';
import type { SpatialEngine } from '../spatial/engine/SpatialEngine';
import type { SpatialThemeBehavior } from '../themes/types';
import { themeManager } from '../themes/ThemeManager';

interface EngineSnapshot {
  objects: ReturnType<SpatialEngine['getObjects']>;
  zones: ReturnType<SpatialEngine['getZones']>;
  nearPairs: Array<{ source: string; target: string }>;
  mergedGroups: Array<{ group: string; members: string[] }>;
}

interface SpatialStore {
  engine: SpatialEngine | null;
  snapshot: EngineSnapshot;
  activeThemeId: string;
  /** Register a SpatialEngine and subscribe to its events → keep snapshot fresh. */
  setEngine: (engine: SpatialEngine) => void;
  /** Apply an active theme by id (delegates to the Theme Manager). */
  setActiveTheme: (id: string) => boolean;
  /** Read the active theme behavior. */
  activeTheme: () => SpatialThemeBehavior | undefined;
  /** Force a fresh snapshot pull from the engine. */
  refresh: () => void;
  /** Detach the engine and unsubscribe. */
  clear: () => void;
}

const emptySnapshot: EngineSnapshot = { objects: [], zones: [], nearPairs: [], mergedGroups: [] };

// Module-level unsubscribe handles so only the current engine is observed.
let unsubAll: (() => void) | null = null;

export const useSpatialStore = create<SpatialStore>((set, get) => ({
  engine: null,
  snapshot: emptySnapshot,
  activeThemeId: themeManager.getActiveId(),

  setEngine: (engine) => {
    if (get().engine === engine && get().snapshot.objects.length === engine.getObjects().length) {
      return;
    }

    // Detach any previously attached engine.
    unsubAll?.();

    let unsubEngine = () => {};
    let unsubTheme = () => {};
    unsubEngine = engine.on(() => {
      set({ snapshot: engine.getSnapshot() });
    });
    unsubTheme = themeManager.onActiveChange((id) => {
      set({ activeThemeId: id });
    });
    unsubAll = () => {
      unsubEngine();
      unsubTheme();
    };

    set({
      engine,
      snapshot: engine.getSnapshot(),
      activeThemeId: themeManager.getActiveId(),
    });
  },

  setActiveTheme: (id) => {
    const changed = themeManager.setActive(id);
    if (changed) set({ activeThemeId: themeManager.getActiveId() });
    return changed;
  },

  activeTheme: () => themeManager.getActive(),

  refresh: () => {
    const engine = get().engine;
    if (engine) set({ snapshot: engine.getSnapshot() });
  },

  clear: () => {
    unsubAll?.();
    unsubAll = null;
    set({ engine: null, snapshot: emptySnapshot, activeThemeId: themeManager.getActiveId() });
  },
}));

/**
 * Hook: returns the active theme behavior (stable reference from the manager).
 * Used by the renderer to apply motion / effects / visuals for the current theme.
 */
export function useActiveTheme(): SpatialThemeBehavior | undefined {
  return useSpatialStore((s) => themeManager.get(s.activeThemeId) ?? themeManager.getActive());
}