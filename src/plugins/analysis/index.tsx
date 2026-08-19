import type { Plugin, Tool } from '../types';
import { loadUniverses, saveUniverse } from '../../lib/universes';
import type { Universe, ContentBox } from '../../types';

function flattenContent(content: Record<string, ContentBox[]>): ContentBox[] {
  return Object.values(content).reduce((acc, boxes) => acc.concat(boxes), []);
}

const tools: Tool[] = [
  {
    name: 'analyze_universe',
    description: 'Analyze a universe for content quality, accessibility, and best practices',
    parameters: {
      type: 'object',
      properties: {
        universeId: { type: 'string', description: 'Universe ID to analyze' },
      },
      required: ['universeId'],
    },
    execute: async (params) => {
      const { universeId } = params as { universeId: string };
      const universes = loadUniverses();
      const universe = universes.find(u => u.meta.id === universeId);
      if (!universe) return { success: false, error: 'Universe not found' };

      const allBoxes = flattenContent(universe.content);
      const analysis = {
        content: {
          totalBoxes: allBoxes.length,
          zones: [...new Set(allBoxes.map(b => b.zone))],
          types: [...new Set(allBoxes.map(b => b.type))],
          wordCount: allBoxes.reduce((sum, b) => sum + b.data.split(/\s+/).length, 0),
          readability: calculateReadability(allBoxes.map(b => b.data).join(' ')),
        },
        layout: {
          hasHtml: !!universe.layout.html,
          hasCss: !!universe.layout.css,
          hasJs: !!universe.layout.js,
          templateZones: extractTemplateZones(universe.layout.html),
        },
        accessibility: checkAccessibility(universe),
        suggestions: generateSuggestions(universe),
      };

      return { success: true, data: analysis };
    },
  },
  {
    name: 'lint_universe',
    description: 'Lint a universe for naming conventions, structure, and best practices',
    parameters: {
      type: 'object',
      properties: {
        universeId: { type: 'string', description: 'Universe ID to lint' },
        preset: { type: 'string', description: 'Lint preset: strict, standard, or relaxed' },
      },
      required: ['universeId'],
    },
    execute: async (params) => {
      const { universeId, preset = 'standard' } = params as { universeId: string; preset?: string };
      const universes = loadUniverses();
      const universe = universes.find(u => u.meta.id === universeId);
      if (!universe) return { success: false, error: 'Universe not found' };

      const issues = lintUniverse(universe, preset);
      return { success: true, data: { issues, preset, passed: issues.length === 0 } };
    },
  },
  {
    name: 'extract_tokens',
    description: 'Extract design tokens (colors, fonts, spacing) from a universe',
    parameters: {
      type: 'object',
      properties: {
        universeId: { type: 'string', description: 'Universe ID' },
      },
      required: ['universeId'],
    },
    execute: async (params) => {
      const { universeId } = params as { universeId: string };
      const universes = loadUniverses();
      const universe = universes.find(u => u.meta.id === universeId);
      if (!universe) return { success: false, error: 'Universe not found' };

      const tokens = extractDesignTokens(universe.layout.css);
      return { success: true, data: tokens };
    },
  },
  {
    name: 'export_universe',
    description: 'Export a universe as JSON',
    parameters: {
      type: 'object',
      properties: {
        universeId: { type: 'string', description: 'Universe ID' },
      },
      required: ['universeId'],
    },
    execute: async (params) => {
      const { universeId } = params as { universeId: string };
      const universes = loadUniverses();
      const universe = universes.find(u => u.meta.id === universeId);
      if (!universe) return { success: false, error: 'Universe not found' };
      return { success: true, data: universe };
    },
  },
  {
    name: 'import_universe',
    description: 'Import a universe from JSON',
    parameters: {
      type: 'object',
      properties: {
        universe: { type: 'object', description: 'Universe object to import' },
      },
      required: ['universe'],
    },
    execute: async (params) => {
      const { universe } = params as { universe: Universe };
      if (!universe.meta?.id || !universe.content || !universe.layout) {
        return { success: false, error: 'Invalid universe format' };
      }
      saveUniverse(universe);
      return { success: true, data: universe.meta };
    },
  },
  {
    name: 'export_all',
    description: 'Export all universes as a JSON archive',
    parameters: { type: 'object', properties: {} },
    execute: async () => {
      const universes = loadUniverses();
      return { success: true, data: { universes, exportedAt: new Date().toISOString() } };
    },
  },
  {
    name: 'import_html',
    description: 'Import HTML/CSS as a new universe',
    parameters: {
      type: 'object',
      properties: {
        name: { type: 'string', description: 'Universe name' },
        html: { type: 'string', description: 'HTML content' },
        css: { type: 'string', description: 'CSS content' },
        js: { type: 'string', description: 'Optional JavaScript' },
      },
      required: ['name', 'html', 'css'],
    },
    execute: async (params) => {
      const { name, html, css, js } = params as { name: string; html: string; css: string; js?: string };
      const universe: Universe = {
        meta: {
          id: `imported-${Date.now()}`,
          name,
          slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
          version: '1.0',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        content: {},
        layout: { html, css, js },
      };
      saveUniverse(universe);
      return { success: true, data: universe.meta };
    },
  },
];

function calculateReadability(text: string): { score: number; level: string } {
  const words = text.split(/\s+/).length;
  const sentences = text.split(/[.!?]+/).length;
  const avgWordsPerSentence = words / Math.max(sentences, 1);
  
  // Simple readability score (lower is better)
  const score = Math.min(100, Math.max(0, 100 - (avgWordsPerSentence * 2)));
  
  let level = 'easy';
  if (score < 60) level = 'moderate';
  if (score < 30) level = 'difficult';
  
  return { score, level };
}

function extractTemplateZones(html: string): string[] {
  const zones = new Set<string>();
  const regex = /\{\{(\w+)\}\}/g;
  let match;
  while ((match = regex.exec(html)) !== null) {
    if (match[1] !== 'css') {
      zones.add(match[1]);
    }
  }
  return Array.from(zones);
}

function checkAccessibility(universe: any): { issues: string[]; score: number } {
  const issues: string[] = [];
  
  // Check for alt text on images
  const imageBoxes = universe.content.filter((b: any) => b.type === 'image');
  const missingAlt = imageBoxes.filter((b: any) => !b.meta || b.meta.trim() === '');
  if (missingAlt.length > 0) {
    issues.push(`${missingAlt.length} image(s) missing alt text`);
  }
  
  // Check for heading hierarchy
  const headingBoxes = universe.content.filter((b: any) => b.type === 'heading');
  if (headingBoxes.length > 1) {
    issues.push('Multiple headings - consider hierarchy');
  }
  
  const score = Math.max(0, 100 - (issues.length * 20));
  return { issues, score };
}

function generateSuggestions(universe: any): string[] {
  const suggestions: string[] = [];
  
  if (universe.content.length < 3) {
    suggestions.push('Consider adding more content boxes for richer content');
  }
  
  const zones = [...new Set(universe.content.map((b: any) => b.zone))];
  if (zones.length < 3) {
    suggestions.push('Use more diverse zone names for better layout organization');
  }
  
  if (!universe.layout.js) {
    suggestions.push('Add JavaScript for interactive elements');
  }
  
  return suggestions;
}

function lintUniverse(universe: any, preset: string): Array<{ line: number; message: string; severity: 'error' | 'warning' | 'info' }> {
  const issues: Array<{ line: number; message: string; severity: 'error' | 'warning' | 'info' }> = [];
  
  // Check meta
  if (!universe.meta.name || universe.meta.name.length < 3) {
    issues.push({ line: 0, message: 'Universe name too short', severity: 'error' });
  }
  
  if (!universe.meta.description) {
    issues.push({ line: 0, message: 'Missing description', severity: 'warning' });
  }
  
  // Check content
  if (universe.content.length === 0) {
    issues.push({ line: 0, message: 'No content boxes', severity: 'error' });
  }
  
  // Check for empty boxes
  universe.content.forEach((box: any, i: number) => {
    if (!box.data || box.data.trim() === '') {
      issues.push({ line: i + 1, message: `Box "${box.zone}" is empty`, severity: 'warning' });
    }
  });
  
  // Strict mode checks
  if (preset === 'strict') {
    if (!universe.layout.js) {
      issues.push({ line: 0, message: 'No JavaScript (required in strict mode)', severity: 'error' });
    }
    
    const wordCount = universe.content.reduce((sum: number, b: any) => sum + b.data.split(/\s+/).length, 0);
    if (wordCount < 50) {
      issues.push({ line: 0, message: 'Content too short for strict mode', severity: 'warning' });
    }
  }
  
  return issues;
}

function extractDesignTokens(css: string): { colors: string[]; fonts: string[]; spacing: string[] } {
  // Extract colors
  const colorRegex = /#[0-9a-fA-F]{3,8}|rgb\([^)]+\)|hsl\([^)]+\)/g;
  const colors = [...new Set((css.match(colorRegex) || []))].slice(0, 20);
  
  // Extract fonts
  const fontRegex = /font-family:\s*([^;]+)/g;
  const fonts = [...new Set((css.match(fontRegex) || []).map(f => f.replace('font-family:', '').trim()))].slice(0, 10);
  
  // Extract spacing
  const spacingRegex = /\d+(?:px|rem|em|%)|(?:var\(--[^)]+\))/g;
  const spacing = [...new Set((css.match(spacingRegex) || []))].slice(0, 20);
  
  return { colors, fonts, spacing };
}

export const analysisPlugin: Plugin = {
  id: 'analysis',
  name: 'Design Analysis',
  description: 'Lint, analyze, and extract design tokens from universes.',
  enabledByDefault: true,
  category: 'editing',
  tools,
  SettingsSection: () => (
    <div className="p-3 rounded-lg bg-[#0d1117] border border-[#30363d] space-y-2">
      <div className="text-[10px] font-mono text-[#8b949e] uppercase tracking-wider">Analysis</div>
      <p className="text-[10px] text-[#484f58]">Lint and analyze universes for quality, accessibility, and design tokens.</p>
    </div>
  ),
};

export default analysisPlugin;
