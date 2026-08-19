import type { Plugin, Tool, ToolResult } from '../types';

const THEMES_KEY = 'saved-themes';

const generateThemeFromWebsiteTool: Tool = {
  name: 'generateThemeFromWebsite',
  description:
    'Generate a theme CSS from a website URL. The theme styles the studio controls (knobs, sliders, decorative overlays) based on the website\'s visual style. Returns the theme CSS and a theme name.',
  parameters: {
    type: 'object',
    properties: {
      websiteUrl: {
        type: 'string',
        description: 'The website URL to generate a theme from',
      },
    },
    required: ['websiteUrl'],
  } as const,
  execute: async (params: Record<string, unknown>): Promise<ToolResult> => {
    const { generateText } = await import('ai');

    const websiteUrl = (params as { websiteUrl: string }).websiteUrl;

    const { text } = await generateText({
      model: 'gpt-4o-mini',
      prompt: `
You are a theme designer. Given a website URL, create a CSS theme that styles studio controls (knobs, sliders, decorative overlays) in the visual style of that website.

Website URL: ${websiteUrl}

Generate:
1. A theme name (short, descriptive)
2. CSS that targets: .control, .knob, .slider, .decorative elements
3. The CSS should use colors, gradients, shadows, and typography inspired by the website's visual identity
4. Keep it suitable for a studio/editor environment

Return ONLY a JSON object with "name" and "css" fields, no other text or explanation.
      `,
      temperature: 0.3,
      maxOutputTokens: 500,
    });

    let name = 'Website Theme';
    let css = '';

    try {
      const parsed = JSON.parse(text.trim());
      name = parsed.name || 'Website Theme';
      css = parsed.css || '';
    } catch {
      css = text.trim();
    }

    if (!css) {
      return { success: false, error: 'Failed to generate theme CSS from website' };
    }

    return { success: true, data: { css, name } };
  },
};

export const themePlugin: Plugin = {
  id: 'theme',
  name: 'Theme System',
  description: 'Generate and manage themes for studio controls based on website visual styles. Themes only affect controls style, not universe content.',
  enabledByDefault: false,
  category: 'core',

  tools: [
    generateThemeFromWebsiteTool,
  ],

  init: () => {
    console.log('[theme] Theme system initialized');
  },

  destroy: () => {
    console.log('[theme] Theme system destroyed');
  },

  SettingsSection: () => {
    const savedThemes = JSON.parse(localStorage.getItem(THEMES_KEY) || '[]');

    return (
      <div className="p-3 rounded-lg bg-[#0d1117] border border-[#30363d] space-y-2 overflow-auto">
        <div className="flex items-center gap-2 text-[#8b949e] font-mono text-[10px] uppercase tracking-wider">
          Theme System
        </div>

        <div className="space-y-2">
          <div>
            <label className="text-[10px] text-[#8b949e] uppercase tracking-wider mb-1">Website URL</label>
            <input
              type="text"
              className="w-full bg-[#30363d] border border-[#484f58] rounded px-2 py-1 text-[10px] focus:outline-none focus:border-[#6b809a]"
              placeholder="https://example.com"
            />
          </div>

          <div>
            <label className="text-[10px] text-[#8b949e] uppercase tracking-wider mb-1">Theme Name</label>
            <input
              type="text"
              className="w-full bg-[#30363d] border border-[#484f58] rounded px-2 py-1 text-[10px] focus:outline-none focus:border-[#6b809a]"
              placeholder="e.g., Neon Cyber"
            />
          </div>

          <button
            className="px-3 py-1 bg-[#1f6feb] text-white rounded text-[10px] font-mono hover:bg-[#2c85e8] focus:outline-none focus:ring-2 focus:ring-[#3b82f6] transition-colors"
            onClick={async () => {
              const inputs = document.querySelectorAll('input');
              const urlInput = (inputs[0] as HTMLInputElement)?.value || '';
              const nameInput = (inputs[1] as HTMLInputElement)?.value || '';

              if (!urlInput) {
                alert('Please enter a website URL');
                return;
              }

              const result = await generateThemeFromWebsiteTool.execute({
                websiteUrl: urlInput,
              } as Record<string, unknown>);

              if (!result.success) {
                alert(`Failed to generate theme: ${result.error}`);
                return;
              }

              const { css, name: generatedName } = (result.data as { css: string; name: string }) || {};
              const themeName = nameInput || generatedName || 'Untitled Theme';
              const website = urlInput;

              const newThemes = [...(savedThemes || []), { name: themeName, css, website }];
              localStorage.setItem(THEMES_KEY, JSON.stringify(newThemes));

              alert(`Theme "${themeName}" saved!`);
            }}
          >
            Generate Theme
          </button>
        </div>

        {/* Saved Themes list */}
        <div className="mt-4 pt-4 border-t border-[#30363d]">
          <div className="text-[10px] font-mono text-[#8b949e] uppercase tracking-wider mb-2">
            Saved Themes ({savedThemes?.length || 0})
          </div>
          {savedThemes?.length === 0 && (
            <p className="text-[10px] text-[#484f58]">No themes saved yet. Generate one from a website URL.</p>
          )}
          <ul className="space-y-1 text-[10px] text-[#cbd5e1]">
            {savedThemes?.map((_theme: { name: string }, i: number) => (
              <li key={i} className="flex items-center gap-2">
                <span className="flex-1 truncate">{_theme.name}</span>
                <button
                  className="text-[10px] text-[#3b82f6] hover:underline"
                  onClick={() => {
                    alert(`Theme "${_theme.name}" CSS ready to apply.`);
                  }}
                >
                  Apply
                </button>
                <button
                  className="text-[10px] text-[#f87171] hover:underline"
                  onClick={() => {
                    const newThemes = savedThemes?.filter((_: { name: string }, idx: number) => idx !== i);
                    localStorage.setItem(THEMES_KEY, JSON.stringify(newThemes));
                  }}
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    );
  },
};

export default themePlugin;