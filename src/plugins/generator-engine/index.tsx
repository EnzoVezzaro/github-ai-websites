import type { Plugin, Tool, ToolResult } from '../types';

const ENGINE_TYPES = ['html', 'react', 'vue', 'static'] as const;
export type EngineType = typeof ENGINE_TYPES[number];

const generateEngineTool: Tool = {
  name: 'generateWithEngine',
  description:
    'Generate universe output in different engine formats from a template and manifest. The template contains the structural HTML with placeholder tags. The manifest defines zones and content. Output format is determined by the engine type.',
  parameters: {
    type: 'object',
    properties: {
      engineType: {
        type: 'string',
        enum: ENGINE_TYPES,
        description: 'Output format: html (full document), react (React component), vue (Vue component), or static (plain markup)',
      },
      template: {
        type: 'string',
        description: 'The template HTML with placeholder tags for zones (e.g., {{intro}}, {{story}}, {{ideas}}, {{media}}, {{closing}})',
      },
      manifest: {
        type: 'object',
        description: 'The zone manifest defining content for each zone',
        properties: {
          intro: { type: 'string' },
          story: { type: 'string' },
          ideas: { type: 'string' },
          media: { type: 'string' },
          closing: { type: 'string' },
        },
        required: ['intro', 'story', 'ideas', 'media', 'closing'],
      },
      name: {
        type: 'string',
        description: 'Universe name',
      },
    },
    required: ['engineType', 'template', 'manifest'],
  } as const,
  execute: async (params: Record<string, unknown>): Promise<ToolResult> => {
    const engineType = (params as { engineType: EngineType }).engineType;
    const template = (params as { template: string }).template;
    const manifest = (params as {
      manifest: {
        intro: string;
        story: string;
        ideas: string;
        media: string;
        closing: string;
      };
    }).manifest;
    const name = (params as { name?: string }).name || 'Universe';

    // Map manifest zones to content
    const zoneMap: Record<string, string> = {
      intro: manifest.intro,
      story: manifest.story,
      ideas: manifest.ideas,
      media: manifest.media,
      closing: manifest.closing,
    };

    // Replace placeholder tags in template with actual content
    let output = template;
    for (const [zone, content] of Object.entries(zoneMap)) {
      // Replace {{zone}} placeholders with the actual content wrapped in zone divs
      const replacement = `<div class="zone" data-zone="${zone}">${content}</div>`;
      output = output.replace(new RegExp(`{{\\s*${zone}\\s*}}`, 'g'), replacement);
    }

    switch (engineType) {
      case 'html': {
        if (!template) {
          return { success: false, error: 'Template content is required for html engine' };
        }
        return {
          success: true,
          data: {
            output: `<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${name}</title>
  <style>
    body { font-family: system-ui, -apple-system, sans-serif; max-width: 900px; margin: 2rem auto; padding: 1rem; line-height: 1.6; }
    .zone { margin: 2rem 0; padding: 1rem; border: 1px solid #e0e0e0; border-radius: 8px; }
  </style>
</head>
<body>
  ${output}
</body>
</html>`,
            format: 'html' as EngineType,
            name,
          },
        };
      }

      case 'react': {
        if (!template) {
          return { success: false, error: 'Template content is required for react engine' };
        }
        return {
          success: true,
          data: {
            output: `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${name}</title>
</head>
<body>
  <div id="root">
    ${output}
  </div>
  <script type="module">
    import React from 'https://cdn.skypack.dev/react';
    import ReactDOM from 'https://cdn.skypack.dev/react-dom';
    ReactDOM.createRoot(document.getElementById('root')).render(
      <div>
        ${output}
      </div>
    );
  </script>
</body>
</html>`,
            format: 'react' as EngineType,
            name,
          },
        };
      }

      case 'vue': {
        if (!template) {
          return { success: false, error: 'Template content is required for vue engine' };
        }
        return {
          success: true,
          data: {
            output: `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${name}</title>
  <script src="https://cdn.jsdelivr.net/vue@3.5.0/vue.global.js"></script>
</head>
<body>
  <div id="app">
    ${output}
  </div>
  <script>
    createApp({
      template: \`<div>\${output}</div>\`
    }).mount('#app');
  </script>
</body>
</html>`,
            format: 'vue' as EngineType,
            name,
          },
        };
      }

      case 'static': {
        if (!template) {
          return { success: false, error: 'Template content is required for static engine' };
        }
        return {
          success: true,
          data: {
            output: `<!doctype html><html><head><title>${name}</title></head><body>${output}</body></html>`,
            format: 'static' as EngineType,
            name,
          },
        };
      }

      default:
        return { success: false, error: `Unknown engine type: ${engineType}` };
    }
  },
};

export const generatorEnginePlugin: Plugin = {
  id: 'generator-engine',
  name: 'Generator Engine',
  description:
    'Generates complete universes in multiple formats (HTML, React, Vue, Static) from a template and zone manifest. The template preserves structural tags, and the manifest defines zone content.',
  enabledByDefault: false,
  category: 'core',

  tools: [
    generateEngineTool,
  ],

  init: () => {
    console.log('[generator-engine] Generator engine initialized');
  },

  destroy: () => {
    console.log('[generator-engine] Generator engine destroyed');
  },

  SettingsSection: () => {
    const engineOptions = ENGINE_TYPES.map((type) => ({
      label: type,
      value: type,
    }));

    return (
      <div className="p-3 rounded-lg bg-[#0d1117] border border-[#30363d] space-y-2 overflow-auto">
        <div className="flex items-center gap-2 text-[#8b949e] font-mono text-[10px] uppercase tracking-wider">
          Generator Engine
        </div>

        <div className="space-y-2">
          <div>
            <label className="text-[10px] text-[#8b949e] uppercase tracking-wider mb-1">Engine Type</label>
            <select
              className="w-full bg-[#30363d] border border-[#484f58] rounded px-2 py-1 text-[10px] focus:outline-none focus:border-[#6b809a]"
              onChange={(e) => {
                const value = (e.target as HTMLSelectElement).value;
                alert(`Engine type set to: ${value}`);
              }}
            >
              {engineOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[10px] text-[#8b949e] uppercase tracking-wider mb-1">Universe Name</label>
            <input
              type="text"
              className="w-full bg-[#30363d] border border-[#484f58] rounded px-2 py-1 text-[10px] focus:outline-none focus:border-[#6b809a]"
              placeholder="My Universe"
            />
          </div>

          <div>
            <label className="text-[10px] text-[#8b949e] uppercase tracking-wider mb-1">Template HTML</label>
            <textarea
              rows={3}
              className="w-full bg-[#30363d] border border-[#484f58] rounded px-2 py-1 text-[10px] focus:outline-none focus:border-[#6b809a]"
              placeholder="Template with {{intro}}, {{story}}, {{ideas}}, {{media}}, {{closing}} placeholders"
            ></textarea>
          </div>

          <div>
            <label className="text-[10px] text-[#8b949e] uppercase tracking-wider mb-1">Zone Content</label>
            <div className="space-y-2">
              <textarea
                rows={2}
                className="w-full bg-[#30363d] border border-[#484f58] rounded px-2 py-1 text-[10px] focus:outline-none focus:border-[#6b809a]"
                placeholder="Intro content"
              ></textarea>
              <textarea
                rows={2}
                className="w-full bg-[#30363d] border border-[#484f58] rounded px-2 py-1 text-[10px] focus:outline-none focus:border-[#6b809a]"
                placeholder="Story content"
              ></textarea>
              <textarea
                rows={2}
                className="w-full bg-[#30363d] border border-[#484f58] rounded px-2 py-1 text-[10px] focus:outline-none focus:border-[#6b809a]"
                placeholder="Ideas content"
              ></textarea>
              <textarea
                rows={2}
                className="w-full bg-[#30363d] border border-[#484f58] rounded px-2 py-1 text-[10px] focus:outline-none focus:border-[#6b809a]"
                placeholder="Media content (URL or image)"
              ></textarea>
              <textarea
                rows={2}
                className="w-full bg-[#30363d] border border-[#484f58] rounded px-2 py-1 text-[10px] focus:outline-none focus:border-[#6b809a]"
                placeholder="Closing content"
              ></textarea>
            </div>
          </div>

          <button
            className="px-3 py-1 bg-[#1f6feb] text-white rounded text-[10px] font-mono hover:bg-[#2c85e8] focus:outline-none focus:ring-2 focus:ring-[#3b82f6] transition-colors"
            onClick={() => {
              const select = document.querySelector('select') as HTMLSelectElement;
              const nameInput = document.querySelectorAll('input')[0] as HTMLInputElement;
              const templateTextarea = document.querySelectorAll('textarea')[0] as HTMLTextAreaElement;
              const storyTextarea = document.querySelectorAll('textarea')[1] as HTMLTextAreaElement;
              const ideasTextarea = document.querySelectorAll('textarea')[2] as HTMLTextAreaElement;
              const mediaTextarea = document.querySelectorAll('textarea')[3] as HTMLTextAreaElement;
              const closingTextarea = document.querySelectorAll('textarea')[4] as HTMLTextAreaElement;

              if (!select || !nameInput || !templateTextarea) return;

              const engineType = select.value;
              const name = nameInput.value || 'Universe';
              const template = templateTextarea.value;
              const manifest = {
                intro: (storyTextarea.value || '').trim(),
                story: (storyTextarea.value || '').trim(),
                ideas: (ideasTextarea.value || '').trim(),
                media: (mediaTextarea.value || '').trim(),
                closing: (closingTextarea.value || '').trim(),
              };

              // Execute the generation tool
              const result = generateEngineTool.execute({
                engineType,
                template,
                manifest,
                name,
              } as Record<string, unknown>);

              // Handle the result
              if ((result as any)?.success) {
                const data = (result as any).data;
                alert(`Generated ${data.format} output for "${name}"`);
              } else {
                alert(`Generation failed: ${(result as any)?.error}`);
              }
            }}
          >
            Generate
          </button>
        </div>

        <div className="mt-4 pt-4 border-t border-[#30363d]">
          <div className="text-[10px] font-mono text-[#8b949e] uppercase tracking-wider mb-2">
            Generated Output Preview
          </div>
          <div className="bg-[#161b22] border border-[#30363d] rounded p-3 h-[250px] overflow-auto text-[10px] text-[#cbd5e1]">
            <p className="text-[#484f58]">Generate output first</p>
          </div>
        </div>
      </div>
    );
  },
};

export default generatorEnginePlugin;