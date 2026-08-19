import { useEffect, useId } from 'react';
import type { Plugin } from '../types';
import { themeManager } from '../../themes/ThemeManager';
import { builtInThemes } from '../../themes';
import { useSpatialStore } from '../../store/spatialStore';

/**
 * SpatialThemesPlugin — exposes the Theme Manager as a first-class plugin.
 *
 * On init it registers every built-in theme behavior into the Theme Manager
 * (minimal / gooey / organic / glass / brutalist). Its Settings section is a
 * theme switcher: the SpatialEngine and the canvas stay theme-agnostic; the
 * theme decides motion, effects, connections and visuals.
 */
export const spatialThemesPlugin: Plugin = {
  id: 'spatial-themes',
  name: 'Spatial Themes',
  description: 'Theme Manager: switching behavioral physics and visual personality of the spatial layout.',
  enabledByDefault: true,
  locked: true,
  category: 'layout',

  init: () => {
    // Register built-in theme behaviors into the Theme Manager.
    themeManager.registerAll(builtInThemes);
    console.log('[spatial-themes] Theme Manager ready:', themeManager.getActiveId());
  },

  destroy: () => {
    console.log('[spatial-themes] Theme Manager destroyed');
  },

  SettingsSection: () => {
    const activeThemeId = useSpatialStore((s) => s.activeThemeId);
    const setActiveTheme = useSpatialStore((s) => s.setActiveTheme);
    const radioId = useId();

    useEffect(() => {
      // Ensure the persisted theme is registered (e.g. after app reload).
      if (!themeManager.get(activeThemeId)) {
        themeManager.setActive(themeManager.getActive()?.id ?? 'minimal');
      }
    }, [activeThemeId]);

    return (
      <div className="p-3 rounded-lg bg-[#0d1117] border border-[#30363d] space-y-2">
        <div className="flex items-center gap-2 text-[#8b949e] font-mono text-[10px] uppercase tracking-wider">
          Spatial Theme
        </div>
        <p className="text-[10px] text-[#484f58]">
          The theme changes the physics and personality of the layout — never the content or composition.
        </p>

        <div className="space-y-1">
          {builtInThemes.map((theme) => {
            const selected = activeThemeId === theme.id;
            return (
              <label
                key={theme.id}
                className={`flex items-start gap-2 rounded-md border px-2 py-1.5 cursor-pointer transition-colors ${
                  selected ? 'border-[#58a6ff] bg-[#58a6ff]/10' : 'border-[#30363d] hover:border-[#484f58]'
                }`}
              >
                <input
                  id={`${radioId}-${theme.id}`}
                  type="radio"
                  name="spatial-theme"
                  value={theme.id}
                  checked={selected}
                  onChange={() => setActiveTheme(theme.id)}
                  className="mt-0.5 accent-[#58a6ff]"
                />
                <span className="flex-1">
                  <span className="block text-[11px] font-medium text-[#c9d1d9]">
                    <span className="inline-block w-2 h-2 rounded-full mr-1.5 align-middle" style={{ background: theme.visuals.accent }} />
                    {theme.name}
                  </span>
                  <span className="block text-[10px] text-[#8b949e] mt-0.5 leading-snug">{theme.description}</span>
                </span>
              </label>
            );
          })}
        </div>
      </div>
    );
  },
};

export default spatialThemesPlugin;