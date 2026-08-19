import type { ViewID, ViewMeta } from './types';

/**
 * Canonical registry of core views, in navigation order.
 * Plugins should not mutate this list; supplementary surfaces plug into
 * `Plugin.settingsSection` / `Plugin.panel` / `Plugin.canvasOverlay` instead.
 */
export const VIEWS: ViewMeta[] = [
  { id: 'explore', label: 'Explorar', icon: 'Orbit', tooltip: 'Browse content and universes', order: 0 },
  { id: 'hub', label: 'Hub', icon: 'Grid', tooltip: 'Hub Archive — community content', order: 1 },
  { id: 'edit', label: 'Content Wizard', icon: 'Edit3', tooltip: 'Craft content block by block', order: 2 },
  { id: 'forge', label: 'Forge', icon: 'Code', tooltip: 'Universe Forge live editor', order: 3 },
  { id: 'publish', label: 'Publish', icon: 'Send', tooltip: 'Publish to GitHub', order: 4 },
  { id: 'settings', label: 'Settings', icon: 'Settings', tooltip: 'Studio infrastructure & plugins', order: 5 },
];

/** Ordered view ids. */
export const VIEW_ORDER: ViewID[] = VIEWS.map(v => v.id);

/** Type guard for a string being a valid {@link ViewID}. */
export function isViewId(id: string | undefined): id is ViewID {
  return typeof id === 'string' && (VIEW_ORDER as readonly string[]).includes(id);
}

/** Look up view metadata by id. */
export function getViewMeta(id: ViewID): ViewMeta {
  return VIEWS.find(v => v.id === id) ?? VIEWS[0]!;
}
