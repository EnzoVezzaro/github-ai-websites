import type { Plugin } from './types';
import { lsGet, lsSet } from '../lib/storage';
import { toolRegistry } from './toolRegistry';

const STORAGE_KEY = 'plugins.enabled';

/**
 * Plugin Registry — manages plugin registration, enable/disable, and lifecycle.
 */
export class PluginRegistry {
  private plugins = new Map<string, Plugin>();
  private enabled = new Set<string>();
  private initialized = new Set<string>();

  constructor() {
    // Load saved enabled state
    const saved = lsGet<string[]>(STORAGE_KEY);
    if (saved) {
      saved.forEach(id => this.enabled.add(id));
    }
  }

  /** Register a plugin */
  register(plugin: Plugin): void {
    this.plugins.set(plugin.id, plugin);
    // If no saved state, use default
    if (!lsGet<string[]>(STORAGE_KEY)) {
      if (plugin.enabledByDefault) {
        this.enabled.add(plugin.id);
      }
    }
  }

  /** Register multiple plugins at once */
  registerAll(plugins: Plugin[]): void {
    plugins.forEach(p => this.register(p));
  }

  /** Enable a plugin */
  enable(id: string): void {
    const plugin = this.plugins.get(id);
    if (!plugin || this.enabled.has(id)) return;
    this.enabled.add(id);
    this.saveState();
    if (plugin.init && !this.initialized.has(id)) {
      plugin.init();
      this.initialized.add(id);
    }
    // Register tools
    if (plugin.tools) {
      toolRegistry.registerAll(plugin.tools);
    }
  }

  /** Disable a plugin */
  disable(id: string): void {
    const plugin = this.plugins.get(id);
    if (!plugin || !this.enabled.has(id) || plugin.locked) return;
    this.enabled.delete(id);
    this.saveState();
    if (plugin.destroy) {
      plugin.destroy();
    }
    // Unregister tools
    if (plugin.tools) {
      for (const tool of plugin.tools) {
        toolRegistry.unregister(tool.name);
      }
    }
    this.initialized.delete(id);
  }

  /** Toggle a plugin */
  toggle(id: string): void {
    const plugin = this.plugins.get(id);
    if (!plugin) return;
    if (this.enabled.has(id) && plugin.locked) return; // Can't disable locked plugin
    if (!this.enabled.has(id) && plugin.locked) {
      // Locked plugins are always enabled on startup, but can be toggled on
      this.enable(id);
      return;
    }
    if (this.enabled.has(id)) {
      this.disable(id);
    } else {
      this.enable(id);
    }
  }

  /** Check if a plugin is enabled */
  isEnabled(id: string): boolean {
    return this.enabled.has(id);
  }

  /** Get a plugin by id */
  get(id: string): Plugin | undefined {
    return this.plugins.get(id);
  }

  /** Get all registered plugins */
  getAll(): Plugin[] {
    return Array.from(this.plugins.values());
  }

  /** Get all enabled plugins */
  getEnabled(): Plugin[] {
    return this.getAll().filter(p => this.enabled.has(p.id));
  }

  /** Get plugins by category */
  getByCategory(category: Plugin['category']): Plugin[] {
    return this.getAll().filter(p => p.category === category);
  }

  /** Get all tools from enabled plugins */
  getTools(): Array<{ plugin: string; tools: NonNullable<Plugin['tools']> }> {
    return this.getEnabled()
      .filter(p => p.tools && p.tools.length > 0)
      .map(p => ({ plugin: p.id, tools: p.tools! }));
  }

  /** Initialize all enabled plugins */
  initAll(): void {
    this.getEnabled().forEach(plugin => {
      if (plugin.init && !this.initialized.has(plugin.id)) {
        plugin.init();
        this.initialized.add(plugin.id);
      }
      // Register tools
      if (plugin.tools) {
        toolRegistry.registerAll(plugin.tools);
      }
    });
  }

  /** Destroy all plugins */
  destroyAll(): void {
    this.getEnabled().forEach(plugin => {
      if (plugin.destroy) {
        plugin.destroy();
      }
      // Unregister tools
      if (plugin.tools) {
        for (const tool of plugin.tools) {
          toolRegistry.unregister(tool.name);
        }
      }
    });
    this.initialized.clear();
  }

  private saveState(): void {
    lsSet(STORAGE_KEY, Array.from(this.enabled));
  }
}

// Singleton registry
export const pluginRegistry = new PluginRegistry();
