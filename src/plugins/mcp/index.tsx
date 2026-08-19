import type { Plugin } from '../types';
import { startMCPServer } from '../../lib/mcp';

export const mcpPlugin: Plugin = {
  id: 'mcp',
  name: 'MCP Server',
  description: 'Exposes tools to AI agents via Model Context Protocol.',
  enabledByDefault: true,
  category: 'core',

  init: () => {
    startMCPServer();
  },

  SettingsSection: () => (
    <div className="p-3 rounded-lg bg-[#0d1117] border border-[#30363d] space-y-2">
      <div className="text-[10px] font-mono text-[#8b949e] uppercase tracking-wider">MCP Server</div>
      <p className="text-[10px] text-[#484f58]">Exposes plugin tools to AI agents via Model Context Protocol. Available at <code className="text-[#58a6ff]">window.__mcpHandler</code>.</p>
    </div>
  ),
};

export default mcpPlugin;
