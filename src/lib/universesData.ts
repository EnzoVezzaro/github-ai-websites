import type { Universe, ProjectContent, LayoutFiles, ContentBox } from '../types';

/**
 * Universe data loader.
 *
 * Canonical storage layout (mirror of `github-username-id > universe-id > universe files`):
 *
 *   universes/<owner-id>/<universe-id>/universe.json
 *
 * Each `universe.json` is a full `Universe` document. This module bundles them
 * via Vite's import.meta.glob so they are part of the module graph (works in
 * the browser build and in vitest).
 */
const GLOB = import.meta.glob('../../universes/**/universe.json', {
  eager: true,
  query: '?raw',
  import: 'default',
}) as Record<string, string>;

/** Owner for the bundled built-in universes (acts as a `github-username-id`). */
export const BUILTIN_OWNER = 'studio';

function parseUniverse(slug: string, raw: string): Universe | null {
  try {
    const parsed = JSON.parse(raw) as Partial<Universe>;
    if (!parsed.meta || !parsed.layout) return null;
    const id = slug;
    return {
      meta: {
        id,
        name: parsed.meta.name ?? id,
        slug: parsed.meta.slug ?? id,
        description: parsed.meta.description,
        author: parsed.meta.author ?? BUILTIN_OWNER,
        version: parsed.meta.version ?? '1.0',
        createdAt: parsed.meta.createdAt ?? new Date().toISOString(),
        updatedAt: parsed.meta.updatedAt ?? new Date().toISOString(),
      },
      content: parsed.content ?? {},
      layout: {
        html: parsed.layout.html ?? '',
        css: parsed.layout.css ?? '',
        js: parsed.layout.js,
      },
    };
  } catch {
    return null;
  }
}

/** All built-in universes loaded from disk, keyed in path order. */
export const DEFAULT_UNIVERSES: Universe[] = Object.entries(GLOB)
  .map(([path, raw]) => {
    // .../universes/<owner>/<id>/universe.json
    const parts = path.split('/');
    const id = parts[parts.length - 2];
    return parseUniverse(id, raw);
  })
  .filter((u): u is Universe => u !== null);

/** Concatenate the text boxes of a given content zone into a single string. */
function zoneText(content: Record<string, ContentBox[]>, zone: string): string {
  return (content[zone] ?? []).map((b) => b.data).join('\n\n');
}

/** Project view of a universe (content only) — used by the Studio/Explorer UI. */
export const defaultProjects: ProjectContent[] = DEFAULT_UNIVERSES.map((u) => ({
  id: u.meta.id,
  title: u.meta.name,
  slug: u.meta.slug,
  author: u.meta.author,
  intro: zoneText(u.content, 'intro'),
  story: zoneText(u.content, 'story'),
  ideas: zoneText(u.content, 'ideas'),
  media: zoneText(u.content, 'media'),
  closing: zoneText(u.content, 'closing'),
  updatedAt: u.meta.updatedAt,
}));

/** Layout view of a universe — used by the Studio/Explorer UI. */
export const defaultLayouts: LayoutFiles[] = DEFAULT_UNIVERSES.map((u) => ({
  meta: {
    id: u.meta.id,
    name: u.meta.name,
    author: u.meta.author,
    description: u.meta.description,
    version: u.meta.version,
    updatedAt: u.meta.updatedAt,
  },
  html: u.layout.html,
  css: u.layout.css,
  js: u.layout.js,
}));

/** Read a built-in universe by id. */
export function getDefaultUniverse(id: string): Universe | undefined {
  return DEFAULT_UNIVERSES.find((u) => u.meta.id === id);
}