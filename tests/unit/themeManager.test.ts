import { describe, it, expect, beforeEach } from 'vitest';
import { ThemeManager } from '../../src/themes/ThemeManager';
import { builtInThemes } from '../../src/themes';
import { minimalTheme } from '../../src/themes/themes/minimal';
import type { SpatialThemeBehavior } from '../../src/themes/types';

function makeTheme(id: string): SpatialThemeBehavior {
  return {
    id,
    name: id,
    description: '',
    visuals: { accent: '#000000', cardBackground: '', cardBorder: '', radius: 0 },
    motion: {
      drag: { type: 'spring' },
      snap: { type: 'spring' },
      release: { type: 'spring' },
    },
    effects: {
      gooey: false,
      metaballs: false,
      mergeThreshold: 0,
      glass: { blur: 0 },
      shadow: 0,
      dragScale: 1,
      connectionPulse: false,
    },
    connection: { enabled: false, threshold: 0 },
    transitions: {
      enter: { type: 'spring' },
      exit: { type: 'spring' },
      merge: { type: 'spring' },
      split: { type: 'spring' },
    },
  };
}

describe('ThemeManager', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('registers and retrieves themes', () => {
    const mgr = new ThemeManager();
    mgr.register(makeTheme('a'));
    mgr.register(makeTheme('b'));

    expect(mgr.getAll()).toHaveLength(2);
    expect(mgr.get('a')?.id).toBe('a');
    expect(mgr.isRegistered('b')).toBe(true);
    expect(mgr.isRegistered('nope')).toBe(false);
  });

  it('getActive falls back to the first registered theme', () => {
    const mgr = new ThemeManager();
    mgr.register(makeTheme('x'));
    expect(mgr.getActive()?.id).toBe('x');
  });

  it('setActive switches the theme and notifies subscribers', () => {
    const mgr = new ThemeManager();
    mgr.register(makeTheme('a'));
    mgr.register(makeTheme('b'));
    const seen: string[] = [];
    const unsub = mgr.onActiveChange((id) => seen.push(id));

    expect(mgr.setActive('b')).toBe(true);
    expect(mgr.getActiveId()).toBe('b');
    expect(seen).toEqual(['b']);

    unsub();
  });

  it('setActive rejects unknown themes', () => {
    const mgr = new ThemeManager();
    mgr.register(makeTheme('a'));

    expect(mgr.setActive('nope')).toBe(false);
    expect(mgr.getActiveId()).toBe('a');
  });

  it('registers all five built-in themes', () => {
    const mgr = new ThemeManager();
    mgr.registerAll(builtInThemes);

    const ids = mgr.getAll().map((t) => t.id).sort();
    expect(ids).toEqual(['brutalist', 'glass', 'gooey', 'minimal', 'organic']);
  });

  it('themes carry the expected behavioral contract', () => {
    // Minimal: no connection, no liquid effects.
    expect(minimalTheme.connection.enabled).toBe(false);
    expect(minimalTheme.effects.gooey).toBe(false);

    const gooey = builtInThemes.find((t) => t.id === 'gooey');
    expect(gooey?.connection.enabled).toBe(true);
    expect(gooey?.effects.gooey).toBe(true);
    expect(gooey?.effects.metaballs).toBe(true);
    expect(gooey?.connection.render).toBeTypeOf('function');

    const organic = builtInThemes.find((t) => t.id === 'organic');
    expect(organic?.connection.enabled).toBe(true);

    const brutalist = builtInThemes.find((t) => t.id === 'brutalist');
    expect(brutalist?.connection.enabled).toBe(false);
    expect(brutalist?.effects.gooey).toBe(false);
    expect(brutalist?.motion.drag.type).toBe('tween');
  });
});