import type { Plugin } from '../types';

export const githubPlugin: Plugin = {
  id: 'github',
  name: 'GitHub Integration',
  description: 'OAuth authentication, GitHub publishing, and repository sync.',
  enabledByDefault: true,
  locked: true,
  category: 'publishing',

  SettingsSection: () => (
    <div className="p-3 rounded-lg bg-[#0d1117] border border-[#30363d] space-y-2">
      <div className="text-[10px] font-mono text-[#8b949e] uppercase tracking-wider">GitHub</div>
      <p className="text-[10px] text-[#484f58]">Connect via OAuth for publishing and repository sync.</p>
    </div>
  ),
};

export default githubPlugin;
