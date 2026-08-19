import { lsGet, lsSet } from './storage';
import { DEFAULT_UNIVERSES } from './universesData';
import type { Universe, ContentBox } from '../types';

const ROOT = 'universes';

function userDir(githubId: string): string {
  return `${ROOT}/${githubId}`;
}

function universePath(githubId: string, universeId: string): string {
  return `${userDir(githubId)}/${universeId}`;
}

function indexKey(githubId: string): string {
  return `${userDir(githubId)}/index`;
}

export function createFolderKey(githubId?: string): string {
  return githubId || 'guest';
}

export function loadUniverses(githubId?: string): Universe[] {
  const id = githubId || 'guest';
  const idx = lsGet<string[]>(indexKey(id));
  if (idx && idx.length > 0) {
    return idx
      .map(uid => lsGet<Universe>(universePath(id, uid)))
      .filter(Boolean) as Universe[];
  }
  // Seed defaults
  const defaults = DEFAULT_UNIVERSES.map(u => {
    lsSet(universePath(id, u.meta.id), u);
    return u.meta.id;
  });
  lsSet(indexKey(id), defaults);
  return DEFAULT_UNIVERSES;
}

export function saveUniverse(universe: Universe, githubId?: string) {
  const id = githubId || 'guest';
  lsSet(universePath(id, universe.meta.id), universe);
  // Update index
  const idx = lsGet<string[]>(indexKey(id)) || [];
  if (!idx.includes(universe.meta.id)) {
    idx.push(universe.meta.id);
    lsSet(indexKey(id), idx);
  }
}

export function deleteUniverse(universeId: string, githubId?: string) {
  const id = githubId || 'guest';
  localStorage.removeItem(`${localStorage.getItem('random-web:') ? 'random-web:' : ''}${universePath(id, universeId)}`);
  const idx = (lsGet<string[]>(indexKey(id)) || []).filter(uid => uid !== universeId);
  lsSet(indexKey(id), idx);
}

export function getUniverse(universeId: string, githubId?: string): Universe | undefined {
  const id = githubId || 'guest';
  return lsGet<Universe>(universePath(id, universeId)) || undefined;
}

export function upsertUniverse(universe: Universe, githubId?: string): Universe[] {
  saveUniverse(universe, githubId);
  return loadUniverses(githubId);
}

export function createUniverse(
  name: string,
  description: string,
  html: string,
  css: string,
  js?: string,
  githubId?: string
): Universe {
  return {
    meta: {
      id: `universe-${Date.now()}`,
      name,
      slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      description,
      author: githubId || 'You',
      version: '1.0',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    content: {},
    layout: { html, css, js },
    composition: {
      objects: {},
      zones: {},
      relationships: {}
    }
  };
}

function zoneText(content: Record<string, ContentBox[]>, zone: string): string {
  return (content[zone] ?? []).map((b) => b.data).join('\n\n');
}

export function universeToPreviewData(universe: Universe) {
  return {
    project: {
      id: universe.meta.id,
      title: universe.meta.name,
      slug: universe.meta.slug,
      author: universe.meta.author,
      intro: zoneText(universe.content, 'intro'),
      story: zoneText(universe.content, 'story'),
      ideas: zoneText(universe.content, 'ideas'),
      media: zoneText(universe.content, 'media'),
      closing: zoneText(universe.content, 'closing'),
      updatedAt: universe.meta.updatedAt,
    },
    layout: {
      meta: {
        id: universe.meta.id,
        name: universe.meta.name,
        author: universe.meta.author,
        description: universe.meta.description,
        version: universe.meta.version,
        updatedAt: universe.meta.updatedAt,
      },
      html: universe.layout.html,
      css: universe.layout.css,
      js: universe.layout.js,
    },
  };
}
