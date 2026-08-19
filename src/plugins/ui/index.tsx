import type { Plugin } from '../types';

export const uiPlugin: Plugin = {
  id: 'ui',
  name: 'Desktop UI',
  description: 'Draggable panels, close/restore controls, and spatial interface.',
  enabledByDefault: true,
  category: 'core',

  SettingsSection: () => (
    <div className="p-3 rounded-lg bg-[#0d1117] border border-[#30363d] space-y-2">
      <div className="text-[10px] font-mono text-[#8b949e] uppercase tracking-wider">Desktop UI</div>
      <p className="text-[10px] text-[#484f58]">Drag panels by their title bar. Close with X. Restore from Settings.</p>
    </div>
  ),
};

export default uiPlugin;
