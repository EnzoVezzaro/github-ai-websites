import type { Plugin, Tool } from '../types';
import { lsGet, lsSet } from '../../lib/storage';

const tools: Tool[] = [
  {
    name: 'forge_create_layout',
    description: 'Create a new universe layout with HTML, CSS, and optional JS',
    parameters: {
      type: 'object',
      properties: {
        name: { type: 'string', description: 'Layout name' },
        html: { type: 'string', description: 'HTML template with {{zone}} placeholders' },
        css: { type: 'string', description: 'CSS styles' },
        js: { type: 'string', description: 'Optional JavaScript' },
      },
      required: ['name', 'html', 'css'],
    },
    execute: async (params) => {
      const { name, html, css, js } = params as { name: string; html: string; css: string; js?: string };
      const layout = {
        id: `layout-${Date.now()}`,
        name,
        slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        html,
        css,
        js,
        createdAt: new Date().toISOString(),
      };
      const layouts = lsGet<any[]>('forge.layouts') || [];
      layouts.push(layout);
      lsSet('forge.layouts', layouts);
      return { success: true, data: layout };
    },
  },
  {
    name: 'forge_update_layout',
    description: 'Update an existing layout',
    parameters: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'Layout ID' },
        html: { type: 'string', description: 'Updated HTML' },
        css: { type: 'string', description: 'Updated CSS' },
        js: { type: 'string', description: 'Updated JS' },
      },
      required: ['id'],
    },
    execute: async (params) => {
      const { id, html, css, js } = params as { id: string; html?: string; css?: string; js?: string };
      const layouts = lsGet<any[]>('forge.layouts') || [];
      const idx = layouts.findIndex(l => l.id === id);
      if (idx === -1) return { success: false, error: 'Layout not found' };
      if (html !== undefined) layouts[idx].html = html;
      if (css !== undefined) layouts[idx].css = css;
      if (js !== undefined) layouts[idx].js = js;
      layouts[idx].updatedAt = new Date().toISOString();
      lsSet('forge.layouts', layouts);
      return { success: true, data: layouts[idx] };
    },
  },
  {
    name: 'forge_list_layouts',
    description: 'List all saved layouts',
    parameters: { type: 'object', properties: {} },
    execute: async () => {
      const layouts = lsGet<any[]>('forge.layouts') || [];
      return { success: true, data: layouts };
    },
  },
];

export const forgePlugin: Plugin = {
  id: 'forge',
  name: 'Universe Forge',
  description: 'HTML/CSS editor for creating custom layout universes with zone containers.',
  enabledByDefault: true,
  category: 'layout',
  tools,
  SettingsSection: () => (
    <div className="p-3 rounded-lg bg-[#0d1117] border border-[#30363d] space-y-2">
      <div className="text-[10px] font-mono text-[#8b949e] uppercase tracking-wider">Forge</div>
      <p className="text-[10px] text-[#484f58]">Create custom layouts with zone containers. Use <code className="text-[#58a6ff]">{'<div class="zone" data-zone="name">'}</code> for draggable zones.</p>
    </div>
  ),
};

export default forgePlugin;
