/**
 * AI Agent tools for universe creation.
 *
 * AI SDK v5 uses `inputSchema` with `jsonSchema()` instead of `parameters`.
 * Tool calls expose `input` instead of `args`.
 */

import { tool, jsonSchema } from 'ai';
import { calculateZoneSize } from './pretext';

/**
 * Zone validation tool — ensures HTML contains all required zone containers.
 */
export const validateZonesTool = {
  description: 'Validate that HTML contains all 5 required zone containers (intro, story, ideas, media, closing).',
  inputSchema: jsonSchema<{ html: string }>({
    type: 'object',
    properties: {
      html: { type: 'string', description: 'The full HTML string to validate' },
    },
    required: ['html'],
  }),
  execute: async ({ html }: { html: string }) => {
    const required = ['intro', 'story', 'ideas', 'media', 'closing'];
    const found = required.filter(zone => html.includes(`data-zone="${zone}"`));
    const missing = required.filter(zone => !html.includes(`data-zone="${zone}"`));
    return { valid: missing.length === 0, missing, found };
  },
};

/**
 * HTML generation tool — generates the HTML structure with zones preserved.
 */
export const generateHTMLTool = {
  description: 'Generate the HTML structure for the universe. You MUST include all 5 zone containers: <div class="zone" data-zone="intro">, <div class="zone" data-zone="story">, <div class="zone" data-zone="ideas">, <div class="zone" data-zone="media">, <div class="zone" data-zone="closing">. You may add additional elements around or between zones.',
  inputSchema: jsonSchema<{
    name: string;
    introContent: string;
    storyContent: string;
    ideasContent: string;
    mediaContent: string;
    closingContent: string;
    extraElements?: string;
  }>({
    type: 'object',
    properties: {
      name: { type: 'string', description: 'Universe name for the title' },
      introContent: { type: 'string', description: 'Content for the intro zone (HTML allowed)' },
      storyContent: { type: 'string', description: 'Content for the story zone (HTML allowed)' },
      ideasContent: { type: 'string', description: 'Content for the ideas zone (HTML allowed)' },
      mediaContent: { type: 'string', description: 'Content for the media zone (HTML allowed)' },
      closingContent: { type: 'string', description: 'Content for the closing zone (HTML allowed)' },
      extraElements: { type: 'string', description: 'Optional extra HTML elements to add between/around zones' },
    },
    required: ['name', 'introContent', 'storyContent', 'ideasContent', 'mediaContent', 'closingContent'],
  }),
  execute: async (args: {
    name: string; introContent: string; storyContent: string;
    ideasContent: string; mediaContent: string; closingContent: string;
    extraElements?: string;
  }) => {
    const { name, introContent, storyContent, ideasContent, mediaContent, closingContent, extraElements } = args;
    const html = `<!doctype html>
<html><head><meta charset="utf-8"><title>${name}</title></head>
<body>
<div class="zone" data-zone="intro">${introContent}</div>
<div class="zone" data-zone="story">${storyContent}</div>
<div class="zone" data-zone="ideas">${ideasContent}</div>
<div class="zone" data-zone="media">${mediaContent}</div>
<div class="zone" data-zone="closing">${closingContent}</div>
${extraElements || ''}
</body></html>`;
    return { html };
  },
};

/**
 * CSS generation tool — generates styling for the universe.
 */
export const generateCSSTool = {
  description: 'Generate CSS styling for the universe. Style the zones and their content. The .zone class is used for all 5 mandatory containers.',
  inputSchema: jsonSchema<{
    theme: string;
    bodyStyles: string;
    zoneStyles: string;
    contentStyles: string;
    animations?: string;
    customCSS?: string;
  }>({
    type: 'object',
    properties: {
      theme: { type: 'string', description: 'Theme name: "dark", "neon-80s", "retro-90s", "y2k", "bw-film", "minimal"' },
      bodyStyles: { type: 'string', description: 'CSS rules for the body element' },
      zoneStyles: { type: 'string', description: 'CSS rules for .zone containers' },
      contentStyles: { type: 'string', description: 'CSS rules for content inside zones' },
      animations: { type: 'string', description: 'Optional CSS animations or transitions' },
      customCSS: { type: 'string', description: 'Any additional custom CSS' },
    },
    required: ['theme', 'bodyStyles', 'zoneStyles', 'contentStyles'],
  }),
  execute: async (args: { theme: string; bodyStyles: string; zoneStyles: string; contentStyles: string; animations?: string; customCSS?: string }) => {
    return { css: `/* Theme: ${args.theme}\n*/\n${args.bodyStyles}\n${args.zoneStyles}\n${args.contentStyles}\n${args.animations || ''}\n${args.customCSS || ''}` };
  },
};

/**
 * JS generation tool — generates interactivity.
 */
export const generateJSTool = {
  description: 'Generate JavaScript for the universe. Zone containers are managed by the runtime. You can add event listeners, animations, scroll effects. Do NOT manipulate zone positions.',
  inputSchema: jsonSchema<{
    interactivity: string;
    animations?: string;
    effects?: string;
  }>({
    type: 'object',
    properties: {
      interactivity: { type: 'string', description: 'JavaScript code for user interactions' },
      animations: { type: 'string', description: 'JavaScript for scroll or time-based animations' },
      effects: { type: 'string', description: 'Optional visual effects code' },
    },
    required: ['interactivity'],
  }),
  execute: async (args: { interactivity: string; animations?: string; effects?: string }) => {
    return { js: `${args.interactivity}\n${args.animations ? `\n// Animations\n${args.animations}` : ''}\n${args.effects ? `\n// Effects\n${args.effects}` : ''}` };
  },
};

/**
 * Layout measurement tool — calculates optimal zone sizing.
 */
export const measureLayoutTool = {
  description: 'Calculate optimal dimensions for a zone based on its text content.',
  inputSchema: jsonSchema<{ content: string; maxWidth?: number; lineHeight?: number }>({
    type: 'object',
    properties: {
      content: { type: 'string', description: 'The text content to measure' },
      maxWidth: { type: 'number', description: 'Maximum width in pixels (default: 400)' },
      lineHeight: { type: 'number', description: 'Line height in pixels (default: 20)' },
    },
    required: ['content'],
  }),
  execute: async (args: { content: string; maxWidth?: number; lineHeight?: number }) => {
    const result = calculateZoneSize(args.content, { maxWidth: args.maxWidth, lineHeight: args.lineHeight });
    return { width: result.width, height: result.height, lineCount: Math.ceil(result.height / (args.lineHeight || 20)) };
  },
};

/**
 * Theme application tool — applies a predefined theme.
 */
export const applyThemeTool = {
  description: 'Apply a predefined visual theme. Returns complete CSS for that theme.',
  inputSchema: jsonSchema<{ theme: string }>({
    type: 'object',
    properties: {
      theme: { type: 'string', description: 'Theme: neon-80s, retro-90s, y2k, bw-film, minimal, dark' },
    },
    required: ['theme'],
  }),
  execute: async (args: { theme: string }) => {
    const themes: Record<string, { css: string; description: string }> = {
      'neon-80s': {
        description: 'Neon glow, gradients, dark background, pink/cyan/purple accents',
        css: `body{background:#0a0015;color:#e0e0ff;font-family:'Courier New',monospace;padding:2rem;max-width:900px;margin:auto;display:flex;flex-direction:column;gap:1.5rem;line-height:1.6}
.zone{position:relative;padding:1.5rem;border:2px solid rgba(0,255,255,0.3);border-radius:8px;background:rgba(20,0,40,0.8);box-shadow:0 0 20px rgba(255,0,255,0.15),inset 0 0 30px rgba(0,255,255,0.05);transition:box-shadow 0.3s,border-color 0.3s}
.zone:hover{border-color:rgba(255,0,255,0.6);box-shadow:0 0 30px rgba(255,0,255,0.3)}
h1{font-size:2.5rem;font-weight:900;background:linear-gradient(to right,#ff00ff,#00ffff,#ff00ff);-webkit-background-clip:text;-webkit-text-fill-color:transparent}
h2{color:#ff69b4;font-size:1.3rem}p{color:#c0c0ff;font-size:1.05rem}
.zone[data-zone="media"] img{width:100%;max-height:350px;object-fit:cover;border-radius:8px;border:2px solid rgba(255,0,255,0.3)}`,
      },
      'retro-90s': {
        description: 'Bold colors, geometric patterns, Memphis design inspired',
        css: `body{background:#1a1a2e;color:#fff;font-family:Arial,sans-serif;padding:2rem;max-width:900px;margin:auto;display:flex;flex-direction:column;gap:1.5rem;line-height:1.6}
.zone{position:relative;padding:1.5rem;border:3px solid #e94560;border-radius:0;background:rgba(15,52,96,0.6);transition:transform 0.2s}
.zone::before{content:'';position:absolute;top:-8px;right:-8px;width:16px;height:16px;background:#e94560;border-radius:50%}
.zone:hover{transform:translateY(-2px)}
h1{font-size:2.5rem;font-weight:900;color:#e94560;text-transform:uppercase;letter-spacing:2px}
h2{color:#ffc947;font-size:1.3rem}p{color:#e0e0e0;font-size:1.05rem}`,
      },
      'y2k': {
        description: 'Glossy, metallic, futuristic, early 2000s web aesthetic',
        css: `body{background:linear-gradient(135deg,#0f0c29,#302b63,#24243e);color:#e0e0ff;font-family:'Trebuchet MS',sans-serif;padding:2rem;max-width:900px;margin:auto;display:flex;flex-direction:column;gap:1.5rem;line-height:1.6}
.zone{position:relative;padding:1.5rem;border:1px solid rgba(100,200,255,0.3);border-radius:16px;background:linear-gradient(145deg,rgba(40,40,80,0.6),rgba(20,20,50,0.8));backdrop-filter:blur(10px);box-shadow:0 8px 32px rgba(0,0,0,0.4);transition:box-shadow 0.3s}
.zone:hover{box-shadow:0 8px 32px rgba(100,200,255,0.2)}
h1{font-size:2.5rem;font-weight:900;background:linear-gradient(to right,#64c8ff,#c864ff);-webkit-background-clip:text;-webkit-text-fill-color:transparent}
h2{color:#64c8ff;font-size:1.3rem}p{color:#c8c8ff;font-size:1.05rem}`,
      },
      'bw-film': {
        description: 'Black and white film noir, high contrast, elegant typography',
        css: `body{background:#0a0a0a;color:#e0e0e0;font-family:Georgia,serif;padding:2rem;max-width:900px;margin:auto;display:flex;flex-direction:column;gap:1.5rem;line-height:1.7}
.zone{position:relative;padding:1.5rem;border:1px solid rgba(255,255,255,0.15);border-radius:0;background:rgba(20,20,20,0.9);transition:border-color 0.3s}
.zone:hover{border-color:rgba(255,255,255,0.4)}
h1{font-size:2.5rem;font-weight:900;color:#fff;font-style:italic}
h2{color:#999;font-size:1.3rem;text-transform:uppercase;letter-spacing:3px}p{color:#ccc;font-size:1.05rem}
.zone[data-zone="media"] img{width:100%;max-height:350px;object-fit:cover;filter:grayscale(100%) contrast(1.2)}`,
      },
      'minimal': {
        description: 'Clean, lots of whitespace, thin borders, subtle',
        css: `body{background:#fafafa;color:#333;font-family:system-ui,-apple-system,sans-serif;padding:3rem;max-width:900px;margin:auto;display:flex;flex-direction:column;gap:2rem;line-height:1.7}
.zone{position:relative;padding:2rem;border:1px solid #e0e0e0;border-radius:4px;background:#fff;transition:border-color 0.2s}
.zone:hover{border-color:#999}
h1{font-size:2.2rem;font-weight:300;color:#111}
h2{color:#555;font-size:1.2rem;font-weight:400}p{color:#666;font-size:1rem}`,
      },
      'dark': {
        description: 'Default dark theme with subtle blue accents',
        css: `body{background:#0a0a0c;color:#e2e8f0;font-family:system-ui,-apple-system,sans-serif;padding:4rem;max-width:900px;margin:auto;display:flex;flex-direction:column;gap:1.5rem;line-height:1.6}
.zone{position:relative;padding:1.5rem;border:1px solid rgba(255,255,255,0.08);border-radius:12px;background:rgba(255,255,255,0.03);transition:box-shadow 0.2s}
.zone:hover{border-color:rgba(88,166,255,0.3)}
h1{font-size:2.5rem;font-weight:900;background:linear-gradient(to right,#a855f7,#ec4899);-webkit-background-clip:text;-webkit-text-fill-color:transparent}
h2{color:#94a3b8;font-size:1.3rem}p{color:#cbd5e1;font-size:1.05rem}
.zone[data-zone="media"] img{width:100%;max-height:350px;object-fit:cover;border-radius:8px}`,
      },
    };

    return themes[args.theme] || themes['dark'];
  },
};

/**
 * Get all built-in tools.
 */
export function getUniverseTools() {
  return {
    validateZones: tool(validateZonesTool),
    generateHTML: tool(generateHTMLTool),
    generateCSS: tool(generateCSSTool),
    generateJS: tool(generateJSTool),
    measureLayout: tool(measureLayoutTool),
    applyTheme: tool(applyThemeTool),
  };
}
