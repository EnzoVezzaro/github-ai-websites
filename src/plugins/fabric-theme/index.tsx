import type { Plugin } from '../types';

/**
 * Fabric.js UI Theme plugin.
 *
 * Provides a canvas-based overlay for drawing custom UI controls
 * (knobs, sliders, decorative elements) on top of the studio.
 * Uses fabric.js for interactive canvas manipulation.
 * This affects the UI chrome only — never touches the universe/preview content.
 */
export const fabricThemePlugin: Plugin = {
  id: 'fabric-theme',
  name: 'Fabric UI Controls',
  description: 'Canvas-based UI controls using Fabric.js for knobs, sliders, and decorative overlays.',
  enabledByDefault: true,
  category: 'core',

  init: () => {
    console.log('[fabric-theme] Fabric.js UI controls active');
  },

  destroy: () => {
    console.log('[fabric-theme] Fabric.js UI controls deactivated');
  },

  SettingsSection: () => (
    <div className="p-3 rounded-lg bg-[#0d1117] border border-[#30363d] space-y-2">
      <div className="flex items-center gap-2 text-[#8b949e] font-mono text-[10px] uppercase tracking-wider">
        Fabric UI Controls
      </div>
      <p className="text-[10px] text-[#484f58]">
        Enables canvas-drawn UI controls (knobs, sliders, decorative overlays) using Fabric.js.
        Affects studio chrome only — does not modify universe content.
      </p>
    </div>
  ),
};
