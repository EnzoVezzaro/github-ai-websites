import type { Plugin } from '../types';

export const spatialPlugin: Plugin = {
  id: 'spatial',
  name: 'Spatial Zones',
  description: 'Moves the universe’s own panels: drag, resize and snap back the layout’s zone containers.',
  enabledByDefault: true,
  category: 'layout',

  init: () => {
    console.log('[spatial] Universe panels are draggable via interact.js');
  },

  destroy: () => {
    console.log('[spatial] Zone engine deactivated');
  },

  SettingsSection: () => (
    <div className="p-3 rounded-lg bg-[#0d1117] border border-[#30363d] space-y-2">
      <div className="text-[10px] font-mono text-[#8b949e] uppercase tracking-wider">Spatial Zones</div>
      <p className="text-[10px] text-[#484f58]">The universe’s own panels (<code className="text-[#58a6ff]">.zone</code> elements) are the movable units — they stay on the universe.</p>
      <div className="text-[10px] text-[#484f58] space-y-1">
        <div>• Drag any universe panel freely anywhere</div>
        <div>• A ghost keeps the original spot so you can snap back</div>
        <div>• Drag the corner handle to resize</div>
      </div>
    </div>
  ),
};

export default spatialPlugin;
