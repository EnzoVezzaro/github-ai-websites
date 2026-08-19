import { useEffect, useState } from 'react';
import { lsGet, lsSet } from './storage';

export type ShortcutAction = 'explore' | 'hub' | 'wizard' | 'forge' | 'publish' | 'settings' | 'close' | 'shortcuts';

export interface ShortcutBinding {
  action: ShortcutAction;
  label: string;
  key: string;
}

const STORAGE_KEY = 'shortcuts.bindings.v3';

const DEFAULT_ORDER: Array<{ action: ShortcutAction; label: string }> = [
  { action: 'explore', label: 'Instrument' },
  { action: 'hub', label: 'Hub' },
  { action: 'wizard', label: 'Content Wizard' },
  { action: 'forge', label: 'Forge' },
  { action: 'publish', label: 'Publish' },
  { action: 'settings', label: 'Settings' },
  { action: 'close', label: 'Close modal' },
  { action: 'shortcuts', label: 'Shortcuts help' },
];

const FIXED_KEYS: Partial<Record<ShortcutAction, string>> = {
  close: 'Escape',
  shortcuts: '?',
};

const KEY_POOL = 'abcdefghijklmnopqrstuvwxyz';

/**
 * Pick the shortcut key for an action: start at the display name's first
 * letter and walk forward through the alphabet until an unused letter is found.
 */
function deriveKey(label: string, used: Set<string>): string {
  const start = (label[0] ?? 'a').toLowerCase();
  const startIdx = KEY_POOL.indexOf(start) >= 0 ? KEY_POOL.indexOf(start) : 0;
  for (let i = 0; i < 26; i++) {
    const candidate = KEY_POOL[(startIdx + i) % 26];
    if (!used.has(candidate)) return candidate;
  }
  return start;
}

function normalizeKey(key: string): string {
  const trimmed = key.trim();
  if (trimmed.toLowerCase() === 'escape') return 'Escape';
  return trimmed.length === 1 ? trimmed.toLowerCase() : trimmed;
}

/**
 * ShortcutsManager — assigns a key to every control-panel action (first letter
 * of the action name, next letter if taken), persists changes, and maps key
 * events → actions. Anyone can rebind a key from the settings.
 */
class ShortcutsManager {
  private bindings: Record<ShortcutAction, ShortcutBinding>;
  private listeners = new Set<(bindings: ShortcutBinding[]) => void>();

  constructor() {
    const saved = lsGet<Record<string, string>>(STORAGE_KEY) ?? {};
    const used = new Set<string>(Object.values(FIXED_KEYS).filter(Boolean) as string[]);
    const map = {} as Record<ShortcutAction, ShortcutBinding>;

    for (const def of DEFAULT_ORDER) {
      const fixed = FIXED_KEYS[def.action];
      let key = saved[def.action] ?? fixed ?? deriveKey(def.label, used);
      key = normalizeKey(key);
      used.add(key);
      map[def.action] = { action: def.action, label: def.label, key };
    }

    this.bindings = map;
    // Persist any keys that were assigned on first install.
    const persisted = lsGet<Record<string, string>>(STORAGE_KEY);
    if (!persisted) this.persist();
  }

  getBindings(): ShortcutBinding[] {
    return DEFAULT_ORDER.map(d => this.bindings[d.action]);
  }

  getKey(action: ShortcutAction): string {
    return this.bindings[action]?.key ?? '';
  }

  /** Rebind an action to a key. Returns false on collision. */
  setKey(action: ShortcutAction, key: string): boolean {
    const normalized = normalizeKey(key);
    if (!normalized) return false;
    const collides = this.getBindings().some(
      b => b.action !== action && b.key.toLowerCase() === normalized.toLowerCase()
    );
    if (collides) return false;
    this.bindings[action] = { ...this.bindings[action], key: normalized };
    this.persist();
    this.notify();
    return true;
  }

  onActiveChange(fn: (bindings: ShortcutBinding[]) => void): () => void {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }

  /** Map a keydown event to an action, if any binding matches. */
  handleKey(e: KeyboardEvent): ShortcutAction | null {
    const raw = e.key;
    const lower = raw.toLowerCase();
    for (const b of this.getBindings()) {
      if (b.key.toLowerCase() === lower) return b.action;
    }
    return null;
  }

  private persist(): void {
    const obj: Record<string, string> = {};
    for (const b of this.getBindings()) obj[b.action] = b.key;
    lsSet(STORAGE_KEY, obj);
  }

  private notify(): void {
    const all = this.getBindings();
    for (const fn of this.listeners) fn(all);
  }
}

export const shortcutsManager = new ShortcutsManager();

/** React hook that stays in sync with the shortcuts manager. */
export function useShortcuts(): { bindings: ShortcutBinding[]; setKey: (a: ShortcutAction, k: string) => boolean } {
  const [bindings, setBindings] = useState<ShortcutBinding[]>(shortcutsManager.getBindings());

  useEffect(() => shortcutsManager.onActiveChange(setBindings), []);

  return { bindings, setKey: shortcutsManager.setKey.bind(shortcutsManager) };
}
